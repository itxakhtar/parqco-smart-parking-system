import ParkingSummary from "../../components/parking/ParkingSummary";
import { getSlotCounts, mockActiveBookings, mockUsers } from "../../data/mockData";

// TODO: replace mock data with backend API data.
function AdminDashboard() {
  const counts = getSlotCounts();
  const occupancy = Math.round((counts.occupied / counts.total) * 100);
  return (
    <div>
      <div className="page-header">
        <h1>Overview</h1>
        <p className="muted">Development data. Not connected to the backend.</p>
      </div>
      <ParkingSummary
        items={[
          { label: "Total users", value: mockUsers.length },
          { label: "Parking slots", value: counts.total },
          { label: "Available", value: counts.available, tone: "available" },
          { label: "Occupied", value: counts.occupied, tone: "occupied" },
          { label: "Active bookings", value: mockActiveBookings },
          { label: "Occupancy", value: `${occupancy}%` },
        ]}
      />
    </div>
  );
}

export default AdminDashboard;
