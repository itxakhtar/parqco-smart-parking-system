import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../utils/constants";
import { getHomePath } from "../../utils/helpers";
import { isValidEmail } from "../../utils/validators";

function Login() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", role: ROLES.USER });
  const [error, setError] = useState("");

  if (user) return <Navigate to={getHomePath(user.role)} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) return setError("Enter a valid email address.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setError("");
    login(form.email, form.role); // MOCK: no server check
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="card-body">
          <h1 className="auth-title">PARQCO</h1>
          <p className="auth-subtitle">Log in to see live parking availability.</p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="role">Sign in as (demo only)</label>
              <select id="role" name="role" value={form.role} onChange={handleChange}>
                <option value={ROLES.USER}>End user</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </select>
              <small className="form-hint">Mock login. Real roles will come from the backend.</small>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <Button type="submit">Log in</Button>
          </form>
          <div className="auth-links">
            <Link to={ROUTES.FORGOT_PASSWORD}>Forgot password?</Link>
            <span>No account? <Link to={ROUTES.REGISTER}>Register</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
