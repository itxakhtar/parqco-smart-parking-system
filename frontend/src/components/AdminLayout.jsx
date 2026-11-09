import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ParkingSquare, CalendarCheck, Users, Radio, ArrowLeft, LogOut } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/slots', label: 'Parking slots', icon: ParkingSquare },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/sensors', label: 'Sensors', icon: Radio },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <Logo to="/admin" light />
        <nav className="admin__nav" aria-label="Admin">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin__footer">
          <NavLink to="/dashboard"><ArrowLeft size={18} /><span>Back to site</span></NavLink>
          <button onClick={() => { logout(); navigate('/'); }}><LogOut size={18} /><span>Sign out</span></button>
          <p className="admin__who">{user.name}</p>
        </div>
      </aside>
      <div className="admin__content">
        <Outlet />
      </div>
    </div>
  );
}
