import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";

function BookingTable({ bookings }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Booking ID</th><th>User</th><th>Slot</th><th>Date</th>
            <th>Start</th><th>End</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b._id}</td>
              <td>{b.user}</td>
              <td>{b.slot_id}</td>
              <td>{b.date}</td>
              <td>{b.start}</td>
              <td>{b.end}</td>
              <td><StatusBadge status={b.status} /></td>
              <td><Button size="sm" variant="secondary" disabled title="Backend integration pending">View</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BookingTable;
