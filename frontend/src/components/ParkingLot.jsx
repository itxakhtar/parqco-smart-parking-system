import SlotBay from './SlotBay.jsx';

const BAYS_PER_ROW = 5;

/**
 * Draws bays in two facing rows with a driving lane between them – like a real lot.
 * getStatus(slot) tells each bay how to look; onSelect makes bays clickable.
 */
export default function ParkingLot({ slots, getStatus, onSelect, selectedId, isDisabled, getHint }) {
  const rows = [];
  for (let index = 0; index < slots.length; index += BAYS_PER_ROW) rows.push(slots.slice(index, index + BAYS_PER_ROW));

  const renderRow = (row) => (
    <div className="lot__row">
      {row.map((slot) => (
        <SlotBay
          key={slot.slotId}
          slot={slot}
          status={getStatus(slot)}
          selected={selectedId === slot.slotId}
          disabled={isDisabled ? isDisabled(slot) : false}
          hint={getHint ? getHint(slot) : undefined}
          onSelect={onSelect}
        />
      ))}
    </div>
  );

  return (
    <div className="lot">
      {rows.map((row, index) => (
        <div key={index} className="lot__section">
          {renderRow(row)}
          {index < rows.length - 1 && index % 2 === 0 && <div className="lot__lane" aria-hidden="true"><span>Driving lane</span></div>}
        </div>
      ))}
    </div>
  );
}
