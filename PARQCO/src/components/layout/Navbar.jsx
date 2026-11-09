import { useAuth } from "../../hooks/useAuth";

function Navbar({ panelLabel, onMenuClick }) {
  const { user } = useAuth();
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button type="button" className="menu-btn" aria-label="Toggle menu" onClick={onMenuClick}>☰</button>
        <span className="navbar-brand">PARQCO</span>
        <span className="navbar-panel">{panelLabel}</span>
      </div>
      <span className="navbar-user">{user?.name}</span>
    </header>
  );
}

export default Navbar;
