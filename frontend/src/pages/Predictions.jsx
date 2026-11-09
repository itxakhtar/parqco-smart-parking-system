import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Lightbulb } from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import ForecastChart from '../components/ForecastChart.jsx';
import { Alert, Loading } from '../components/Feedback.jsx';
import { errorMessage } from '../utils/format.js';

export default function Predictions() {
  const [forecast, setForecast] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/predictions/today'), api.get('/predictions/weekly')])
      .then(([today, week]) => {
        setForecast(today.data.forecast);
        setWeekly(week.data.weekly);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <div className="container page"><Alert>{error}</Alert></div>;
  if (!forecast) return <Loading label="Running the forecast…" />;

  const averageConfidence = Math.round(forecast.points.reduce((sum, point) => sum + point.confidence, 0) / forecast.points.length);

  return (
    <div className="container page">
      <PageHeader title="Parking forecast" subtitle={`Predicted occupancy for today, learned from ${forecast.sampleDays} days of sensor data.`} />

      <div className="stats">
        <StatCard label="Busiest window" value={forecast.peak.label} note="Highest expected demand" />
        <StatCard label="Peak occupancy" value={`${forecast.peak.occupancy}%`} tone="busy" note="Share of slots in use" />
        <StatCard label="Model confidence" value={`${averageConfidence}%`} tone="free" note={`Model ${forecast.modelVersion}`} />
      </div>

      <section className="card">
        <div className="card__head">
          <h2>Hourly occupancy today</h2>
          <ul className="legend">
            <li><i className="legend__dot legend__dot--peak" />Peak window</li>
            <li><i className="legend__dot legend__dot--now" />Now</li>
          </ul>
        </div>
        <ForecastChart forecast={forecast} />
      </section>

      <div className="two-col">
        <section className="card">
          <h2>What to expect</h2>
          <ul className="insights">
            {forecast.insights.map((insight) => (
              <li key={insight}><Lightbulb size={18} /><span>{insight}</span></li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Busiest hour by weekday</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#E3E5E1" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={(value, _name, item) => [`${value}% at ${item.payload.peakLabel}`, 'Peak']} />
              <Bar dataKey="occupancy" fill="#16191F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
