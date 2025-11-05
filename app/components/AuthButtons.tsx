'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

const Button = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false, 
  variant = 'primary' 
}: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  }
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  )
}

export const SignInButton = ({ 
  children = 'Sign In',
  className = '',
  variant = 'primary',
  onSuccess
}: {
  children?: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  onSuccess?: () => void
}) => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    setIsLoading(true)
    const { error } = await signIn(email, password)
    
    if (error) {
      toast.error(`Sign in error: ${error}`)
    } else {
      setShowForm(false)
      setEmail('')
      setPassword('')
      toast.success('Signed in successfully!')
      onSuccess?.()
    }
    setIsLoading(false)
  }

  if (showForm) {
    return (
      <div className={`sign-in-form ${className}`}>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="secondary"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Button
        onClick={() => setShowForm(true)}
        variant={variant}
      >
        {children}
      </Button>
    </div>
  )
}

export const SignUpButton = ({ 
  children = 'Sign Up',
  className = '',
  variant = 'primary',
  onSuccess
}: {
  children?: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  onSuccess?: () => void
}) => {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    const { error } = await signUp(email, password)
    
    if (error) {
      toast.error(`Sign up error: ${error}`)
    } else {
      setShowForm(false)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      toast.success('Account created successfully!')
      onSuccess?.()
    }
    setIsLoading(false)
  }

  if (showForm) {
    return (
      <div className={`sign-up-form ${className}`}>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
            onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleSignUp}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Sign Up'}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="secondary"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Button
        onClick={() => setShowForm(true)}
        variant={variant}
      >
        {children}
      </Button>
    </div>
  )
}

export const SignOutButton = ({ 
  children = 'Sign Out',
  className = '',
  variant = 'ghost',
  onClick
}: {
  children?: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  onClick?: () => void
}) => {
  const { signOut, isLoading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
      toast.success('Signed out successfully!')
      onClick?.()
      router.push('/')
    }
  }

  return (
    <div className={className}>
      <Button
        onClick={handleSignOut}
        disabled={isLoading}
        variant={variant}
      >
        {children}
      </Button>
    </div>
  )
}

export const UserButton = ({ 
  className = '',
  afterSignOutUrl = '/'
}: {
  className?: string
  afterSignOutUrl?: string
}) => {
  const { user, userRole, signOut, isLoading } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  if (!user) {
    return (
      <Button onClick={() => setShowMenu(!showMenu)} className={className}>
        Guest
      </Button>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2"
        variant="ghost"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.email}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline">
          {user.firstName || user.email?.split('@')[0]}
        </span>
        {userRole?.isAdmin && (
          <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
            Admin
          </span>
        )}
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {user.firstName || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {userRole && (
              <p className="text-xs text-gray-500 mt-1">
                {userRole.isAdmin ? 'Administrator' : 'User'}
                {!userRole.isAdmin && !userRole.isWhitelisted && ' (Not Whitelisted)'}
              </p>
            )}
          </div>
          
          <div className="py-1">
            <button
              onClick={() => {
                setShowMenu(false)
                // Could add profile page navigation here
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </button>
            
            {userRole?.isAdmin && (
              <button
                onClick={() => {
                  setShowMenu(false)
                  router.push('/admin')
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Admin Dashboard
              </button>
            )}
            
            <button
              onClick={() => {
                setShowMenu(false)
                router.push('/dashboard')
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </button>
            
            <button
              onClick={() => {
                setShowMenu(false)
                router.push('/quizzes')
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              My Quizzes
            </button>
          </div>
          
          <div className="border-t border-gray-200 py-1">
            <SignOutButton
              onClick={() => {
                setShowMenu(false)
                signOut()
                if (afterSignOutUrl) {
                  router.push(afterSignOutUrl)
                }
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              variant="ghost"
            >
              Sign Out
            </SignOutButton>
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}