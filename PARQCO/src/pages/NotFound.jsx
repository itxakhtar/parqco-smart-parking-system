import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants";

function NotFound() {
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="card-body">
          <h1>Page not found</h1>
          <p className="auth-subtitle">Check the address or go back to the login page.</p>
          <Link to={ROUTES.LOGIN}>Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
