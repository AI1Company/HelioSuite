import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
if (!process.env.FIREBASE_CONFIG) {
  initializeApp();
}

const auth = getAuth();
const db = getFirestore();

// User roles enum
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  SALES_REP = 'sales_rep',
  TECHNICIAN = 'technician',
  GUEST = 'guest'
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  [UserRole.OWNER]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.SALES_REP]: 3,
  [UserRole.TECHNICIAN]: 2,
  [UserRole.GUEST]: 1
};

/**
 * Set custom claims for a user (role-based access control)
 * Only owners and admins can assign roles
 */
export const setUserRole = onCall(async (request) => {
  const { targetUserId, role } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!targetUserId || !role) {
    throw new HttpsError('invalid-argument', 'targetUserId and role are required');
  }

  if (!Object.values(UserRole).includes(role)) {
    throw new HttpsError('invalid-argument', 'Invalid role specified');
  }

  try {
    // Get caller's current role
    const callerRecord = await auth.getUser(callerUid);
    const callerRole = callerRecord.customClaims?.role as UserRole;

    // Check if caller has permission to assign roles
    if (!callerRole || (callerRole !== UserRole.OWNER && callerRole !== UserRole.ADMIN)) {
      throw new HttpsError('permission-denied', 'Insufficient permissions to assign roles');
    }

    // Owners can assign any role, admins cannot assign owner role
    if (callerRole === UserRole.ADMIN && role === UserRole.OWNER) {
      throw new HttpsError('permission-denied', 'Admins cannot assign owner role');
    }

    // Prevent role escalation - users cannot assign roles higher than their own
    if (ROLE_HIERARCHY[role] > ROLE_HIERARCHY[callerRole]) {
      throw new HttpsError('permission-denied', 'Cannot assign role higher than your own');
    }

    // Set custom claims
    await auth.setCustomUserClaims(targetUserId, { role });

    // Update user document in Firestore
    await db.collection('users').doc(targetUserId).update({
      role,
      updatedAt: new Date(),
      updatedBy: callerUid
    });

    // Log the role change
    await db.collection('activity_logs').add({
      type: 'role_change',
      userId: callerUid,
      targetUserId,
      oldRole: callerRecord.customClaims?.role || 'none',
      newRole: role,
      timestamp: new Date(),
      ip: request.rawRequest.ip
    });

    return { success: true, message: `Role ${role} assigned to user ${targetUserId}` };
  } catch (error) {
    console.error('Error setting user role:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to set user role');
  }
});

/**
 * Initialize user role when a new user is created
 * Default role is 'guest' unless specified otherwise
 */
export const initializeUserRole = onCall(async (request) => {
  const { userId, email, initialRole = UserRole.GUEST } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!userId || !email) {
    throw new HttpsError('invalid-argument', 'userId and email are required');
  }

  try {
    // Check if caller has permission to initialize users
    const callerRecord = await auth.getUser(callerUid);
    const callerRole = callerRecord.customClaims?.role as UserRole;

    if (!callerRole || (callerRole !== UserRole.OWNER && callerRole !== UserRole.ADMIN)) {
      throw new HttpsError('permission-denied', 'Insufficient permissions to initialize users');
    }

    // Set initial custom claims
    await auth.setCustomUserClaims(userId, { role: initialRole });

    // Create user document in Firestore
    await db.collection('users').doc(userId).set({
      email,
      role: initialRole,
      createdAt: new Date(),
      createdBy: callerUid,
      updatedAt: new Date(),
      isActive: true,
      profile: {
        firstName: '',
        lastName: '',
        phone: '',
        avatar: ''
      },
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        theme: 'light',
        language: 'en'
      }
    });

    // Log user creation
    await db.collection('activity_logs').add({
      type: 'user_created',
      userId: callerUid,
      targetUserId: userId,
      role: initialRole,
      timestamp: new Date(),
      ip: request.rawRequest.ip
    });

    return { success: true, message: `User ${userId} initialized with role ${initialRole}` };
  } catch (error) {
    console.error('Error initializing user:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to initialize user');
  }
});

