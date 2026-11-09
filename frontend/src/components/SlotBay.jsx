import { Car, Clock, Wrench } from 'lucide-react';

const STATUS_LABEL = { available: 'Available', occupied: 'Occupied', reserved: 'Reserved', maintenance: 'Maintenance' };

/**
 * One parking bay, drawn like painted lines on asphalt.
 * status: available | occupied | reserved | maintenance
 */
export default function SlotBay({ slot, status, selected = false, disabled = false, onSelect, hint }) {
  const icon = status === 'occupied' ? <Car size={22} /> : status === 'reserved' ? <Clock size={20} /> : status === 'maintenance' ? <Wrench size={20} /> : null;
  const clickable = Boolean(onSelect) && !disabled;

  return (
    <button
      type="button"
      className={`bay bay--${status} ${selected ? 'is-selected' : ''}`}
      onClick={clickable ? () => onSelect(slot) : undefined}
      disabled={!clickable}
      aria-pressed={selected}
      aria-label={`Slot ${slot.slotId}, ${hint || STATUS_LABEL[status]}`}
      title={hint || STATUS_LABEL[status]}
    >
      <span className="bay__icon">{icon}</span>
      <span className="bay__id">{slot.slotId}</span>
    </button>
  );
}
