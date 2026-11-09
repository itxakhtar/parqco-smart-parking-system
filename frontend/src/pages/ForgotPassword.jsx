import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { Alert } from '../components/Feedback.jsx';
import OtpInput from '../components/OtpInput.jsx';
import useCountdown from '../components/useCountdown.js';
import { forgotPassword, resetPassword, resendOtp } from '../api/auth.js';
import { errorMessage } from '../utils/format.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' -> 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, restartTimer] = useCountdown(60);

  const handleSendCode = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await forgotPassword(email);
      restartTimer();
      setStep('reset');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit code.');
    if (passwords.newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (passwords.newPassword !== passwords.confirm) return setError('Passwords do not match.');
    setError('');
    setSubmitting(true);
    try {
      await resetPassword({ email, otp, newPassword: passwords.newPassword });
      navigate('/login', { state: { reset: true } });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await resendOtp(email, 'reset');
      setInfo('A new code has been sent.');
      restartTimer();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (step === 'reset') {
    return (
      <AuthShell
        title="Set a new password"
        subtitle={`If ${email} has an account, a code is on its way.`}
        footer={<Link to="/login">Back to sign in</Link>}
      >
        <form onSubmit={handleReset} className="form" noValidate>
          <Alert>{error}</Alert>
          {info && <p role="status" style={{ color: '#067647', margin: 0 }}>{info}</p>}
          <OtpInput value={otp} onChange={setOtp} disabled={submitting} />
          <label className="field">
            <span>New password</span>
            <input className="input" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input className="input" type="password" autoComplete="new-password" placeholder="Repeat the password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
          </label>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
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
      title="Reset your password"
      subtitle="Enter your account email and we will send you a code."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form onSubmit={handleSendCode} className="form" noValidate>
        <Alert>{error}</Alert>
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Sending code…' : 'Send reset code'}
        </button>
      </form>
    </AuthShell>
  );
}
