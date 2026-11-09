import Logo from './Logo.jsx';

// Two-column layout shared by the Login and Register pages.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__panel">
        <Logo light />
        <div>
          <h2>Park smarter, not harder.</h2>
          <p>Live availability, instant booking and a forecast of the busiest hours, all in one place.</p>
        </div>
        <div className="auth__bays" aria-hidden="true">
          {['occupied', 'available', 'occupied', 'reserved', 'available', 'occupied'].map((status, index) => (
            <span key={index} className={`mini-bay mini-bay--${status}`} />
          ))}
        </div>
      </aside>
      <section className="auth__form">
        <div className="auth__card">
          <h1>{title}</h1>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
          <p className="auth__footer">{footer}</p>
        </div>
      </section>
    </div>
  );
}
