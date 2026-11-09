import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";

// Shared sidebar markup; User/Admin sidebars only supply their links.
function SidebarNav({ items, variant = "user", open, onNavigate, label }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onNavigate();
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className={`sidebar sidebar-${variant} ${open ? "open" : ""}`.trim()}>
      <nav aria-label={label}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`.trim()}
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button type="button" className="sidebar-link sidebar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default SidebarNav;
