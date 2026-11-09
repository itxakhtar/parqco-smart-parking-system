import Navbar from "./Navbar";

function AdminNavbar({ onMenuClick }) {
  return <Navbar panelLabel="Admin Panel" onMenuClick={onMenuClick} />;
}

export default AdminNavbar;
