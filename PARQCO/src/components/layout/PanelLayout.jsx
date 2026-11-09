import { useState } from "react";
import { Outlet } from "react-router-dom";

// Shared shell: navbar + sidebar + page content. Owns the mobile sidebar state.
function PanelLayout({ Navbar, Sidebar }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="panel">
      <Navbar onMenuClick={() => setSidebarOpen((open) => !open)} />
      <Sidebar open={sidebarOpen} onNavigate={closeSidebar} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <main className="panel-main">
        <div className="panel-content"><Outlet /></div>
      </main>
    </div>
  );
}

export default PanelLayout;
