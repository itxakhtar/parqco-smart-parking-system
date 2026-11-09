import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { Alert, EmptyState, Loading } from '../components/Feedback.jsx';
import SlipButton from '../components/SlipButton.jsx';
import { errorMessage, formatDateTime, formatMoney } from '../utils/format.js';

export default function MyBookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.bookings);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (booking) => {
    if (!window.confirm(`Cancel your booking for slot ${booking.slotId}?`)) return;
    setError('');
    try {
      await api.delete(`/bookings/${booking._id}`);
      setMessage('Booking cancelled.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const visible = bookings.filter((booking) => (tab === 'upcoming' ? booking.status === 'confirmed' : booking.status !== 'confirmed'));

  if (loading) return <Loading />;

  return (
    <div className="container page">
      <PageHeader title="My bookings" subtitle="Reservations you have made." actions={<Link to="/book" className="btn btn-primary">New booking</Link>} />
      <Alert type="success">{message}</Alert>
      <Alert>{error}</Alert>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'upcoming'} className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button role="tab" aria-selected={tab === 'past'} className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>Past and cancelled</button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={tab === 'upcoming' ? 'No upcoming bookings' : 'Nothing here yet'}
          message={tab === 'upcoming' ? 'Reserve a bay and it will show up here.' : 'Completed and cancelled bookings appear here.'}
          action={tab === 'upcoming' ? <Link to="/book" className="btn btn-primary">Book a slot</Link> : null}
        />
      ) : (
        <ul className="booking-list">
          {visible.map((booking) => (
            <li key={booking._id} className="booking-item">
              <div className="booking-item__slot">{booking.slotId}</div>
              <div className="booking-item__info">
                <strong>{formatDateTime(booking.startTime)} to {formatDateTime(booking.endTime)}</strong>
                <span>{booking.challanNumber || 'Challan pending'} · {booking.vehiclePlate || 'No vehicle number'} · {formatMoney(booking.amount)}</span>
                {booking.driverName && <span>Driver: {booking.driverName}</span>}
              </div>
              <span className={`pill pill--${booking.status}`}>{booking.status}</span>
              <SlipButton bookingId={booking._id} challanNumber={booking.challanNumber} />
              {booking.status === 'confirmed' && <button className="btn btn-ghost btn-sm" onClick={() => cancel(booking)}>Cancel</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
