import SensorData from '../models/SensorData.js';
import Slot from '../models/Slot.js';
import Prediction from '../models/Prediction.js';
import { env } from '../config/env.js';

/**
 * ML FORECAST (SDD §5.4)
 * ----------------------
 * Model: "seasonal average + linear trend".
 *   1. Pull the last 28 days of sensor readings.
 *   2. Compute the occupancy ratio for every (day, hour).
 *   3. Average those ratios per hour, separately for weekdays and weekends  -> daily pattern.
 *   4. Compare the last 7 days with the 21 days before to get a trend factor  -> growth/decline.
 *   5. forecast(hour) = pattern(hour) * trend
 *
 * It is deliberately simple and explainable. To upgrade to ARIMA/LSTM, replace
 * `buildHourlyPattern` and keep the same return shape – the API and UI will not change.
 */

const HISTORY_DAYS = 28;
const MODEL_VERSION = 'seasonal-trend-v1';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const hourLabel = (hour) => {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 === 0 ? 12 : hour % 12} ${suffix}`;
};

/** Returns one row per (day, hour) with the average occupancy ratio (0..1). */
async function loadDailyHourRatios() {
  const since = new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
  const timezone = env.timezone;
  return SensorData.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp', timezone } },
          hour: { $hour: { date: '$timestamp', timezone } },
          dayOfWeek: { $dayOfWeek: { date: '$timestamp', timezone } }, // 1 = Sunday … 7 = Saturday
        },
        ratio: { $avg: '$occupied' },
      },
    },
  ]);
}

const isWeekend = (dayOfWeek) => dayOfWeek === 1 || dayOfWeek === 7;
const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const standardDeviation = (values) => {
  const mean = average(values);
  return Math.sqrt(average(values.map((v) => (v - mean) ** 2)));
};

/** Trend factor: >1 means demand is growing compared with the previous weeks. */
function computeTrend(rows) {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const recent = rows.filter((row) => row._id.day >= cutoff).map((row) => row.ratio);
  const older = rows.filter((row) => row._id.day < cutoff).map((row) => row.ratio);
  if (!recent.length || !older.length || average(older) === 0) return 1;
  return clamp(average(recent) / average(older), 0.85, 1.15);
}

/** Builds the 24 hourly forecast points for today. */
async function buildHourlyPattern() {
  const rows = await loadDailyHourRatios();
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'short', timeZone: env.timezone });
  const todayIsWeekend = todayName === 'Sat' || todayName === 'Sun';
  const trend = computeTrend(rows);

  const points = Array.from({ length: 24 }, (_, hour) => {
    const samples = rows.filter(
      (row) => row._id.hour === hour && isWeekend(row._id.dayOfWeek) === todayIsWeekend
    );
    const ratios = samples.map((row) => row.ratio);
    const occupancy = clamp(average(ratios) * trend * 100, 0, 100);

    // Confidence rises with the number of days observed and falls with day-to-day variance
    const dataConfidence = clamp(samples.length / 8, 0, 1) * 100;
    const stability = 100 - clamp(standardDeviation(ratios) * 100, 0, 40);
    const confidence = Math.round((dataConfidence * 0.4 + stability * 0.6) * 0.98);

    return { hour, label: hourLabel(hour), occupancy: Math.round(occupancy), confidence };
  });

  return { points, trend, sampleDays: new Set(rows.map((row) => row._id.day)).size };
}

/** Finds the busiest two-hour window. */
function findPeakWindow(points) {
  let best = { start: 0, occupancy: -1 };
  for (let hour = 0; hour < 23; hour += 1) {
    const windowAverage = (points[hour].occupancy + points[hour + 1].occupancy) / 2;
    if (windowAverage > best.occupancy) best = { start: hour, occupancy: windowAverage };
  }
  return {
    startHour: best.start,
    endHour: best.start + 2,
    label: `${hourLabel(best.start)} – ${hourLabel((best.start + 2) % 24)}`,
    occupancy: Math.round(best.occupancy),
  };
}

function buildInsights(points, peak, trend) {
  const insights = [];
  insights.push(`Expect the busiest period between ${peak.label}, around ${peak.occupancy}% full.`);

  const quietest = points
    .filter((point) => point.hour >= 7 && point.hour <= 21)
    .reduce((min, point) => (point.occupancy < min.occupancy ? point : min));
  insights.push(`${quietest.label} is the calmest daytime hour (about ${quietest.occupancy}% full).`);

  if (trend > 1.03) insights.push('Demand is up compared with the previous three weeks. Book early.');
  else if (trend < 0.97) insights.push('Demand is slightly lower than the previous three weeks.');
  else insights.push('Demand is steady compared with the previous three weeks.');
  return insights;
}

/** Public: forecast for today, also cached in the Prediction collection. */
export async function getTodayForecast() {
  const { points, trend, sampleDays } = await buildHourlyPattern();
  const peak = findPeakWindow(points);
  const totalSlots = await Slot.countDocuments({ status: { $ne: 'maintenance' } });

  const date = new Date().toLocaleDateString('en-CA', { timeZone: env.timezone }); // YYYY-MM-DD
  await Prediction.bulkWrite(
    points.map((point) => ({
      updateOne: {
        filter: { date, hour: point.hour },
        update: {
          $set: {
            predictedOccupancy: point.occupancy,
            confidence: point.confidence,
            modelVersion: MODEL_VERSION,
          },
        },
        upsert: true,
      },
    }))
  );

  return {
    date,
    modelVersion: MODEL_VERSION,
    sampleDays,
    totalSlots,
    points,
    peak,
    insights: buildInsights(points, peak, trend),
  };
}

/** Public: busiest hour for each day of the week (for the weekly chart). */
export async function getWeeklyPeaks() {
  const since = new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
  const timezone = env.timezone;
  const rows = await SensorData.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: {
          dayOfWeek: { $dayOfWeek: { date: '$timestamp', timezone } },
          hour: { $hour: { date: '$timestamp', timezone } },
        },
        ratio: { $avg: '$occupied' },
      },
    },
  ]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames.map((name, index) => {
    const dayRows = rows.filter((row) => row._id.dayOfWeek === index + 1);
    if (!dayRows.length) return { day: name, peakHour: null, peakLabel: '–', occupancy: 0 };
    const busiest = dayRows.reduce((max, row) => (row.ratio > max.ratio ? row : max));
    return {
      day: name,
      peakHour: busiest._id.hour,
      peakLabel: hourLabel(busiest._id.hour),
      occupancy: Math.round(busiest.ratio * 100),
    };
  });
}
