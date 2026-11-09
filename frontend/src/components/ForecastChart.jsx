import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** Hourly occupancy forecast with the peak window shaded. compact=true is the small dashboard version. */
export default function ForecastChart({ forecast, compact = false }) {
  const currentHour = new Date().getHours();
  const { peak } = forecast;

  return (
    <ResponsiveContainer width="100%" height={compact ? 140 : 320}>
      <AreaChart data={forecast.points} margin={{ top: 8, right: 8, left: compact ? -32 : -12, bottom: 0 }}>
        <defs>
          <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16191F" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#16191F" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {!compact && <CartesianGrid stroke="#E3E5E1" vertical={false} />}
        <XAxis dataKey="hour" tickFormatter={(hour) => (hour % 6 === 0 ? forecast.points[hour].label : '')} tickLine={false} axisLine={false} fontSize={12} />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} fontSize={12} hide={compact} />
        <ReferenceArea x1={peak.startHour} x2={Math.min(peak.endHour, 23)} fill="#F2B705" fillOpacity={0.28} />
        <ReferenceLine x={currentHour} stroke="#D64545" strokeDasharray="4 4" />
        <Tooltip formatter={(value) => [`${value}% full`, 'Forecast']} labelFormatter={(hour) => forecast.points[hour].label} />
        <Area type="monotone" dataKey="occupancy" stroke="#16191F" strokeWidth={2.5} fill="url(#occupancyFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
