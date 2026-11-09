import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const links = user
    ? [
        { to: '/dashboard', label: 'Live lot' },
        { to: '/book', label: 'Book a slot' },
        { to: '/bookings', label: 'My bookings' },
        { to: '/predictions', label: 'Forecast' },
        ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
      ]
    : [];

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Logo />

        <nav className={`navbar__links ${open ? 'is-open' : ''}`} aria-label="Main">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              {link.label}
            </NavLink>
          ))}

          <div className="navbar__actions">
            {user ? (
              <>
                <span className="navbar__user">{user.name}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Create account</Link>
              </>
            )}
          </div>
        </nav>

        <button className="navbar__toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
