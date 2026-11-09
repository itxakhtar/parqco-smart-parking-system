import { useState } from "react";
import Card from "../../components/common/Card";
import ParkingGrid from "../../components/parking/ParkingGrid";
import { mockParkingSlots } from "../../data/mockData";
import { SLOT_STATUS_LABELS } from "../../utils/constants";

const ZONES = [...new Set(mockParkingSlots.map((s) => s.location))];

// TODO: load slots from parkingService once the backend exists.
function ParkingAvailability() {
  const [zone, setZone] = useState("all");
  const [status, setStatus] = useState("all");

  const visible = mockParkingSlots.filter(
    (s) => (zone === "all" || s.location === zone) && (status === "all" || s.status === status)
  );

  return (
    <div>
      <div className="page-header">
        <h1>Parking availability</h1>
        <p className="muted">Development data. Not connected to sensors.</p>
      </div>
      <Card>
        <div className="filters">
          <div className="form-field">
            <label htmlFor="zone">Zone</label>
            <select id="zone" value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="all">All zones</option>
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {Object.entries(SLOT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
        <ParkingGrid slots={visible} />
      </Card>
    </div>
  );
}

export default ParkingAvailability;
