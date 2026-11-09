// Count tiles. items: [{ label, value, tone? }]
function ParkingSummary({ items }) {
  return (
    <div className="summary-grid">
      {items.map((item) => (
        <div key={item.label} className={`summary-item ${item.tone ? `tone-${item.tone}` : ""}`.trim()}>
          <span className="summary-value">{item.value}</span>
          <span className="summary-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default ParkingSummary;