/**
 * Get user role and permissions
 */
export const getUserRole = onCall(async (request) => {
  const { userId } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Users can get their own role, admins/owners can get any user's role
  const targetUserId = userId || callerUid;

  if (targetUserId !== callerUid) {
    const callerRecord = await auth.getUser(callerUid);
    const callerRole = callerRecord.customClaims?.role as UserRole;

    if (!callerRole || (callerRole !== UserRole.OWNER && callerRole !== UserRole.ADMIN)) {
      throw new HttpsError('permission-denied', 'Insufficient permissions to view other users\' roles');
    }
  }

  try {
    const userRecord = await auth.getUser(targetUserId);
    const userDoc = await db.collection('users').doc(targetUserId).get();

    const role = userRecord.customClaims?.role as UserRole || UserRole.GUEST;
    const userData = userDoc.data();

    return {
      userId: targetUserId,
      email: userRecord.email,
      role,
      permissions: getPermissionsForRole(role),
      profile: userData?.profile || {},
      isActive: userData?.isActive || false,
      createdAt: userData?.createdAt,
      updatedAt: userData?.updatedAt
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    throw new HttpsError('internal', 'Failed to get user role');
  }
});

/**
 * Helper function to get permissions for a role
 */
function getPermissionsForRole(role: UserRole) {
  const permissions = {
    canManageUsers: false,
    canAccessClientData: false,
    canAccessJobData: false,
    canManageProducts: false,
    canManageCompanySettings: false,
    canViewReports: false,
    canExportData: false
  };

  switch (role) {
    case UserRole.OWNER:
      return {
        ...permissions,
        canManageUsers: true,
        canAccessClientData: true,
        canAccessJobData: true,
        canManageProducts: true,
        canManageCompanySettings: true,
        canViewReports: true,
        canExportData: true
      };
    
    case UserRole.ADMIN:
      return {
        ...permissions,
        canManageUsers: true,
        canAccessClientData: true,
        canAccessJobData: true,
        canManageProducts: true,
        canViewReports: true,
        canExportData: true
      };
    
    case UserRole.SALES_REP:
      return {
        ...permissions,
        canAccessClientData: true,
        canAccessJobData: true,
        canViewReports: true
      };
    
    case UserRole.TECHNICIAN:
      return {
        ...permissions,
        canAccessJobData: true
      };
    
    case UserRole.GUEST:
    default:
      return permissions;
  }
}

/**
 * Deactivate a user account
 */
export const deactivateUser = onCall(async (request) => {
  const { targetUserId } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!targetUserId) {
    throw new HttpsError('invalid-argument', 'targetUserId is required');
  }

  try {
    // Check permissions
    const callerRecord = await auth.getUser(callerUid);
    const callerRole = callerRecord.customClaims?.role as UserRole;

    if (!callerRole || (callerRole !== UserRole.OWNER && callerRole !== UserRole.ADMIN)) {
      throw new HttpsError('permission-denied', 'Insufficient permissions to deactivate users');
    }

    // Cannot deactivate yourself
    if (targetUserId === callerUid) {
      throw new HttpsError('invalid-argument', 'Cannot deactivate your own account');
    }

    // Disable the user account
    await auth.updateUser(targetUserId, { disabled: true });

    // Update user document
    await db.collection('users').doc(targetUserId).update({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: callerUid
    });

    // Log the deactivation
    await db.collection('activity_logs').add({
      type: 'user_deactivated',
      userId: callerUid,
      targetUserId,
      timestamp: new Date(),
      ip: request.rawRequest.ip
    });

    return { success: true, message: `User ${targetUserId} has been deactivated` };
  } catch (error) {
    console.error('Error deactivating user:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to deactivate user');
  }
});