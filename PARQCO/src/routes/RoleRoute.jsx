import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";

// Frontend-only role check. Wrong role -> Unauthorized page.
function RoleRoute({ allowedRole }) {
  const { user } = useAuth();
  return user?.role === allowedRole ? <Outlet /> : <Navigate to={ROUTES.UNAUTHORIZED} replace />;
}

export default RoleRoute;
