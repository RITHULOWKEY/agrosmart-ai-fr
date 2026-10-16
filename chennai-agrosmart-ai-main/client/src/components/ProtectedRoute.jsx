import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfa]">
        <div className="p-8 bg-white rounded-3xl shadow-soft border border-agro-100 flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-agro-600 animate-spin" />
          <p className="text-gray-600 text-sm font-medium">Verifying Chennai AgroSmart credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
