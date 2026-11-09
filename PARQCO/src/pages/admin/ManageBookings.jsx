import { useState } from "react";
import BookingTable from "../../components/admin/BookingTable";
import Card from "../../components/common/Card";
import { mockAdminBookings } from "../../data/mockData";

const STATUSES = ["confirmed", "completed", "cancelled"];

// TODO: load from bookingService once the backend exists.
function ManageBookings() {
  const [status, setStatus] = useState("all");
  const visible = mockAdminBookings.filter((b) => status === "all" || b.status === status);

  return (
    <div>
      <div className="page-header">
        <h1>Bookings</h1>
        <p className="muted">Development data. Actions are disabled: backend integration pending.</p>
      </div>
      <Card>
        <div className="filters">
          <div className="form-field">
            <label htmlFor="booking-status">Status</label>
            <select id="booking-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
        {visible.length === 0 ? <p>No bookings match this filter.</p> : <BookingTable bookings={visible} />}
      </Card>
    </div>
  );
}

export default ManageBookings;
