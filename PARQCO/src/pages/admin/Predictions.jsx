import PredictionPanel from "../../components/prediction/PredictionPanel";

function Predictions() {
  return (
    <div>
      <div className="page-header">
        <h1>Predictions</h1>
        <p className="muted">Expected demand and peak periods for planning.</p>
      </div>
      <PredictionPanel />
    </div>
  );
}

export default Predictions;
