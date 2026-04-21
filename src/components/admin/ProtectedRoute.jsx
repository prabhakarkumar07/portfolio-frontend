/**
 * components/admin/ProtectedRoute.js
 * Redirects unauthenticated users to /admin/login
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show spinner while verifying token on first load
  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    // Redirect to login, but remember where user was trying to go
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
