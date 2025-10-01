import React, { createContext, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    const res = await api.post('auth/login/', { username, password });
    const { access } = res.data;
    setAccessToken(access);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    // optionally fetch user info
    setUser({ username }); // simple
    return res;
  };

  const logout = async () => {
    await api.post('auth/logout/');
    setAccessToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const refreshAccessToken = async () => {
    // calls endpoint which reads refresh from cookie and returns new access
    const res = await api.post('auth/refresh/');
    const { access } = res.data;
    setAccessToken(access);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    return access;
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
