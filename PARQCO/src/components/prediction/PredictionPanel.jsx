import Card from "../common/Card";
import ParkingSummary from "../parking/ParkingSummary";
import ForecastChart from "./ForecastChart";
import { mockForecast, mockPrediction } from "../../data/mockData";

// Shared by the user and admin Predictions pages.
// TODO: load from predictionService (Node.js API). Keep this UI provider-neutral.
function PredictionPanel() {
  const p = mockPrediction;
  return (
    <div>
      <p className="notice">Prediction UI only. Prediction service integration pending: these numbers are samples, not AI output.</p>
      <ParkingSummary
        items={[
          { label: "Current occupancy", value: `${p.currentOccupancy}%` },
          { label: "Predicted occupancy", value: `${p.predictedOccupancy}%`, tone: "occupied" },
          { label: "Estimated free slots", value: p.estimatedAvailableSlots, tone: "available" },
          { label: "Peak period", value: p.peakPeriod },
          { label: "Demand level", value: p.demandLevel, tone: "reserved" },
        ]}
      />
      <Card title="Occupancy forecast for today" className="section">
        <ForecastChart points={mockForecast} />
      </Card>
      <Card title="Recommendation" className="section">
        <p>{p.recommendation}</p>
        <p className="muted">Prediction time: {p.generatedAt}</p>
      </Card>
    </div>
  );
}

export default PredictionPanel;
