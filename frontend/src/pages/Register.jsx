import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { Alert } from '../components/Feedback.jsx';
import OtpInput from '../components/OtpInput.jsx';
import useCountdown from '../components/useCountdown.js';
import { registerUser, verifyRegistration, resendOtp } from '../api/auth.js';
import { errorMessage } from '../utils/format.js';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' -> 'otp'
  // const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, restartTimer] = useCountdown(60);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerUser(form);
      restartTimer();
      setStep('otp');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit code.');
    setError('');
    setSubmitting(true);
    try {
      await verifyRegistration(form.email, otp);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(errorMessage(err));
      setOtp('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await resendOtp(form.email, 'register');
      setInfo('A new code has been sent.');
      restartTimer();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (step === 'otp') {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`Enter the 6-digit code we sent to ${form.email}.`}
        footer={<>Wrong email? <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setStep('form'); setOtp(''); setError(''); setInfo(''); }}>Change it</button></>}
      >
        <form onSubmit={handleVerify} className="form" noValidate>
          <Alert>{error}</Alert>
          {info && <p role="status" style={{ color: '#067647', margin: 0 }}>{info}</p>}
          <OtpInput value={otp} onChange={setOtp} disabled={submitting} />
          <button className="btn btn-primary btn-block" disabled={submitting || otp.length !== 6}>
            {submitting ? 'Verifying…' : 'Verify and create account'}
          </button>
          <div style={{ textAlign: 'center' }}>
            {secondsLeft > 0
              ? <span>Resend code in {secondsLeft}s</span>
              : <button type="button" className="btn btn-ghost btn-sm" onClick={handleResend}>Resend code</button>}
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="We will email you a code to confirm your address."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="form" noValidate>
        <Alert>{error}</Alert>
        <label className="field">
          <span>Full name</span>
          <input className="input" autoComplete="name" placeholder="Your name" value={form.name} onChange={update('name')} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
        </label>
                <label className="field">
          <span>Mobile number</span>
          <input className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="03123456789" maxLength={14} value={form.phone} onChange={update('phone')} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input className="input" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update('password')} required />
        </label>
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Sending code…' : 'Send verification code'}
        </button>
      </form>
    </AuthShell>
  );
}