import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, MapPinned, CalendarCheck, LineChart, ShieldCheck, Smartphone } from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

/** Turns the public summary numbers into a list of bay statuses for the hero illustration. */
function buildHeroBays(summary, count = 20) {
  if (!summary || !summary.total) return Array(count).fill('available');
  const scale = count / summary.total;
  const occupied = Math.round(summary.occupied * scale);
  const reserved = Math.round(summary.reserved * scale);
  const bays = [
    ...Array(occupied).fill('occupied'),
    ...Array(reserved).fill('reserved'),
  ];
  while (bays.length < count) bays.push('available');
  // Interleave statuses (every 3rd bay first) so the grid does not look sorted
  const order = Array.from({ length: count }, (_, i) => i).sort((x, y) => (x % 3) - (y % 3) || x - y);
  const spread = Array(count);
  order.forEach((position, i) => { spread[position] = bays[i]; });
  return spread;
}

const steps = [
  { icon: Radio, title: 'Sensors watch every bay', text: 'An ultrasonic sensor on each slot reports whether a car is there, within seconds.' },
  { icon: MapPinned, title: 'You see the live map', text: 'The dashboard shows which bays are free on every floor, with no refresh needed.' },
  { icon: CalendarCheck, title: 'Reserve your bay', text: 'Pick a time and a slot. Nobody else can book it for those hours.' },
  { icon: LineChart, title: 'Plan with the forecast', text: 'Our model learns from past occupancy and tells you when the lot will be busy.' },
];

const features = [
  { icon: Radio, title: 'Real-time slot detection', text: 'ESP32 boards and ultrasonic sensors push every change to the server instantly.' },
  { icon: LineChart, title: 'AI peak-hour forecasts', text: 'Hourly occupancy predictions with a confidence score, based on four weeks of history.' },
  { icon: Smartphone, title: 'Works on any screen', text: 'A responsive web app for drivers on phones and for staff at the front desk.' },
  { icon: ShieldCheck, title: 'Admin control panel', text: 'Manage slots, bookings, users and sensor health from one place.' },
];

export default function Landing() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/slots/summary').then((response) => setSummary(response.data.summary)).catch(() => {});
  }, []);

  const bays = buildHeroBays(summary);
  const primaryTarget = user ? '/dashboard' : '/register';

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <h1>Know which bay is free before you leave home.</h1>
            <p>
              PARQCO connects sensors in every parking slot to a live map, instant booking and an AI forecast of
              the busiest hours. Less circling, less waiting, less traffic.
            </p>
            <div className="hero__cta">
              <Link to={primaryTarget} className="btn btn-primary btn-lg">{user ? 'Open the live lot' : 'Create a free account'}</Link>
              <Link to={user ? '/book' : '/login'} className="btn btn-outline btn-lg">{user ? 'Book a slot' : 'Sign in'}</Link>
            </div>
            {summary && (
              <dl className="hero__numbers">
                <div><dt>Free right now</dt><dd>{summary.available}</dd></div>
                <div><dt>Occupied</dt><dd>{summary.occupied}</dd></div>
                <div><dt>Reserved</dt><dd>{summary.reserved}</dd></div>
              </dl>
            )}
          </div>

          <div className="hero__board" aria-hidden="true">
            <div className="hero__board-head">
              <span className="live-dot" /> Live lot preview
            </div>
            <div className="hero__bays">
              {bays.map((status, index) => (
                <span key={index} className={`mini-bay mini-bay--${status}`} style={{ animationDelay: `${index * 45}ms` }} />
              ))}
            </div>
            <div className="hero__board-foot">Drawn from this lot’s real occupancy</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">From sensor to your screen in four steps</h2>
          <ol className="steps">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="steps__item">
                <span className="steps__number">{index + 1}</span>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container features">
          <div>
            <h2 className="section__title">Built for lots that are always busy</h2>
            <p className="section__lead">Universities, malls, hospitals and offices use PARQCO to keep drivers moving and to understand how their parking is really used.</p>
          </div>
          <ul className="features__list">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon size={22} />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container cta-band">
          <h2>Ready to stop circling the car park?</h2>
          <Link to={primaryTarget} className="btn btn-primary btn-lg">{user ? 'Go to dashboard' : 'Get started'}</Link>
        </div>
      </section>
    </>
  );
}
