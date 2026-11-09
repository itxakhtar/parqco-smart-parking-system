import { useCallback, useEffect, useState } from 'react';
import api from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import SlipButton from '../../components/SlipButton.jsx';
import { Alert, Loading } from '../../components/Feedback.jsx';
import { errorMessage, formatDateTime, formatMoney } from '../../utils/format.js';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setBookings((await api.get('/bookings')).data.bookings);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (booking) => {
    if (!window.confirm(`Cancel booking for slot ${booking.slotId}?`)) return;
    try {
      await api.delete(`/bookings/${booking._id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (loading) return <Loading />;

  const columns = [
    { header: 'Challan', render: (b) => b.challanNumber || '–' },
    { header: 'Driver', render: (b) => <><strong>{b.driverName || b.user?.name || 'Deleted user'}</strong><br /><span className="muted small">{b.user?.email}</span></> },
    { header: 'Slot', render: (b) => b.slotId },
    { header: 'Vehicle', render: (b) => b.vehiclePlate || '–' },
    { header: 'Time', render: (b) => `${formatDateTime(b.startTime)} to ${formatDateTime(b.endTime)}` },
    { header: 'Amount', render: (b) => formatMoney(b.amount) },
    { header: 'Status', render: (b) => <span className={`pill pill--${b.status}`}>{b.status}</span> },
    { header: 'Actions', render: (b) => (
      <>
        <SlipButton bookingId={b._id} challanNumber={b.challanNumber} />
        {b.status === 'confirmed' && <button className="btn btn-ghost btn-sm" onClick={() => cancel(b)}>Cancel</button>}
      </>
    ) },
  ];

  return (
    <>
      <PageHeader title="Bookings" subtitle="The 200 most recent reservations." />
      <Alert>{error}</Alert>
      <DataTable columns={columns} rows={bookings} emptyTitle="No bookings yet" />
    </>
  );
}
