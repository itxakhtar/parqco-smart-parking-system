// Tabs to switch between parking floors.
export default function FloorTabs({ floors, active, onChange }) {
  return (
    <div className="tabs" role="tablist" aria-label="Parking floors">
      {floors.map((floor) => (
        <button key={floor} role="tab" aria-selected={active === floor} className={active === floor ? 'active' : ''} onClick={() => onChange(floor)}>
          {floor === 1 ? 'Ground floor' : `Floor ${floor}`}
        </button>
      ))}
    </div>
  );
}
