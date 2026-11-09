import { Link } from 'react-router-dom';

// The "P" is drawn like a painted parking-bay line.
export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className={`logo ${light ? 'logo--light' : ''}`} aria-label="PARQCO home">
      <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill={light ? '#F2B705' : '#16191F'} />
        <path d="M22 48V16h13a11 11 0 0 1 0 22H22" fill="none" stroke={light ? '#16191F' : '#F2B705'} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>PARQCO</span>
    </Link>
  );
}
