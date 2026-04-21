/**
 * context/AuthContext.js - Admin authentication state
 */
//eslint-disable-next-line 
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../utils/api';

export const AuthContext = createContext(null);


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
      setTimeout(() => setLoading(false), 0); // Avoid synchronous setState
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      adminAPI.getMe().catch(() => {}); // Call the profile API and ignore errors
    }, 300001); // 300000 ms = 5 minutes

    return () => clearInterval(interval); // Cleanup on unmount
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
