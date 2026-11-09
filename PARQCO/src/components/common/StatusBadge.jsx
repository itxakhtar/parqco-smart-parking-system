import { SLOT_STATUS_LABELS } from "../../utils/constants";

// Slot statuses get their own colour; anything else (active, inactive...) is neutral.
function StatusBadge({ status }) {
  const known = status in SLOT_STATUS_LABELS;
  const label = known ? SLOT_STATUS_LABELS[status] : status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`badge badge-${known ? status : "neutral"}`}>{label}</span>;
}

export default StatusBadge;
