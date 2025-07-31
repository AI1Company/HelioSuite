import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
export interface AuthContextType {
  currentUser: User | null;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      const userRef = doc(db, COLLECTIONS.USERS, result.user.uid);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
      
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
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      await updateProfile(result.user, { displayName });
      
      // Create user document in Firestore
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName,
        role,
        isActive: true,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
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
      
      const userRef = doc(db, COLLECTIONS.USERS, result.user.uid);
      await setDoc(userRef, userProfile);
      
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  };

  // Update user profile function
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        lastLoginAt: serverTimestamp()
      });
      
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
  const loadUserProfile = async (user: User): Promise<void> => {
    try {
      console.log('🔍 Loading user profile for:', user.uid);
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        console.log('✅ User profile loaded from Firestore');
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        console.log('📝 Creating default user profile');
        // Create default profile if doesn't exist
        const defaultProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'User',
          role: USER_ROLES.GUEST,
          isActive: true,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
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
        
        await setDoc(userRef, defaultProfile);
        setUserProfile(defaultProfile);
        console.log('✅ Default user profile created');
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Set a minimal profile to prevent auth flow from breaking
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'User',
        role: USER_ROLES.GUEST,
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
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
      setUserProfile(fallbackProfile);
      console.log('⚠️ Using fallback profile due to Firestore error');
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
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