
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRole, hasAllowedRole, getRedirectPath, logUnauthorizedAccess, UserRole } from '@/utils/roleValidation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  allowedRoles = ['teacher', 'student'] 
}) => {
  const { user, session, loading, loggingOut } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const location = useLocation();

  // Fetch user role when user changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && requireAuth) {
        setRoleLoading(true);
        const role = await getUserRole(user);
        setUserRole(role);
        setRoleLoading(false);
      } else {
        setUserRole(null);
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user, requireAuth]);

  // Show loading while auth or role is loading
  if (loading || loggingOut || (requireAuth && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  // Check role authorization for authenticated users
  if (requireAuth && user && userRole) {
    const hasValidRole = hasAllowedRole(userRole, allowedRoles);
    
    if (!hasValidRole) {
      // Log unauthorized access attempt
      logUnauthorizedAccess(user.id, userRole, allowedRoles, location.pathname);
      
      // Redirect to appropriate page based on user's actual role
      const redirectPath = getRedirectPath(userRole);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If user is authenticated but role couldn't be determined, redirect to role-appropriate page
  if (requireAuth && user && !userRole && !roleLoading) {
    console.error('Could not determine user role, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
