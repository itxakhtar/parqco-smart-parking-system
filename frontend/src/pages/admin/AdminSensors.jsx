import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import { Alert, Loading } from '../../components/Feedback.jsx';
import { errorMessage, formatDateTime } from '../../utils/format.js';

export default function AdminSensors() {
  const [sensors, setSensors] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = () => api.get('/sensors').then((r) => setSensors(r.data.sensors)).catch((err) => setError(errorMessage(err)));
    load();
    const timer = setInterval(load, 10000); // refresh every 10 seconds
    return () => clearInterval(timer);
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!sensors) return <Loading />;

  const columns = [
    { header: 'Sensor', render: (s) => <strong>{s.sensorId}</strong> },
    { header: 'Slot', render: (s) => s.slotId },
    { header: 'Reading', render: (s) => s.state },
    { header: 'Battery', render: (s) => (s.battery == null ? '–' : (
      <div className="battery" title={`${s.battery}%`}><span style={{ width: `${s.battery}%` }} className={s.battery < 25 ? 'is-low' : ''} /></div>
    )) },
    { header: 'Last seen', render: (s) => (s.lastSeen ? formatDateTime(s.lastSeen) : 'Never') },
    { header: 'Health', render: (s) => <span className={`pill ${s.online ? 'pill--available' : 'pill--cancelled'}`}>{s.online ? 'Online' : 'Offline'}</span> },
  ];

  return (
    <>
      <PageHeader title="Sensors" subtitle="A sensor is offline if it has not reported for 15 minutes." />
      <DataTable columns={columns} rows={sensors} rowKey="sensorId" />
    </>
  );
}
