import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { mockParkingSlots } from "../../data/mockData";
import { useBookings } from "../../hooks/useBookings";
import { ROUTES } from "../../utils/constants";

const availableSlots = mockParkingSlots.filter((s) => s.status === "available");
const today = new Date().toISOString().slice(0, 10);

// TODO: submit through bookingService; the backend must check slot availability and conflicts.
function BookSlot() {
  const { addBooking } = useBookings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ slot_id: "", date: "", start: "", end: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.slot_id || !form.date || !form.start || !form.end) return setError("Fill in all fields.");
    if (form.date < today) return setError("Choose today or a future date.");
    if (form.end <= form.start) return setError("End time must be after start time.");
    setError("");
    addBooking(form);
    navigate(ROUTES.USER.BOOKINGS);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Book a slot</h1>
        <p className="muted">Development only: the booking is kept in memory, not sent to a server.</p>
      </div>
      <Card className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="slot_id">Parking slot</label>
            <select id="slot_id" name="slot_id" value={form.slot_id} onChange={handleChange}>
              <option value="">Select an available slot</option>
              {availableSlots.map((s) => <option key={s.slot_id} value={s.slot_id}>{s.slot_id} ({s.location})</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="date">Date</label>
            <input id="date" name="date" type="date" min={today} value={form.date} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="start">Start time</label>
            <input id="start" name="start" type="time" value={form.start} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="end">End time</label>
            <input id="end" name="end" type="time" value={form.end} onChange={handleChange} />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit">Confirm booking</Button>
        </form>
      </Card>
    </div>
  );
}

export default BookSlot;
