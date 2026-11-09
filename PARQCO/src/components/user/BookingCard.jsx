import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";

// One booking row. onCancel is optional (only for upcoming bookings).
function BookingCard({ booking, onCancel }) {
  return (
    <div className="booking-card">
      <div>
        <strong>Slot {booking.slot_id}</strong>
        <p className="muted">{booking.date}, {booking.start} to {booking.end}</p>
      </div>
      <div className="booking-card-side">
        <StatusBadge status={booking.status} />
        {onCancel && <Button size="sm" variant="secondary" onClick={() => onCancel(booking._id)}>Cancel</Button>}
      </div>
    </div>
  );
}

export default BookingCard;
