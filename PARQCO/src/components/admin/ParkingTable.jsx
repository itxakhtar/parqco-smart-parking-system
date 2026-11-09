import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";

// Sensor column shows development data only: no ESP32 is connected.
function ParkingTable({ slots }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr><th>Slot ID</th><th>Zone</th><th>Floor</th><th>Status</th><th>Sensor</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.slot_id}>
              <td>{slot.slot_id}</td>
              <td>{slot.location}</td>
              <td>{slot.floor}</td>
              <td><StatusBadge status={slot.status} /></td>
              <td>{slot.sensor_id} (development data)</td>
              <td><Button size="sm" variant="secondary" disabled title="Backend integration pending">View</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ParkingTable;
