import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import api from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import { Alert, Loading } from '../../components/Feedback.jsx';
import { errorMessage, formatMoney } from '../../utils/format.js';

const EMPTY_FORM = { slotId: '', zone: 'Zone A', floor: 1, sensorId: '', hourlyRate: 100, status: 'available' };

export default function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {_id,...} = edit
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      setSlots((await api.get('/slots')).data.slots);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY_FORM); setEditing({}); setError(''); };
  const openEdit = (slot) => {
    setForm({ slotId: slot.slotId, zone: slot.zone, floor: slot.floor, sensorId: slot.sensorId, hourlyRate: slot.hourlyRate, status: slot.status });
    setEditing(slot);
    setError('');
  };
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const save = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (editing._id) await api.put(`/slots/${editing._id}`, form);
      else await api.post('/slots', form);
      setEditing(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const remove = async (slot) => {
    if (!window.confirm(`Delete slot ${slot.slotId}? This cannot be undone.`)) return;
    try {
      await api.delete(`/slots/${slot._id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (loading) return <Loading />;

  const columns = [
    { header: 'Slot', render: (slot) => <strong>{slot.slotId}</strong> },
    { header: 'Zone', render: (slot) => `${slot.zone} · Floor ${slot.floor}` },
    { header: 'Sensor', render: (slot) => slot.sensorId },
    { header: 'Rate', render: (slot) => `${formatMoney(slot.hourlyRate)}/h` },
    { header: 'Status', render: (slot) => <span className={`pill pill--${slot.liveStatus}`}>{slot.liveStatus}</span> },
    {
      header: 'Actions',
      render: (slot) => (
        <div className="row-actions">
          <button className="icon-btn" onClick={() => openEdit(slot)} aria-label={`Edit ${slot.slotId}`}><Pencil size={16} /></button>
          <button className="icon-btn icon-btn--danger" onClick={() => remove(slot)} aria-label={`Delete ${slot.slotId}`}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Parking slots" subtitle="Add, edit or remove bays and link them to sensors." actions={<button className="btn btn-primary" onClick={openNew}><Plus size={18} /> Add slot</button>} />
      {!editing && <Alert>{error}</Alert>}
      <DataTable columns={columns} rows={slots} />

      {editing && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={editing._id ? 'Edit slot' : 'Add slot'}>
          <form className="modal__box form" onSubmit={save}>
            <div className="modal__head">
              <h2>{editing._id ? `Edit ${editing.slotId}` : 'Add a slot'}</h2>
              <button type="button" className="icon-btn" onClick={() => setEditing(null)} aria-label="Close"><X size={18} /></button>
            </div>
            <Alert>{error}</Alert>
            <div className="form form--row">
              <label className="field"><span>Slot ID</span><input className="input" value={form.slotId} onChange={update('slotId')} placeholder="A-111" required /></label>
              <label className="field"><span>Sensor ID</span><input className="input" value={form.sensorId} onChange={update('sensorId')} placeholder="SENSOR_A111" required /></label>
            </div>
            <div className="form form--row">
              <label className="field"><span>Zone</span><input className="input" value={form.zone} onChange={update('zone')} required /></label>
              <label className="field"><span>Floor</span><input className="input" type="number" min="0" value={form.floor} onChange={update('floor')} required /></label>
            </div>
            <div className="form form--row">
              <label className="field"><span>Rate per hour (Rs)</span><input className="input" type="number" min="0" value={form.hourlyRate} onChange={update('hourlyRate')} /></label>
              <label className="field">
                <span>Status</span>
                <select className="input" value={form.status} onChange={update('status')}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </label>
            </div>
            <div className="modal__foot">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary">Save slot</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
