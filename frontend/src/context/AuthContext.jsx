import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check a saved token

  // On first load, restore the session if a token is saved
  useEffect(() => {
    const token = localStorage.getItem('parqco_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((response) => setUser(response.data.user))
      .catch(() => localStorage.removeItem('parqco_token'))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = ({ token, user: loggedInUser }) => {
    localStorage.setItem('parqco_token', token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const login = async (email, password) => saveSession((await api.post('/auth/login', { email, password })).data);
  const register = async (form) => saveSession((await api.post('/auth/register', form)).data);
  const logout = () => {
    localStorage.removeItem('parqco_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
