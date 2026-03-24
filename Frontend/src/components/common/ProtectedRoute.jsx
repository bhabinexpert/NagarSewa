/**
 * ProtectedRoute Component
 * 
 * Wrapper component that protects routes from unauthorized access.
 * Checks if user is logged in before rendering.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/useAuth';


export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, isLoading } = useAuth();

  const normalizeRole = (role) => String(role || '').toLowerCase();

  const hasRequiredRole = () => {
    if (!requiredRole) {
      return true;
    }

    const userRole = normalizeRole(currentUser?.role);
    const targetRole = normalizeRole(requiredRole);

    if (targetRole === 'admin') {
      return userRole === 'super_admin' || userRole === 'ward_admin';
    }

    return userRole === targetRole;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole()) {
    const fallbackPath = normalizeRole(currentUser?.role) === 'user' ? '/user' : '/admin';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
