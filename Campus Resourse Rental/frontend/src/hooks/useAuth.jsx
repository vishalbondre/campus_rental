// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cr_token');
    const saved  = localStorage.getItem('cr_user');
    if (token && saved) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (emailId, password) => {
    const { data } = await api.post('/auth/login', { emailId, password });
    const { accessToken, user: userData } = data.data;
    localStorage.setItem('cr_token', accessToken);
    localStorage.setItem('cr_user',  JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
