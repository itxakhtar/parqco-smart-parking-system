import { asyncHandler } from '../utils/asyncHandler.js';
import { getTodayForecast, getWeeklyPeaks } from '../services/predictionService.js';

export const todayForecast = asyncHandler(async (_req, res) => {
  res.json({ success: true, forecast: await getTodayForecast() });
});

export const weeklyPeaks = asyncHandler(async (_req, res) => {
  res.json({ success: true, weekly: await getWeeklyPeaks() });
});
