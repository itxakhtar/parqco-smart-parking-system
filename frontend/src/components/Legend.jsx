export default function Legend({ items = ['available', 'occupied', 'reserved'] }) {
  const labels = { available: 'Available', occupied: 'Occupied', reserved: 'Reserved', maintenance: 'Maintenance', selected: 'Your choice' };
  return (
    <ul className="legend" aria-label="Legend">
      {items.map((item) => (
        <li key={item}><i className={`legend__dot legend__dot--${item}`} />{labels[item]}</li>
      ))}
    </ul>
  );
}
