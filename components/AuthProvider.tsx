'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, ADMIN_EMAIL } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { type AuthUser } from '../types'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isLoaded: boolean
  isSignedIn: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  isAdmin: boolean
  isWhitelisted: boolean
  checkWhitelist: (email?: string) => Promise<boolean>
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isLoaded: false,
  isSignedIn: false,
  signOut: async () => {},
  signIn: async () => {},
  isAdmin: false,
  isWhitelisted: false,
  checkWhitelist: async () => false,
})

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [whitelistCache, setWhitelistCache] = useState<Set<string>>(new Set())

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  const isWhitelisted = user ? whitelistCache.has(user.email.toLowerCase()) || isAdmin : false

  const checkWhitelist = async (email?: string): Promise<boolean> => {
    const targetEmail = (email || user?.email)?.toLowerCase()
    if (!targetEmail || isAdmin) return !!targetEmail

    // Check cache first
    if (whitelistCache.has(targetEmail)) return true

    try {
      const { data, error } = await supabase
        .from('whitelist')
        .select('email')
        .eq('email', targetEmail)
        .single()

      if (data && !error) {
        setWhitelistCache(prev => new Set(prev).add(targetEmail))
        return true
      }
    } catch (error) {
      console.error('Whitelist check error:', error)
    }

    return false
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        setIsLoading(false)
        return
      }

      if (session?.user) {
        await setUserFromSession(session.user)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email)

        if (session?.user) {
          await setUserFromSession(session.user)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
        
        setIsLoading(false)
      }
    )

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const setUserFromSession = async (supabaseUser: any) => {
    try {
      const email = supabaseUser.email || ''
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      
      // Check whitelist for non-admin users
      let isWhitelisted = isAdmin
      if (!isAdmin) {
        const { data: whitelistData } = await supabase
          .from('whitelist')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle()
        
        isWhitelisted = !!whitelistData
        if (isWhitelisted) {
          setWhitelistCache(prev => new Set(prev).add(email.toLowerCase()))
        }
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        firstName: supabaseUser.user_metadata?.full_name?.split(' ')[0] || supabaseUser.user_metadata?.first_name,
        lastName: supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || supabaseUser.user_metadata?.last_name,
        imageUrl: supabaseUser.user_metadata?.avatar_url,
        role: isAdmin ? 'admin' : 'user',
        status: isWhitelisted ? 'active' : 'inactive',
        loginCount: 0,
        isActive: isWhitelisted,
        permissions: isAdmin ? ['admin:all'] : (isWhitelisted ? ['user:basic'] : [])
      }
      
      setUser(authUser)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error setting user from session:', error)
      // Fallback to basic user info
      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        firstName: supabaseUser.user_metadata?.first_name,
        lastName: supabaseUser.user_metadata?.last_name,
        imageUrl: supabaseUser.user_metadata?.avatar_url,
        role: 'user',
        status: 'active',
        loginCount: 0,
        isActive: true,
        permissions: ['user:basic']
      }
      
      setUser(authUser)
      setIsAuthenticated(true)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isLoaded: !isLoading,
    isSignedIn: isAuthenticated,
    signOut,
    signIn,
    isAdmin,
    isWhitelisted,
    checkWhitelist,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}