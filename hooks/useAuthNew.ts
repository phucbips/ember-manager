import { useState, useEffect } from 'react'
import { supabase, authHelpers } from './lib/supabase'
import { UserService, AuthHelpers } from './services/userService'
import type { AuthUser, UserProfile, UserRoleType, LegacyUserRole } from '../types'
import type { AuthSession } from './lib/types'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error fetching session:', error)
          setUser(null)
          setUserProfile(null)
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          await loadUserData(session.user)
        } else {
          setUser(null)
          setUserProfile(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth error:', error)
        setUser(null)
        setUserProfile(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()

    // Set up auth state listener for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: AuthSession | null) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserProfile(null)
          setIsAuthenticated(false)
        }
      }
    )

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadUserData = async (supabaseUser: any) => {
    try {
      // Get user profile from database
      const profile = await UserService.getUserProfile(supabaseUser.id)
      
      if (profile) {
        setUserProfile(profile)
        
        // Convert to AuthUser format
        const authUser: AuthUser = {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName || undefined,
          lastName: profile.lastName || undefined,
          imageUrl: profile.avatarUrl || undefined,
          role: profile.role,
          status: profile.status,
          lastLoginAt: profile.lastLoginAt || undefined,
          loginCount: profile.loginCount,
          isActive: profile.status === 'active',
          permissions: await getUserPermissions(profile.id, profile.role)
        }

        setUser(authUser)
        setIsAuthenticated(true)
      } else {
        // Tạo profile mới nếu chưa có
        const newProfile = await UserService.createUser({
          email: supabaseUser.email || '',
          role: 'user',
          status: 'active',
          firstName: supabaseUser.user_metadata?.first_name,
          lastName: supabaseUser.user_metadata?.last_name,
          createdBy: supabaseUser.id
        })

        if (newProfile) {
          setUserProfile(newProfile)
          
          const authUser: AuthUser = {
            id: newProfile.id,
            email: newProfile.email,
            firstName: newProfile.firstName || undefined,
            lastName: newProfile.lastName || undefined,
            imageUrl: newProfile.avatarUrl || undefined,
            role: newProfile.role,
            status: newProfile.status,
            lastLoginAt: newProfile.lastLoginAt || undefined,
            loginCount: newProfile.loginCount,
            isActive: newProfile.status === 'active',
            permissions: await getUserPermissions(newProfile.id, newProfile.role)
          }

          setUser(authUser)
          setIsAuthenticated(true)
        } else {
          // Fallback - tạo basic user object
          const authUser: AuthUser = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: 'user',
            status: 'inactive',
            loginCount: 0,
            isActive: false,
            permissions: []
          }

          setUser(authUser)
          setIsAuthenticated(false)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setUser(null)
      setUserProfile(null)
      setIsAuthenticated(false)
    }
  }

  const getUserPermissions = async (userId: string, role: UserRoleType): Promise<string[]> => {
    try {
      const permissions = await UserService.getRolePermissions(role)
      return permissions
        .filter(p => p.isAllowed)
        .map(p => `${p.resource}:${p.action}`)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      return []
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await authHelpers.signIn(email, password)
      
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await authHelpers.signUp(email, password, {
        full_name: email.split('@')[0] // Default display name
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await authHelpers.signOut()
      if (error) throw error
      
      // Clear local state
      setUser(null)
      setUserProfile(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserData = async () => {
    if (user?.id) {
      const profile = await UserService.getUserProfile(user.id)
      if (profile) {
        setUserProfile(profile)
        setUser(prev => prev ? {
          ...prev,
          role: profile.role,
          status: profile.status,
          isActive: profile.status === 'active'
        } : null)
      }
    }
  }

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshUserData,
    // Helper functions
    isAdmin: user ? AuthHelpers.isAdmin(user) : false,
    isModerator: user ? AuthHelpers.isModerator(user) : false,
    isActive: user ? AuthHelpers.isActive(user) : false,
    canAccess: (resource: string, action: string = 'read') => 
      user ? AuthHelpers.canAccess(user, resource, action) : false,
    getDisplayName: () => AuthHelpers.getDisplayName(user),
    getRoleDisplayName: () => user ? AuthHelpers.getRoleDisplayName(user.role) : 'Người dùng',
    // Legacy compatibility
    userRole: user ? {
      isAdmin: AuthHelpers.isAdmin(user),
      isWhitelisted: AuthHelpers.isActive(user),
      email: user.email
    } as LegacyUserRole : null,
    // Clerk-compatible exports for easy migration
    isLoaded: !isLoading,
    isSignedIn: isAuthenticated,
  }
}

export const useIsAdmin = () => {
  const { user } = useAuth()
  return AuthHelpers.isAdmin(user)
}

export const useIsModerator = () => {
  const { user } = useAuth()
  return AuthHelpers.isModerator(user)
}

export const useIsWhitelisted = () => {
  const { user } = useAuth()
  return AuthHelpers.isActive(user)
}

export const useUserPermissions = () => {
  const { user } = useAuth()
  return user?.permissions || []
}

export const useCanAccess = (resource: string, action: string = 'read') => {
  const { user } = useAuth()
  return user ? AuthHelpers.canAccess(user, resource, action) : false
}