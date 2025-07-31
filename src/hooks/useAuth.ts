import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

// Re-export the useAuth hook from AuthContext for convenience
export { useAuth } from '../context/AuthContext';

// Additional auth-related hooks can be added here
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { currentUser } = useAuth();
  return !!currentUser;
};

// Hook to get current user role
export const useUserRole = () => {
  const { userProfile } = useAuth();
  return userProfile?.role || null;
};

// Hook to check permissions
export const usePermissions = () => {
  const { hasRole, hasPermission } = useAuth();
  return { hasRole, hasPermission };
};

// Hook to get user preferences
export const useUserPreferences = () => {
  const { userProfile } = useAuth();
  return userProfile?.preferences || null;
};