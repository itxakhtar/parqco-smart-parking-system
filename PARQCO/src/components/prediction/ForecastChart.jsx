// Simple SVG line chart (no chart library). points: [{ hour, value }] with value in 0-100.
const WIDTH = 600;
const HEIGHT = 220;
const PAD = { left: 36, right: 12, top: 12, bottom: 28 };

function ForecastChart({ points }) {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (i / (points.length - 1)) * innerW;
  const y = (v) => PAD.top + innerH - (v / 100) * innerH;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const peak = points.reduce((best, p) => (p.value > best.value ? p : best), points[0]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="forecast-chart"
      role="img"
      aria-label={`Sample occupancy forecast. Highest value ${peak.value}% at ${peak.hour}.`}
    >
      {[0, 50, 100].map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} className="chart-grid" />
          <text x={PAD.left - 6} y={y(tick) + 4} textAnchor="end" className="chart-label">{tick}%</text>
        </g>
      ))}
      <path d={path} className="chart-line" fill="none" />
      {points.map((p, i) => (
        <g key={p.hour}>
          <circle cx={x(i)} cy={y(p.value)} r={p === peak ? 5 : 3} className={p === peak ? "chart-peak" : "chart-dot"} />
          <text x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="chart-label">{p.hour}</text>
        </g>
      ))}
    </svg>
  );
}

export default ForecastChart;
