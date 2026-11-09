import { ROLES, ROUTES } from "./constants";

export function getHomePath(role) {
  return role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.DASHBOARD;
}
