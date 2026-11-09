import PanelLayout from "./PanelLayout";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
  return <PanelLayout Navbar={AdminNavbar} Sidebar={AdminSidebar} />;
}

export default AdminLayout;
