import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { Alert } from '../components/Feedback.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../utils/format.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Set by the Register and ForgotPassword pages after they finish.
  const notice = location.state?.registered
    ? 'Account created. Sign in to continue.'
    : location.state?.reset
      ? 'Password updated. Sign in with your new password.'
      : '';

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see the live lot and manage your bookings."
      footer={<>New to PARQCO? <Link to="/register">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="form" noValidate>
        {notice && <p role="status" style={{ color: '#067647', margin: 0 }}>{notice}</p>}
        <Alert>{error}</Alert>
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input className="input" type="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={update('password')} required />
        </label>
        <div style={{ textAlign: 'right', marginTop: '-0.25rem' }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
      </form>

      <div className="demo-box">
        <p>Trying it locally? Use a demo account:</p>
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('demo@parqco.com', 'Demo@123')}>Demo driver</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('admin@parqco.com', 'Admin@123')}>Admin</button>
        </div>
      </div>
    </AuthShell>
  );
}