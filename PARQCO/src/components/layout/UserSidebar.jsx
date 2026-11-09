import SidebarNav from "./SidebarNav";
import { ROUTES } from "../../utils/constants";

const USER_NAV = [
  { label: "Dashboard", to: ROUTES.USER.DASHBOARD },
  { label: "Parking Availability", to: ROUTES.USER.PARKING },
  { label: "Book a Slot", to: ROUTES.USER.BOOK },
  { label: "My Bookings", to: ROUTES.USER.BOOKINGS },
  { label: "Predictions", to: ROUTES.USER.PREDICTIONS },
  { label: "Notifications", to: ROUTES.USER.NOTIFICATIONS },
  { label: "Profile", to: ROUTES.USER.PROFILE },
];

function UserSidebar({ open, onNavigate }) {
  return <SidebarNav items={USER_NAV} variant="user" label="User navigation" open={open} onNavigate={onNavigate} />;
}

export default UserSidebar;
