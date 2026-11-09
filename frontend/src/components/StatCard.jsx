export default function StatCard({ label, value, tone = 'neutral', note, icon: Icon }) {
  return (
    <div className={`stat stat--${tone}`}>
      <div className="stat__top">
        <span className="stat__label">{label}</span>
        {Icon && <Icon size={18} />}
      </div>
      <strong className="stat__value">{value}</strong>
      {note && <span className="stat__note">{note}</span>}
    </div>
  );
}
