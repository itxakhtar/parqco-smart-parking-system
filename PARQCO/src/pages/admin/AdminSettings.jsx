import Card from "../../components/common/Card";

// Honest integration status. Editable settings are a PROPOSED FRONTEND FEATURE:
// the SRS/SDD do not define which settings the admin can change.
const INTEGRATIONS = [
  { name: "Backend API (Node.js)", state: "Not connected" },
  { name: "Database (MongoDB)", state: "Not connected" },
  { name: "Parking sensors (ESP32)", state: "Not connected, using development data" },
  { name: "Prediction service", state: "Not connected, using sample data" },
  { name: "Authentication", state: "Mock login only, not secure" },
];

function AdminSettings() {
  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p className="muted">System configuration options will be added once their requirements are approved.</p>
      </div>
      <Card title="System status">
        <dl className="status-list">
          {INTEGRATIONS.map((item) => (
            <div key={item.name} className="status-row">
              <dt>{item.name}</dt>
              <dd>{item.state}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}

export default AdminSettings;
