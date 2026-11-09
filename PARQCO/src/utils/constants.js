export const ROLES = { USER: "user", ADMIN: "admin" };

// Matches SDD: Available / Occupied / Reserved
export const SLOT_STATUS_LABELS = { available: "Available", occupied: "Occupied", reserved: "Reserved" };

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  UNAUTHORIZED: "/unauthorized",
  USER: {
    DASHBOARD: "/dashboard",
    PARKING: "/parking",
    BOOK: "/book",
    BOOKINGS: "/bookings",
    PREDICTIONS: "/predictions",
    NOTIFICATIONS: "/notifications",
    PROFILE: "/profile",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    PARKING: "/admin/parking",
    USERS: "/admin/users",
    BOOKINGS: "/admin/bookings",
    PREDICTIONS: "/admin/predictions",
    SETTINGS: "/admin/settings",
  },
};
