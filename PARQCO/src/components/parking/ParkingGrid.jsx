import ParkingSlotCard from "./ParkingSlotCard";

function ParkingGrid({ slots }) {
  if (slots.length === 0) return <p>No slots match the current filters.</p>;
  return (
    <div className="slot-grid" role="list">
      {slots.map((slot) => <ParkingSlotCard key={slot.slot_id} slot={slot} />)}
    </div>
  );
}

export default ParkingGrid;
