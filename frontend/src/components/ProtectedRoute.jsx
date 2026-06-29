import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-dark-400 mt-4 text-sm font-medium tracking-wide animate-pulse">
          Loading Event CRM...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
