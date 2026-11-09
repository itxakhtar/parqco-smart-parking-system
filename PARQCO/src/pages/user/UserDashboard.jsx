import Card from "../../components/common/Card";
import ParkingGrid from "../../components/parking/ParkingGrid";
import ParkingSummary from "../../components/parking/ParkingSummary";
import { getSlotCounts, mockParkingSlots } from "../../data/mockData";

// TODO: load slots from parkingService once the backend exists.
function UserDashboard() {
  const counts = getSlotCounts();
  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">Development data. Not connected to sensors.</p>
      </div>
      <ParkingSummary
        items={[
          { label: "Total slots", value: counts.total },
          { label: "Available", value: counts.available, tone: "available" },
          { label: "Occupied", value: counts.occupied, tone: "occupied" },
          { label: "Reserved", value: counts.reserved, tone: "reserved" },
        ]}
      />
      <Card title="Parking overview" className="section">
        <ParkingGrid slots={mockParkingSlots} />
      </Card>
    </div>
  );
}

export default UserDashboard;
