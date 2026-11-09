import PredictionPanel from "../../components/prediction/PredictionPanel";

function Predictions() {
  return (
    <div>
      <div className="page-header">
        <h1>Parking predictions</h1>
        <p className="muted">Plan when to arrive based on expected demand.</p>
      </div>
      <PredictionPanel />
    </div>
  );
}

export default Predictions;
