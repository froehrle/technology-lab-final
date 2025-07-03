import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'teacher' | 'student';

/**
 * Gets the user's role from auth metadata (primary source)
 * Falls back to profiles table if metadata is missing
 */
export const getUserRole = async (user: User | null): Promise<UserRole | null> => {
  if (!user) return null;

  // First try to get role from auth metadata (faster)
  const roleFromMetadata = user.user_metadata?.role as UserRole;
  if (roleFromMetadata && ['teacher', 'student'].includes(roleFromMetadata)) {
    return roleFromMetadata;
  }

  // Fallback to profiles table
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data?.role as UserRole || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};

/**
 * Synchronous role check using auth metadata only
 * Use this for immediate UI decisions
 */
export const getUserRoleSync = (user: User | null): UserRole | null => {
  if (!user) return null;
  
  const role = user.user_metadata?.role as UserRole;
  return role && ['teacher', 'student'].includes(role) ? role : null;
};

/**
 * Checks if user has any of the allowed roles
 */
export const hasAllowedRole = (userRole: UserRole | null, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Gets the appropriate redirect path based on user role
 */
export const getRedirectPath = (userRole: UserRole | null): string => {
  switch (userRole) {
    case 'teacher':
      return '/teacher-dashboard';
    case 'student':
      return '/dashboard';
    default:
      return '/auth';
  }
};

/**
 * Logs unauthorized access attempts for security monitoring
 */
export const logUnauthorizedAccess = (userId: string | undefined, userRole: UserRole | null, attemptedRoles: UserRole[], path: string) => {
  const logData = {
    timestamp: new Date().toISOString(),
    userId: userId || 'unknown',
    userRole,
    attemptedRoles,
    path,
    userAgent: navigator.userAgent,
  };
  
  // Log to console for now - in production, this should go to a security monitoring service
  console.warn('🚨 UNAUTHORIZED ACCESS ATTEMPT:', logData);
  
  // TODO: In production, send to security monitoring service
  // await sendSecurityAlert(logData);
};