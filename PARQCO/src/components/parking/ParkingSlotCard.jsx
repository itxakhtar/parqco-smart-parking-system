import { SLOT_STATUS_LABELS } from "../../utils/constants";

// One slot tile. Props: slot = { slot_id, status }
function ParkingSlotCard({ slot }) {
  return (
    <div className={`slot slot-${slot.status}`} role="listitem" aria-label={`Slot ${slot.slot_id}, ${SLOT_STATUS_LABELS[slot.status]}`}>
      <strong>{slot.slot_id}</strong>
      <span>{SLOT_STATUS_LABELS[slot.status]}</span>
    </div>
  );
}

export default ParkingSlotCard;
