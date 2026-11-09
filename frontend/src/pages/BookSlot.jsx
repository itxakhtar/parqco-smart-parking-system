import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import BookingConfirmation from '../components/BookingConfirmation.jsx';
import PageHeader from '../components/PageHeader.jsx';
import FloorTabs from '../components/FloorTabs.jsx';
import ParkingLot from '../components/ParkingLot.jsx';
import Legend from '../components/Legend.jsx';
import { Alert } from '../components/Feedback.jsx';
import { errorMessage, formatDateTime, formatMoney, roundUpToNextHalfHour, toInputValue } from '../utils/format.js';

const DURATIONS = [1, 2, 3, 4, 6, 8, 12, 24];

export default function BookSlot() {
  const { user } = useAuth();

  const [start, setStart] = useState(toInputValue(roundUpToNextHalfHour()));
  const [hours, setHours] = useState(2);
  const [plate, setPlate] = useState('');
  const [driverName, setDriverName] = useState(user?.name || '');
  const [confirmation, setConfirmation] = useState(null); // { slip, bookingId } after a successful booking
  const [floor, setFloor] = useState(1);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // End time is always start + duration
  const startDate = useMemo(() => new Date(start), [start]);
  const endDate = useMemo(() => new Date(startDate.getTime() + hours * 60 * 60 * 1000), [startDate, hours]);

  // Whenever the time window changes, ask the server which slots are free for it
  const loadAvailability = useCallback(() => {
    if (Number.isNaN(startDate.getTime())) return;
    api
      .get('/slots/availability', { params: { start: startDate.toISOString(), end: endDate.toISOString() } })
      .then((response) => {
        setSlots(response.data.slots);
        setSelected((current) => (current && response.data.slots.find((s) => s.slotId === current.slotId && s.bookable) ? current : null));
      })
      .catch((err) => setError(errorMessage(err)));
  }, [startDate, endDate]);

  useEffect(() => { loadAvailability(); }, [loadAvailability]);

  const floors = useMemo(() => [...new Set(slots.map((slot) => slot.floor))].sort(), [slots]);
  const floorSlots = slots.filter((slot) => slot.floor === floor);
  const freeCount = slots.filter((slot) => slot.bookable).length;
  const total = selected ? hours * selected.hourlyRate : 0;

  const handleConfirm = async () => {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        slotId: selected.slotId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        vehiclePlate: plate,
        driverName: driverName.trim() || undefined,
      });
      setConfirmation({ slip: data.slip, bookingId: data.booking._id });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const bookAnother = () => {
    setConfirmation(null);
    setSelected(null);
    setPlate('');
    loadAvailability(); // the slot just booked must now show as taken
  };

  if (confirmation) return <BookingConfirmation {...confirmation} onBookAnother={bookAnother} />;

  const canConfirm = selected && plate.trim().length >= 3 && !submitting;

  return (
    <div className="container page">
      <PageHeader title="Book a slot" subtitle="Choose when you will arrive, then pick a free bay." />

      <div className="booking-grid">
        <div className="stack">
          <section className="card">
            <h2>When do you need it?</h2>
            <div className="form form--row">
              <label className="field">
                <span>Arrival</span>
                <input className="input" type="datetime-local" value={start} min={toInputValue(new Date())} onChange={(e) => setStart(e.target.value)} />
              </label>
              <label className="field">
                <span>Duration</span>
                <select className="input" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                  {DURATIONS.map((value) => <option key={value} value={value}>{value} {value === 1 ? 'hour' : 'hours'}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Driver name</span>
                <input className="input" autoComplete="name" placeholder="Name on the challan" value={driverName} maxLength={80} onChange={(e) => setDriverName(e.target.value)} />
              </label>
              <label className="field">
                <span>Vehicle registration number</span>
                <input className="input" placeholder="LEA-1234" value={plate} maxLength={12} onChange={(e) => setPlate(e.target.value.toUpperCase())} />
              </label>
            </div>
          </section>

          <section className="card">
            <div className="card__head">
              <h2>Pick a bay <small>{freeCount} free for this time</small></h2>
              <FloorTabs floors={floors} active={floor} onChange={setFloor} />
            </div>
            <ParkingLot
              slots={floorSlots}
              selectedId={selected?.slotId}
              onSelect={setSelected}
              isDisabled={(slot) => !slot.bookable}
              getStatus={(slot) => (slot.bookable ? 'available' : slot.status === 'maintenance' ? 'maintenance' : slot.unavailableReason === 'Occupied now' ? 'occupied' : 'reserved')}
              getHint={(slot) => (slot.bookable ? `Available · ${formatMoney(slot.hourlyRate)}/hour` : slot.unavailableReason)}
            />
            <Legend items={['available', 'occupied', 'reserved', 'selected']} />
          </section>
        </div>

        <aside className="summary card">
          <h2>Booking summary</h2>
          {selected ? (
            <dl className="summary__list">
              <div><dt>Slot</dt><dd>{selected.slotId} · {selected.zone}</dd></div>
              <div><dt>Arrive</dt><dd>{formatDateTime(startDate)}</dd></div>
              <div><dt>Leave</dt><dd>{formatDateTime(endDate)}</dd></div>
              <div><dt>Rate</dt><dd>{formatMoney(selected.hourlyRate)} / hour</dd></div>
              <div className="summary__total"><dt>Total</dt><dd>{formatMoney(total)}</dd></div>
            </dl>
          ) : (
            <p className="muted">Select a free bay on the map to see your price.</p>
          )}
          <Alert>{error}</Alert>
          <button className="btn btn-primary btn-block" disabled={!canConfirm} onClick={handleConfirm}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
          {selected && plate.trim().length < 3 && <p className="muted small">Enter your vehicle registration number to continue.</p>}
        </aside>
      </div>
    </div>
  );
}
