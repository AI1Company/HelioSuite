/**
 * User Management Utilities for HelioSuite
 * Core business logic for user operations
 */

import { User, UserRole } from '../types/database';
import { userServiceExtended, activityLogServiceExtended } from '../services/database';

// User management class
export class UserManager {
  /**
   * Create a new user with proper role assignment
   */
  static async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'totalJobs' | 'totalRevenue'>,
    createdBy?: string
  ): Promise<string> {
    // Validate email uniqueness
    const existingUser = await userServiceExtended.getByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Set default values
    const defaultPreferences = {
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      theme: 'light' as const,
      language: 'en',
    };

    const userToCreate: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      ...userData,
      isActive: true,
      preferences: {
        ...defaultPreferences,
        ...userData.preferences,
        notifications: {
          ...defaultPreferences.notifications,
          ...userData.preferences?.notifications,
        },
      },
    };

    // Create user
    const userId = await userServiceExtended.create(userToCreate, createdBy);

    // Log activity
    if (createdBy) {
      await activityLogServiceExtended.logActivity(
        'user_created',
        createdBy,
        `Created new user: ${userData.profile.firstName} ${userData.profile.lastName} (${userData.email})`,
        {
          targetUserId: userId,
          userRole: userData.role,
        }
      );
    }

    return userId;
  }

  /**
   * Update user information
   */
  static async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'createdAt' | 'email'>>,
    updatedBy?: string
  ): Promise<void> {
    const existingUser = await userServiceExtended.getById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Track changes for activity log
    const changes: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      const oldValue = (existingUser as any)[key];
      const newValue = (updates as any)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    // Update user
    await userServiceExtended.update(userId, updates, updatedBy);

    // Log activity
    if (updatedBy && Object.keys(changes).length > 0) {
      await activityLogServiceExtended.logActivity(
        'user_updated',
        updatedBy,
        `Updated user: ${existingUser.profile.firstName} ${existingUser.profile.lastName}`,
        {
          targetUserId: userId,
          changes,
        }
      );
    }
  }

  /**
   * Change user role with proper authorization
   */
  static async changeUserRole(
    userId: string,
    newRole: UserRole,
    changedBy: string
  ): Promise<void> {
    // Get the user making the change
    const adminUser = await userServiceExtended.getById(changedBy);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Check authorization
    if (!this.canChangeRole(adminUser.role, newRole)) {
      throw new Error('Insufficient permissions to change user role');
    }

    const targetUser = await userServiceExtended.getById(userId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    const oldRole = targetUser.role;

    // Update role
    await userServiceExtended.update(userId, { role: newRole }, changedBy);

    // Log activity
    await activityLogServiceExtended.logActivity(
      'role_changed',
      changedBy,
      `Changed user role: ${targetUser.profile.firstName} ${targetUser.profile.lastName} from ${oldRole} to ${newRole}`,
      {
        targetUserId: userId,
        oldRole,
        newRole,
      }
    );
  }

  /**
   * Deactivate a user account
   */
  static async deactivateUser(
    userId: string,
    deactivatedBy: string,
    reason?: string
  ): Promise<void> {
    const adminUser = await userServiceExtended.getById(deactivatedBy);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Check authorization
    if (!this.canDeactivateUser(adminUser.role)) {
      throw new Error('Insufficient permissions to deactivate user');
    }

    const targetUser = await userServiceExtended.getById(userId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Prevent self-deactivation
    if (userId === deactivatedBy) {
      throw new Error('Cannot deactivate your own account');
    }

    // Update user
    await userServiceExtended.update(userId, {
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy,
    }, deactivatedBy);

    // Log activity
    await activityLogServiceExtended.logActivity(
      'user_deactivated',
      deactivatedBy,
      `Deactivated user: ${targetUser.profile.firstName} ${targetUser.profile.lastName}${reason ? ` - Reason: ${reason}` : ''}`,
      {
        targetUserId: userId,
        reason,
      }
    );
  }

  /**
   * Reactivate a user account
   */
  static async reactivateUser(
    userId: string,
    reactivatedBy: string
  ): Promise<void> {
    const adminUser = await userServiceExtended.getById(reactivatedBy);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Check authorization
    if (!this.canDeactivateUser(adminUser.role)) {
      throw new Error('Insufficient permissions to reactivate user');
    }

    const targetUser = await userServiceExtended.getById(userId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Update user
    await userServiceExtended.update(userId, {
      isActive: true,
      deactivatedAt: undefined,
      deactivatedBy: undefined,
    }, reactivatedBy);

    // Log activity
    await activityLogServiceExtended.logActivity(
      'user_updated',
      reactivatedBy,
      `Reactivated user: ${targetUser.profile.firstName} ${targetUser.profile.lastName}`,
      {
        targetUserId: userId,
        action: 'reactivated',
      }
    );
  }

  /**
   * Get users by role with pagination
   */
  static async getUsersByRole(
    role: UserRole,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ users: User[]; totalCount: number; hasMore: boolean }> {
    const users = await userServiceExtended.getUsersByRole(role);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      users: users.slice(startIndex, endIndex),
      totalCount: users.length,
      hasMore: endIndex < users.length,
    };
  }

  /**
   * Search users by name or email
   */
  static async searchUsers(searchTerm: string): Promise<User[]> {
    const allUsers = await userServiceExtended.getActiveUsers();
    const term = searchTerm.toLowerCase();
    
    return allUsers.filter(user => 
      user.profile.firstName.toLowerCase().includes(term) ||
      user.profile.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<UserRole, number>;
  }> {
    const allUsers = await userServiceExtended.getAll();
    
    const stats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.isActive).length,
      inactive: allUsers.filter(u => !u.isActive).length,
      byRole: {} as Record<UserRole, number>,
    };

    // Initialize role counts
    Object.values(UserRole).forEach(role => {
      stats.byRole[role] = 0;
    });

    // Count users by role
    allUsers.forEach(user => {
      stats.byRole[user.role]++;
    });

    return stats;
  }

  /**
   * Check if a user can change another user's role
   */
  private static canChangeRole(adminRole: UserRole, targetRole: UserRole): boolean {
    // Only owners and admins can change roles
    if (adminRole !== UserRole.OWNER && adminRole !== UserRole.ADMIN) {
      return false;
    }

    // Owners can change any role
    if (adminRole === UserRole.OWNER) {
      return true;
    }

    // Admins cannot create owners or other admins
    if (adminRole === UserRole.ADMIN) {
      return targetRole !== UserRole.OWNER && targetRole !== UserRole.ADMIN;
    }

    return false;
  }

  /**
   * Check if a user can deactivate other users
   */
  private static canDeactivateUser(adminRole: UserRole): boolean {
    return adminRole === UserRole.OWNER || adminRole === UserRole.ADMIN;
  }

  /**
   * Validate user data before creation/update
   */
  static validateUserData(userData: Partial<User>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (userData.profile?.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(userData.profile.phone)) {
      errors.push('Invalid phone number format');
    }

    // Name validation
    if (userData.profile?.firstName && userData.profile.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (userData.profile?.lastName && userData.profile.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    // Role validation
    if (userData.role && !Object.values(UserRole).includes(userData.role)) {
      errors.push('Invalid user role');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Update user last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    await userServiceExtended.update(userId, {
      lastLoginAt: new Date(),
    });

    // Log login activity
    await activityLogServiceExtended.logActivity(
      'login',
      userId,
      'User logged in',
      {
        timestamp: new Date(),
      }
    );
  }

  /**
   * Get user permissions based on role
   */
  static getUserPermissions(role: UserRole): {
    canManageUsers: boolean;
    canManageClients: boolean;
    canManageJobs: boolean;
    canManageProposals: boolean;
    canManageProducts: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canAccessAllData: boolean;
  } {
    const basePermissions = {
      canManageUsers: false,
      canManageClients: false,
      canManageJobs: false,
      canManageProposals: false,
      canManageProducts: false,
      canViewReports: false,
      canManageSettings: false,
      canAccessAllData: false,
    };

    switch (role) {
      case UserRole.OWNER:
        return {
          ...basePermissions,
          canManageUsers: true,
          canManageClients: true,
          canManageJobs: true,
          canManageProposals: true,
          canManageProducts: true,
          canViewReports: true,
          canManageSettings: true,
          canAccessAllData: true,
        };

      case UserRole.ADMIN:
        return {
          ...basePermissions,
          canManageUsers: true,
          canManageClients: true,
          canManageJobs: true,
          canManageProposals: true,
          canManageProducts: true,
          canViewReports: true,
          canManageSettings: false,
          canAccessAllData: true,
        };

      case UserRole.SALES_REP:
        return {
          ...basePermissions,
          canManageClients: true,
          canManageJobs: false,
          canManageProposals: true,
          canViewReports: true,
        };

      case UserRole.TECHNICIAN:
        return {
          ...basePermissions,
          canManageJobs: true,
          canViewReports: false,
        };

      case UserRole.GUEST:
      default:
        return basePermissions;
    }
  }
}

// Export utility functions
export const createUser = UserManager.createUser.bind(UserManager);
export const updateUser = UserManager.updateUser.bind(UserManager);
export const changeUserRole = UserManager.changeUserRole.bind(UserManager);
export const deactivateUser = UserManager.deactivateUser.bind(UserManager);
export const reactivateUser = UserManager.reactivateUser.bind(UserManager);
export const getUsersByRole = UserManager.getUsersByRole.bind(UserManager);
export const searchUsers = UserManager.searchUsers.bind(UserManager);
export const getUserStats = UserManager.getUserStats.bind(UserManager);
export const validateUserData = UserManager.validateUserData.bind(UserManager);
export const updateLastLogin = UserManager.updateLastLogin.bind(UserManager);
export const getUserPermissions = UserManager.getUserPermissions.bind(UserManager);