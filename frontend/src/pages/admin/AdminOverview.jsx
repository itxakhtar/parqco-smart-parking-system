import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Banknote, CalendarCheck, ParkingSquare, Users } from 'lucide-react';
import api from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { Alert, Loading } from '../../components/Feedback.jsx';
import { errorMessage, formatDateTime, formatMoney } from '../../utils/format.js';

const COLORS = { Available: '#1F9D6B', Occupied: '#D64545', Reserved: '#3B6FD4', Maintenance: '#9AA0A6' };

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/sensors')])
      .then(([statsResponse, sensorResponse]) => {
        setStats(statsResponse.data.stats);
        setSensors(sensorResponse.data.sensors);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!stats) return <Loading />;

  const chartData = [
    { name: 'Available', value: stats.available },
    { name: 'Occupied', value: stats.occupied },
    { name: 'Reserved', value: stats.reserved },
    { name: 'Maintenance', value: stats.maintenance },
  ].filter((entry) => entry.value > 0);

  const sensorsOnline = sensors.filter((sensor) => sensor.online).length;
  const utilisation = stats.totalSlots ? Math.round(((stats.occupied + stats.reserved) / stats.totalSlots) * 100) : 0;

  return (
    <>
      <PageHeader title="Overview" subtitle="How the lot is doing right now." />

      <div className="stats stats--five">
        <StatCard label="Total slots" value={stats.totalSlots} icon={ParkingSquare} note={`${utilisation}% in use`} />
        <StatCard label="Bookings today" value={stats.bookingsToday} icon={CalendarCheck} />
        <StatCard label="Drivers" value={stats.users} icon={Users} />
        <StatCard label="Revenue" value={formatMoney(stats.revenue)} icon={Banknote} tone="free" note="Confirmed and completed" />
        <StatCard label="Sensors online" value={`${sensorsOnline}/${sensors.length}`} tone={sensorsOnline === sensors.length ? 'free' : 'busy'} />
      </div>

      <div className="two-col">
        <section className="card">
          <h2>Slot status</h2>
          <div className="donut">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2}>
                  {chartData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ul className="legend legend--column">
              {chartData.map((entry) => (
                <li key={entry.name}><i className="legend__dot" style={{ background: COLORS[entry.name] }} />{entry.name}: <strong>{entry.value}</strong></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card">
          <h2>Recent bookings</h2>
          {stats.recentBookings.length === 0 ? (
            <p className="muted">No bookings yet.</p>
          ) : (
            <ul className="mini-list">
              {stats.recentBookings.map((booking) => (
                <li key={booking._id}>
                  <strong>{booking.slotId} · {booking.user?.name || 'Unknown'}</strong>
                  <span>{formatDateTime(booking.startTime)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
