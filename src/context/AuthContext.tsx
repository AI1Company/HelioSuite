import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import firebase from 'firebase/app';
import { auth, db, USER_ROLES, COLLECTIONS } from '../config/firebase';

// User profile interface
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  companyId?: string;
  isActive: boolean;
  createdAt: any;
  lastLoginAt: any;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

// Auth context interface
interface AuthContextType {
  currentUser: firebase.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasRole: (requiredRole: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  [USER_ROLES.OWNER]: 5,
  [USER_ROLES.ADMIN]: 4,
  [USER_ROLES.SALES_REP]: 3,
  [USER_ROLES.TECHNICIAN]: 2,
  [USER_ROLES.GUEST]: 1
};

// Role-based permissions
const ROLE_PERMISSIONS = {
  [USER_ROLES.OWNER]: [
    'view_dashboard', 'manage_users', 'manage_company', 'view_reports',
    'manage_clients', 'manage_jobs', 'manage_products', 'generate_proposals',
    'view_analytics', 'manage_billing'
  ],
  [USER_ROLES.ADMIN]: [
    'view_dashboard', 'manage_users', 'view_reports', 'manage_clients',
    'manage_jobs', 'manage_products', 'generate_proposals', 'view_analytics'
  ],
  [USER_ROLES.SALES_REP]: [
    'view_dashboard', 'manage_clients', 'manage_jobs', 'generate_proposals',
    'view_reports'
  ],
  [USER_ROLES.TECHNICIAN]: [
    'view_dashboard', 'view_assigned_jobs', 'update_job_status', 'upload_photos'
  ],
  [USER_ROLES.GUEST]: ['view_dashboard']
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      
      // Update last login timestamp
      const userRef = db.collection(COLLECTIONS.USERS).doc(result.user!.uid);
      await userRef.set({
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  // Register function
  const register = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: string = USER_ROLES.GUEST
  ): Promise<void> => {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      
      // Update user profile
      await result.user!.updateProfile({ displayName });
      
      // Create user document in Firestore
      const userProfile: UserProfile = {
        uid: result.user!.uid,
        email: result.user!.email!,
        displayName,
        role,
        isActive: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };
      
      const userRef = db.collection(COLLECTIONS.USERS).doc(result.user!.uid);
      await userRef.set(userProfile);
      
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await auth.signOut();
      setUserProfile(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await auth.sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  };

  // Update user profile function
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(currentUser.uid);
      await userRef.set({
        ...updates,
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  // Check if user has specific role or higher
  const hasRole = (requiredRole: string): boolean => {
    if (!userProfile) return false;
    
    const userRoleLevel = ROLE_HIERARCHY[userProfile.role as keyof typeof ROLE_HIERARCHY] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    
    const userPermissions = ROLE_PERMISSIONS[userProfile.role as keyof typeof ROLE_PERMISSIONS] || [];
    return userPermissions.includes(permission);
  };

  // Load user profile from Firestore
  const loadUserProfile = async (user: firebase.User): Promise<void> => {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(user.uid);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        // Create default profile if doesn't exist
        const defaultProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'User',
          role: USER_ROLES.GUEST,
          isActive: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          }
        };
        
        await userRef.set(defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: firebase.User | null) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;