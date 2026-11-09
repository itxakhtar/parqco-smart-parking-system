import PanelLayout from "./PanelLayout";
import UserNavbar from "./UserNavbar";
import UserSidebar from "./UserSidebar";

function UserLayout() {
  return <PanelLayout Navbar={UserNavbar} Sidebar={UserSidebar} />;
}

export default UserLayout;
