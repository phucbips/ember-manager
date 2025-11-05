import { supabase } from '../lib/supabase'
import { adminCache } from '../lib/supabase'
import type { 
  UserProfile, 
  UserRoleType, 
  UserStatusType, 
  UserPreferences, 
  RolePermission,
  UserSession,
  AuthUser,
  UserRole
} from '../types'

// User Management Service
export class UserService {
  // Get user role with caching
  static async getUserRole(email: string, userId?: string): Promise<UserRole> {
    try {
      // Try to get from cache first
      const cachedRole = adminCache.get(email)
      if (cachedRole) {
        return {
          ...cachedRole,
          email: email.toLowerCase(),
          lastChecked: Date.now(),
          source: 'cache' as const,
          isValid: true
        }
      }

      // Check if user is admin
      const isAdmin = email.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'thanhphucn06@gmail.com').toLowerCase()
      
      let isWhitelisted = isAdmin // Admin is always whitelisted
      
      if (!isAdmin && userId) {
        // Check whitelist for non-admin users
        const { data: whitelistData, error: whitelistError } = await supabase
          .from('whitelist')
          .select('id, domain')
          .eq('email', email.toLowerCase())
          .maybeSingle()

        if (whitelistError && whitelistError.code !== 'PGRST116') {
          console.error('Error fetching whitelist:', whitelistError)
          isWhitelisted = false
        } else {
          isWhitelisted = !!whitelistData
        }
      }

      // Update cache
      adminCache.set(email, isAdmin, isWhitelisted)

      return {
        isAdmin,
        isWhitelisted,
        email: email.toLowerCase(),
        lastChecked: Date.now(),
        source: 'database' as const,
        isValid: true
      }
    } catch (error) {
      console.error('Error in getUserRole:', error)
      return {
        isAdmin: false,
        isWhitelisted: false,
        email: email.toLowerCase(),
        lastChecked: Date.now(),
        source: 'database' as const,
        isValid: false
      }
    }
  }

  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return null
    }
  }

  // Get user profile by email
  static async getUserProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (error) {
        console.error('Error fetching user profile by email:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfileByEmail:', error)
      return null
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: userId
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user profile:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return false
    }
  }

  // Get all users (admin only)
  static async getAllUsers(limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching all users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllUsers:', error)
      return []
    }
  }

  // Create new user (admin only)
  static async createUser(userData: {
    email: string;
    role: UserRoleType;
    status: UserStatusType;
    firstName?: string;
    lastName?: string;
    createdBy: string;
  }): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          email: userData.email.toLowerCase(),
          created_by: userData.createdBy,
          updated_by: userData.createdBy
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createUser:', error)
      return null
    }
  }

  // Update user role (admin only)
  static async updateUserRole(
    userId: string, 
    role: UserRoleType, 
    updatedBy: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          role,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return false
    }
  }

  // Update user status (admin only)
  static async updateUserStatus(
    userId: string, 
    status: UserStatusType, 
    updatedBy: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          status,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserStatus:', error)
      return false
    }
  }

  // Get user preferences
  static async getUserPreferences(userId: string): Promise<UserPreferences[]> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching user preferences:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserPreferences:', error)
      return []
    }
  }

  // Update user preference
  static async updateUserPreference(
    userId: string,
    key: string,
    value: any
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preference_key: key,
          preference_value: value,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating user preference:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserPreference:', error)
      return false
    }
  }

  // Get role permissions
  static async getRolePermissions(role: UserRoleType): Promise<RolePermission[]> {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', role)

      if (error) {
        console.error('Error fetching role permissions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getRolePermissions:', error)
      return []
    }
  }

  // Check user permission
  static async checkUserPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('check_user_permission', {
          p_user_id: userId,
          p_resource: resource,
          p_action: action
        })

      if (error) {
        console.error('Error checking user permission:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Error in checkUserPermission:', error)
      return false
    }
  }

  // Record user login
  static async recordUserLogin(userId: string): Promise<boolean> {
    try {
      // Update last_login_at and login_count
      const { error: updateError } = await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: supabase.sql`login_count + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error recording user login:', updateError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in recordUserLogin:', error)
      return false
    }
  }

  // Get user sessions
  static async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false })

      if (error) {
        console.error('Error fetching user sessions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserSessions:', error)
      return []
    }
  }

  // Create session record
  static async createSession(sessionData: {
    userId: string;
    sessionToken: string;
    deviceInfo?: any;
    ipAddress?: string;
    expiresAt: string;
  }): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: sessionData.userId,
          session_token: sessionData.sessionToken,
          device_info: sessionData.deviceInfo,
          ip_address: sessionData.ipAddress,
          expires_at: sessionData.expiresAt
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating session:', error)
        return null
      }

      return data.id
    } catch (error) {
      console.error('Error in createSession:', error)
      return null
    }
  }

  // Update session activity
  static async updateSessionActivity(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionToken)

      if (error) {
        console.error('Error updating session activity:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateSessionActivity:', error)
      return false
    }
  }

  // Delete session
  static async deleteSession(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken)

      if (error) {
        console.error('Error deleting session:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteSession:', error)
      return false
    }
  }

  // Search users
  static async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error searching users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchUsers:', error)
      return []
    }
  }

  // Admin cache management methods
  static async refreshUserRoleCache(email: string) {
    adminCache.invalidate(email)
  }

  static async clearRoleCache() {
    adminCache.invalidate()
  }

  static getCacheStats() {
    return adminCache.getCacheStats()
  }

  // Check user permissions with role verification
  static async checkUserPermissions(
    userId: string, 
    email: string, 
    requiredRole: 'admin' | 'moderator' | 'user' = 'user'
  ): Promise<{ hasPermission: boolean; userRole: UserRole }> {
    try {
      const userRole = await this.getUserRole(email, userId)
      
      let hasPermission = false
      switch (requiredRole) {
        case 'admin':
          hasPermission = userRole.isAdmin
          break
        case 'moderator':
          hasPermission = userRole.isAdmin // For now, only admin can moderate
          break
        case 'user':
          hasPermission = userRole.isWhitelisted
          break
      }

      return { hasPermission, userRole }
    } catch (error) {
      console.error('Error checking user permissions:', error)
      return { 
        hasPermission: false, 
        userRole: {
          isAdmin: false,
          isWhitelisted: false,
          email: email.toLowerCase(),
          lastChecked: Date.now(),
          source: 'database',
          isValid: false
        }
      }
    }
  }
}

// Auth Helper Functions
export const AuthHelpers = {
  // Check if user is admin
  isAdmin: (user: AuthUser | null): boolean => {
    return user?.role === 'admin' && user?.status === 'active'
  },

  // Check if user is moderator or admin
  isModerator: (user: AuthUser | null): boolean => {
    return (user?.role === 'admin' || user?.role === 'moderator') && user?.status === 'active'
  },

  // Check if user is active
  isActive: (user: AuthUser | null): boolean => {
    return user?.status === 'active'
  },

  // Check if user can access resource
  canAccess: (user: AuthUser | null, resource: string, action: string = 'read'): boolean => {
    if (!user || !AuthHelpers.isActive(user)) {
      return false
    }

    // Admin can access everything
    if (user.role === 'admin') {
      return true
    }

    // Check specific permissions based on role
    switch (user.role) {
      case 'moderator':
        return ['users', 'quizzes'].includes(resource) && 
               ['read', 'write'].includes(action)
      case 'user':
        return resource === 'quizzes' && action === 'write'
      case 'guest':
        return resource === 'quizzes' && action === 'read'
      default:
        return false
    }
  },

  // Get user display name
  getDisplayName: (user: AuthUser | null): string => {
    if (!user) return 'Unknown User'
    
    const firstName = user.firstName || ''
    const lastName = user.lastName || ''
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (lastName) {
      return lastName
    } else {
      return user.email
    }
  },

  // Get user role display name
  getRoleDisplayName: (role: UserRoleType): string => {
    switch (role) {
      case 'admin': return 'Quản trị viên'
      case 'moderator': return 'Điều hành viên'
      case 'user': return 'Người dùng'
      case 'guest': return 'Khách'
      default: return 'Người dùng'
    }
  }
}