/**
 * context/AuthContext.js - Admin authentication state
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking token on mount

  // On app load, verify stored token
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      adminAPI.getMe()
        .then((res) => setAdmin(res.data.data))
        .catch(() => {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await adminAPI.login(credentials);
    const { token, data } = res.data;
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(data));
    setAdmin(data);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
