import { createContext, useState } from "react";

// MOCK AUTH (frontend only). NOT secure authentication.
// Replace with a real login through the Node.js API; roles must be enforced by the backend.
const STORAGE_KEY = "parqco_mock_session";

export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = (email, role) => {
    const mockUser = { name: email.split("@")[0], email, role };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
