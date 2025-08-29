import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('auth_username') || '');

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token');
  }, [token]);

  useEffect(() => {
    if (username) localStorage.setItem('auth_username', username); else localStorage.removeItem('auth_username');
  }, [username]);

  const login = (newToken, uname) => {
    setToken(newToken);
    setUsername(uname || '');
  };

  const logout = () => {
    setToken('');
    setUsername('');
  };

  const value = useMemo(() => ({ token, username, login, logout, isAuthenticated: Boolean(token) }), [token, username]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
