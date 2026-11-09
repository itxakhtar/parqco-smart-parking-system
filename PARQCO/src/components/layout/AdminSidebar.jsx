import SidebarNav from "./SidebarNav";
import { ROUTES } from "../../utils/constants";

const ADMIN_NAV = [
  { label: "Overview", to: ROUTES.ADMIN.DASHBOARD, end: true },
  { label: "Parking Slots", to: ROUTES.ADMIN.PARKING },
  { label: "Users", to: ROUTES.ADMIN.USERS },
  { label: "Bookings", to: ROUTES.ADMIN.BOOKINGS },
  { label: "Predictions", to: ROUTES.ADMIN.PREDICTIONS },
  { label: "Settings", to: ROUTES.ADMIN.SETTINGS },
];

function AdminSidebar({ open, onNavigate }) {
  return <SidebarNav items={ADMIN_NAV} variant="admin" label="Admin navigation" open={open} onNavigate={onNavigate} />;
}

export default AdminSidebar;
