import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <Logo light />
          <p className="footer__text">Live parking availability, booking and forecasts for universities, malls, hospitals and city lots.</p>
        </div>
        <p className="footer__small">© {new Date().getFullYear()} PARQCO. Smart Parking Management System with AI Predictions.</p>
      </div>
    </footer>
  );
}
