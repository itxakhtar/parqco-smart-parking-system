import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import SlipButton from './SlipButton.jsx';

/** Shown right after a booking succeeds: the challan with driver name and vehicle registration number. */
export default function BookingConfirmation({ slip, bookingId, onBookAnother }) {
  const rows = [
    ['Driver name', slip.driverName],
    ['Vehicle reg. no.', slip.vehicleNumber],
    ['Slot', `${slip.slotId} · Floor ${slip.floor} · ${slip.zone}`],
    ['Arrive', slip.start],
    ['Leave', slip.end],
    ['Duration', slip.duration],
    ['Amount', slip.amount],
  ];

  return (
    <div className="container page">
      <section className="card receipt">
        <CheckCircle2 size={40} className="receipt__icon" />
        <h1>Booking confirmed</h1>
        <p className="muted">Show this challan at the parking entrance. A copy was also sent to {slip.email}.</p>

        <div className="receipt__challan">
          <span>Challan number</span>
          <strong>{slip.challanNumber}</strong>
        </div>

        <dl className="summary__list receipt__list">
          {rows.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>

        <div className="receipt__actions">
          <SlipButton bookingId={bookingId} challanNumber={slip.challanNumber} className="btn btn-primary" label="Download slip (PDF)" />
          <Link to="/bookings" className="btn btn-ghost">My bookings</Link>
          <button type="button" className="btn btn-ghost" onClick={onBookAnother}>Book another slot</button>
        </div>
      </section>
    </div>
  );
}
