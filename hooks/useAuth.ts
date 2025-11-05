import { useState, useEffect, useReducer, useCallback, useMemo, useRef } from 'react'
import { supabase, authHelpers, ADMIN_EMAIL, adminCache } from './lib/supabase'
import type { UserRole, AuthUser } from '../types'
import type { Session } from '@supabase/supabase-js'
import { UserService } from './services/userService'

// Auth state types
interface AuthState {
  user: AuthUser | null
  userRole: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  isInitialized: boolean
}

type AuthAction = 
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: { user: AuthUser | null; userRole: UserRole | null } }
  | { type: 'INIT_ERROR'; payload: string }
  | { type: 'SIGN_IN_SUCCESS'; payload: { user: AuthUser; userRole: UserRole } }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }

// Initial state
const initialState: AuthState = {
  user: null,
  userRole: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  isInitialized: false
}

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, isLoading: true, error: null }
    
    case 'INIT_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        userRole: action.payload.userRole,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        isInitialized: true,
        error: null
      }
    
    case 'INIT_ERROR':
      return {
        ...state,
        user: null,
        userRole: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: action.payload
      }
    
    case 'SIGN_IN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        userRole: action.payload.userRole,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        userRole: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

// Auth hook
export const useAuth = () => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const [operationLoading, setOperationLoading] = useState(false)
  const mountedRef = useRef(true)
  const sessionCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Convert Supabase user to AuthUser
  const convertToAuthUser = useCallback((supabaseUser: any): AuthUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: supabaseUser.user_metadata?.full_name?.split(' ')[0] || 
                supabaseUser.user_metadata?.first_name || 
                supabaseUser.email?.split('@')[0],
      lastName: supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                supabaseUser.user_metadata?.last_name || 
                '',
      imageUrl: supabaseUser.user_metadata?.avatar_url,
      role: supabaseUser.email === ADMIN_EMAIL ? 'admin' : 'user',
      status: 'active',
      loginCount: 0,
      isActive: true,
      permissions: supabaseUser.email === ADMIN_EMAIL ? ['admin:all'] : ['user:basic']
    }
  }, [])

  // Enhanced fetch user role with caching and error handling
  const fetchUserRole = useCallback(async (email: string, userId?: string, useCache: boolean = true) => {
    try {
      if (!email) {
        console.warn('[Auth] No email provided for role fetch')
        return {
          isAdmin: false,
          isWhitelisted: false,
          email: email.toLowerCase()
        }
      }

      console.log(`[Auth] Fetching role for user: ${email}`)
      
      // Use UserService with built-in caching
      const roleData = await UserService.getUserRole(email, userId)
      
      return {
        isAdmin: roleData.isAdmin,
        isWhitelisted: roleData.isWhitelisted,
        email: email.toLowerCase(),
        lastChecked: Date.now(),
        source: 'database' as const,
        isValid: true
      }
    } catch (error) {
      console.error('[Auth] Error fetching user role:', error)
      
      // Fallback to admin check
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      return {
        isAdmin,
        isWhitelisted: false,
        email: email.toLowerCase(),
        lastChecked: Date.now(),
        source: 'database' as const,
        isValid: false
      }
    }
  }, [])

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    if (!mountedRef.current) return
    
    console.log('[Auth] Auth state changed:', event, session?.user?.email)
    
    try {
      if (event === 'SIGNED_IN' && session?.user) {
        const authUser = convertToAuthUser(session.user)
        // Fetch role with fresh data on sign in
        const userRole = await fetchUserRole(session.user.email || '', session.user.id, false)
        
        dispatch({ 
          type: 'SIGN_IN_SUCCESS', 
          payload: { user: authUser, userRole }
        })
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SIGN_OUT' })
        // Clear cache on sign out
        clearWhitelistCache()
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Update user data on token refresh (can use cache)
        const authUser = convertToAuthUser(session.user)
        const userRole = await fetchUserRole(session.user.email || '', session.user.id, true)
        
        dispatch({ 
          type: 'SIGN_IN_SUCCESS', 
          payload: { user: authUser, userRole }
        })
      }
    } catch (error) {
      console.error('[Auth] Error handling auth state change:', error)
      if (event === 'SIGNED_IN') {
        dispatch({ 
          type: 'INIT_ERROR', 
          payload: 'Failed to process sign in' 
        })
      }
    }
  }, [convertToAuthUser, fetchUserRole])

  // Clear whitelist cache
  const clearWhitelistCache = useCallback(() => {
    adminCache.invalidate()
  }, [])

  // Initialize auth
  useEffect(() => {
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'INIT_START' })
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (error) {
          console.error('[Auth] Error fetching session:', error)
          dispatch({ 
            type: 'INIT_ERROR', 
            payload: error.message || 'Failed to fetch session' 
          })
          return
        }

        if (session?.user) {
          const authUser = convertToAuthUser(session.user)
          // Use cache on initial load for better performance
          const userRole = await fetchUserRole(session.user.email || '', session.user.id, true)
          
          dispatch({ 
            type: 'INIT_SUCCESS', 
            payload: { user: authUser, userRole }
          })
        } else {
          dispatch({ 
            type: 'INIT_SUCCESS', 
            payload: { user: null, userRole: null }
          })
        }
      } catch (error) {
        if (!isMounted) return
        console.error('[Auth] Auth initialization error:', error)
        dispatch({ 
          type: 'INIT_ERROR', 
          payload: 'Failed to initialize authentication' 
        })
      }
    }

    initializeAuth()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    // Cleanup function
    return () => {
      isMounted = false
      mountedRef.current = false
      subscription?.unsubscribe()
      if (sessionCheckTimeoutRef.current) {
        clearTimeout(sessionCheckTimeoutRef.current)
      }
    }
  }, [convertToAuthUser, fetchUserRole, handleAuthStateChange])

  // Sign in function
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      setOperationLoading(true)
      dispatch({ type: 'CLEAR_ERROR' })
      
      const { data, error } = await authHelpers.signIn(email, password)
      
      if (error) {
        dispatch({ 
          type: 'INIT_ERROR', 
          payload: error.message 
        })
        return { data: null, error: error.message }
      }
      
      // Auth state change will be handled by the listener
      return { data, error: null }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed'
      dispatch({ 
        type: 'INIT_ERROR', 
        payload: errorMessage 
      })
      return { data: null, error: errorMessage }
    } finally {
      setOperationLoading(false)
    }
  }, [])

  // Sign up function
  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      setOperationLoading(true)
      dispatch({ type: 'CLEAR_ERROR' })
      
      const { data, error } = await authHelpers.signUp(email, password, {
        full_name: metadata?.full_name || email.split('@')[0]
      })
      
      if (error) {
        dispatch({ 
          type: 'INIT_ERROR', 
          payload: error.message 
        })
        return { data: null, error: error.message }
      }
      
      return { data, error: null }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign up failed'
      dispatch({ 
        type: 'INIT_ERROR', 
        payload: errorMessage 
      })
      return { data: null, error: errorMessage }
    } finally {
      setOperationLoading(false)
    }
  }, [])

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setOperationLoading(true)
      dispatch({ type: 'CLEAR_ERROR' })
      
      const { error } = await authHelpers.signOut()
      
      if (error) {
        dispatch({ 
          type: 'INIT_ERROR', 
          payload: error.message 
        })
        return { error: error.message }
      }
      
      // Auth state change will be handled by the listener
      return { error: null }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign out failed'
      dispatch({ 
        type: 'INIT_ERROR', 
        payload: errorMessage 
      })
      return { error: errorMessage }
    } finally {
      setOperationLoading(false)
    }
  }, [])

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // Force refresh user role
  const refreshUserRole = useCallback(async () => {
    if (state.user?.email) {
      const userRole = await fetchUserRole(state.user.email, state.user.id, false)
      dispatch({
        type: 'SIGN_IN_SUCCESS',
        payload: { user: state.user, userRole }
      })
    }
  }, [state.user, fetchUserRole])

  // Check if user needs refresh
  const needsRefresh = useMemo(() => {
    if (!state.user) return false
    // Add logic to check if user session needs refresh
    return false // Placeholder for refresh logic
  }, [state.user])

  // Memoized return value to prevent unnecessary re-renders
  const authValue = useMemo(() => ({
    // State
    user: state.user,
    userRole: state.userRole,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    error: state.error,
    operationLoading,
    
    // Actions
    signIn,
    signUp,
    signOut,
    clearError,
    refreshUserRole,
    needsRefresh,
    
    // Additional exports for compatibility
    userProfile: state.user, // Alias for compatibility
    refreshUserData: refreshUserRole, // Alias for compatibility
    isActive: state.user?.isActive ?? false, // Active status
    getDisplayName: () => {
      if (!state.user) return 'Unknown User'
      const firstName = state.user.firstName || ''
      const lastName = state.user.lastName || ''
      if (firstName && lastName) return `${firstName} ${lastName}`
      if (firstName) return firstName
      if (lastName) return lastName
      return state.user.email
    },
    getRoleDisplayName: () => {
      if (!state.userRole) return 'Unknown'
      if (state.userRole.isAdmin) return 'Quản trị viên'
      if (state.userRole.isWhitelisted) return 'Người dùng'
      return 'Khách'
    },
    canAccess: (resource: string, action: string = 'read') => {
      if (!state.user || !state.user.isActive) return false
      if (state.user.role === 'admin') return true
      if (state.user.role === 'user' && resource === 'quizzes' && action === 'write') return true
      return false
    },
    
    // Clerk-compatible exports for easy migration
    isLoaded: state.isInitialized && !state.isLoading,
    isSignedIn: state.isAuthenticated,
  }), [
    state.user,
    state.userRole,
    state.isLoading,
    state.isAuthenticated,
    state.isInitialized,
    state.error,
    operationLoading,
    signIn,
    signUp,
    signOut,
    clearError,
    refreshUserRole,
    needsRefresh
  ])

  return authValue
}

// Admin hook
export const useIsAdmin = () => {
  const { userRole } = useAuth()
  return useMemo(() => userRole?.isAdmin || false, [userRole?.isAdmin])
}

// Whitelisted hook
export const useIsWhitelisted = () => {
  const { userRole } = useAuth()
  return useMemo(() => userRole?.isWhitelisted || false, [userRole?.isWhitelisted])
}

// User permissions hook
export const useUserPermissions = () => {
  const { user, userRole } = useAuth()
  
  return useMemo(() => ({
    canAccessAdmin: userRole?.isAdmin || false,
    canAccessUser: userRole?.isWhitelisted || false,
    canCreateQuiz: userRole?.isWhitelisted || false,
    canDeleteQuiz: userRole?.isAdmin || false,
    canManageWhitelist: userRole?.isAdmin || false,
    isAdmin: userRole?.isAdmin || false,
    isWhitelisted: userRole?.isWhitelisted || false,
  }), [userRole])
}

// Permission checking hook
export const useCanAccess = (resource: string, action: string = 'read') => {
  const auth = useAuth()
  return useMemo(() => auth.canAccess(resource, action), [auth, resource, action])
}