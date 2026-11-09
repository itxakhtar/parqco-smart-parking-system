import Card from "../../components/common/Card";
import ParkingTable from "../../components/admin/ParkingTable";
import { mockParkingSlots } from "../../data/mockData";

function ManageParking() {
  return (
    <div>
      <div className="page-header">
        <h1>Parking slots</h1>
        <p className="muted">Development data. No sensor is connected.</p>
      </div>
      <Card><ParkingTable slots={mockParkingSlots} /></Card>
    </div>
  );
}

export default ManageParking;
