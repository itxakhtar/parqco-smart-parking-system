import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, CircleCheck, Clock, Gauge } from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLiveSlots } from '../components/useLiveSlots.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import FloorTabs from '../components/FloorTabs.jsx';
import ParkingLot from '../components/ParkingLot.jsx';
import Legend from '../components/Legend.jsx';
import ForecastChart from '../components/ForecastChart.jsx';
import { Alert, Loading } from '../components/Feedback.jsx';
import { formatDateTime } from '../utils/format.js';
import ChatAssistant from '../components/ChatAssistant';

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const { slots, loading, error, connected } = useLiveSlots();
  const [floor, setFloor] = useState(1);
  const [forecast, setForecast] = useState(null);
  const [upcoming, setUpcoming] = useState([]);

  // Forecast + the driver's next bookings (loaded once)
  useEffect(() => {
    api.get('/predictions/today').then((r) => setForecast(r.data.forecast)).catch(() => {});
    api
      .get('/bookings/my')
      .then((r) => setUpcoming(r.data.bookings.filter((b) => b.status === 'confirmed').reverse().slice(0, 3)))
      .catch(() => {});
  }, []);

  const floors = useMemo(() => [...new Set(slots.map((slot) => slot.floor))].sort((a, b) => a - b), [slots]);
  const floorSlots = slots.filter((slot) => slot.floor === floor);
  const count = (status) => slots.filter((slot) => slot.liveStatus === status).length;

  if (loading) return <Loading label="Loading the live lot…" />;

  return (
    <div className="container page">
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        subtitle="Here is what the lot looks like right now."
        actions={
          <>
            <span className={`live-badge ${connected ? '' : 'is-offline'}`}><span className="live-dot" />{connected ? 'Live' : 'Reconnecting…'}</span>
            <Link to="/book" className="btn btn-primary">Book a slot</Link>
          </>
        }
      />
      <Alert>{error}</Alert>

      <div className="stats">
        <StatCard label="Total slots" value={slots.length} icon={Gauge} />
        <StatCard label="Available" value={count('available')} tone="free" icon={CircleCheck} />
        <StatCard label="Occupied" value={count('occupied')} tone="busy" icon={CarFront} />
        <StatCard label="Reserved" value={count('reserved')} tone="reserved" icon={Clock} />
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="card__head">
            <h2>Live parking map</h2>
            <FloorTabs floors={floors} active={floor} onChange={setFloor} />
          </div>
          <ParkingLot slots={floorSlots} getStatus={(slot) => slot.liveStatus} />
          <Legend items={['available', 'occupied', 'reserved', 'maintenance']} />
        </section>

        <aside className="stack">
          <section className="card">
            <h2>Today’s forecast</h2>
            {forecast ? (
              <>
                <p className="forecast-peak"><strong>{forecast.peak.occupancy}%</strong> full between {forecast.peak.label}</p>
                <ForecastChart forecast={forecast} compact />
                <Link to="/predictions" className="link">See the full forecast</Link>
              </>
            ) : (
              <p className="muted">Loading forecast…</p>
            )}
          </section>

          <section className="card">
            <h2>Your next bookings</h2>
            {upcoming.length === 0 ? (
              <p className="muted">No upcoming bookings. <Link to="/book" className="link">Reserve a slot</Link></p>
            ) : (
              <ul className="mini-list">
                {upcoming.map((booking) => (
                  <li key={booking._id}>
                    <strong>{booking.slotId}</strong>
                    <span>{formatDateTime(booking.startTime)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <ChatAssistant userName={user.name.split(' ')[0]} />
    </div>
  );
}


