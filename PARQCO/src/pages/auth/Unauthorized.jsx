import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";
import { getHomePath } from "../../utils/helpers";

function Unauthorized() {
  const { user } = useAuth();
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="card-body">
          <h1>Access denied</h1>
          <p className="auth-subtitle">Your account cannot open this page.</p>
          <Link to={user ? getHomePath(user.role) : ROUTES.LOGIN}>Go back</Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
