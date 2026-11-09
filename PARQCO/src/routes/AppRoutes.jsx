import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import UserLayout from "../components/layout/UserLayout";
import AdminLayout from "../components/layout/AdminLayout";
import PlaceholderPage from "../components/common/PlaceholderPage";
import Login from "../pages/auth/Login";
import Unauthorized from "../pages/auth/Unauthorized";
import NotFound from "../pages/NotFound";
import UserDashboard from "../pages/user/UserDashboard";
import BookSlot from "../pages/user/BookSlot";
import MyBookings from "../pages/user/MyBookings";
import Notifications from "../pages/user/Notifications";
import Profile from "../pages/user/Profile";
import UserPredictions from "../pages/user/Predictions";
import AdminPredictions from "../pages/admin/Predictions";
import ManageBookings from "../pages/admin/ManageBookings";
import AdminSettings from "../pages/admin/AdminSettings";
import ParkingAvailability from "../pages/user/ParkingAvailability";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageParking from "../pages/admin/ManageParking";
import { ROLES, ROUTES } from "../utils/constants";

// PlaceholderPage entries are replaced as each page is built.
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<PlaceholderPage title="Register" />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<PlaceholderPage title="Forgot password" />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRole={ROLES.USER} />}>
          <Route element={<UserLayout />}>
            <Route path={ROUTES.USER.DASHBOARD} element={<UserDashboard />} />
            <Route path={ROUTES.USER.PARKING} element={<ParkingAvailability />} />
            <Route path={ROUTES.USER.BOOK} element={<BookSlot />} />
            <Route path={ROUTES.USER.BOOKINGS} element={<MyBookings />} />
            <Route path={ROUTES.USER.PREDICTIONS} element={<UserPredictions />} />
            <Route path={ROUTES.USER.NOTIFICATIONS} element={<Notifications />} />
            <Route path={ROUTES.USER.PROFILE} element={<Profile />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRole={ROLES.ADMIN} />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
            <Route path={ROUTES.ADMIN.PARKING} element={<ManageParking />} />
            <Route path={ROUTES.ADMIN.USERS} element={<ManageUsers />} />
            <Route path={ROUTES.ADMIN.BOOKINGS} element={<ManageBookings />} />
            <Route path={ROUTES.ADMIN.PREDICTIONS} element={<AdminPredictions />} />
            <Route path={ROUTES.ADMIN.SETTINGS} element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
