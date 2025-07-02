
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect based on their role
  if (user) {
    const isTeacher = user.user_metadata?.role === 'teacher';
    return <Navigate to={isTeacher ? "/teacher-dashboard" : "/dashboard"} replace />;
  }

  // If not authenticated, redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default Index;
