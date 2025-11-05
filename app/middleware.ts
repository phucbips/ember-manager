import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'
import { UserService, AuthHelpers } from './services/userService'

// Environment variables với validation
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'thanhphucn06@gmail.com'

// Cấu hình routes với role-based access
const ROUTES_CONFIG = {
  // Public routes không cần authentication
  PUBLIC: [
    '/',
    '/sign-in',
    '/sign-up', 
    '/api/auth',
    '/api/health',
    '/_next/static',
    '/_next/image',
    '/favicon.ico',
    '/assets'
  ],
  
  // Routes cần admin role
  ADMIN: [
    '/admin',
    '/api/admin',
    '/api/users',
    '/api/users/*',
    '/admin/*'
  ],
  
  // Routes cần moderator role hoặc cao hơn
  MODERATOR: [
    '/moderator',
    '/api/moderation',
    '/api/audit'
  ],
  
  // Routes cần authenticated user (user role trở lên)
  AUTHENTICATED: [
    '/dashboard',
    '/quizzes',
    '/profile',
    '/api/quizzes',
    '/api/attempts',
    '/api/profile'
  ],
  
  // Routes cần active status
  ACTIVE_ONLY: [
    '/dashboard/*',
    '/quizzes/*',
    '/api/quizzes/*'
  ]
} as const

// Type definitions
import type { UserRoleType, UserStatusType } from './types'

type UserContext = {
  id: string
  email: string
  role: UserRoleType
  status: UserStatusType
  permissions: string[]
  hasValidSession: boolean
  isActive: boolean
}

// Error response helpers
function createErrorResponse(
  message: string, 
  status: number, 
  code: string
) {
  return {
    error: {
      message,
      code,
      status
    }
  }
}

// Helper function để kiểm tra route matching
function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}

// Helper function để validate user data
function validateUser(user: any): user is { id: string; email?: string } {
  return user && typeof user.id === 'string' && user.id.length > 0
}

// Main middleware function
export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    const pathname = request.nextUrl.pathname

    // Early return cho public routes
    if (matchesRoute(pathname, ROUTES_CONFIG.PUBLIC)) {
      return res
    }

    // Get session với error handling
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          createErrorResponse('Session validation failed', 401, 'SESSION_ERROR'),
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Check authentication
    if (!session || !validateUser(session.user)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          createErrorResponse('Authentication required', 401, 'AUTH_REQUIRED'),
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Extract user context từ database
    const userContext: UserContext = {
      id: session.user.id,
      email: session.user.email?.toLowerCase() || '',
      role: 'user', // Default role
      status: 'active', // Default status
      permissions: [],
      hasValidSession: true,
      isActive: false
    }

    try {
      // Lấy thông tin user từ database
      const userProfile = await UserService.getUserProfile(session.user.id)
      
      if (userProfile) {
        userContext.role = userProfile.role
        userContext.status = userProfile.status
        userContext.isActive = userProfile.status === 'active'
      } else {
        // Nếu user chưa có profile, tạo mới với role mặc định
        const defaultProfile = await UserService.createUser({
          email: userContext.email,
          role: 'user',
          status: 'active',
          firstName: session.user.user_metadata?.first_name,
          lastName: session.user.user_metadata?.last_name,
          createdBy: session.user.id
        })
        
        if (defaultProfile) {
          userContext.role = defaultProfile.role
          userContext.status = defaultProfile.status
          userContext.isActive = defaultProfile.status === 'active'
        }
      }

      // Fallback logic: Nếu email match với admin email, set role admin
      if (userContext.email === ADMIN_EMAIL.toLowerCase() && userContext.role !== 'admin') {
        await UserService.updateUserRole(session.user.id, 'admin', session.user.id)
        userContext.role = 'admin'
      }

      // Lấy permissions dựa trên role
      const rolePermissions = await UserService.getRolePermissions(userContext.role)
      userContext.permissions = rolePermissions
        .filter(p => p.isAllowed)
        .map(p => `${p.resource}:${p.action}`)
      
      // Ghi nhận login activity
      if (userContext.isActive) {
        await UserService.recordUserLogin(session.user.id)
      }

    } catch (error) {
      console.error('User context validation failed:', error)
      
      // Fallback logic: Check whitelist cho backward compatibility
      try {
        const { data: whitelistData } = await supabase
          .from('whitelist')
          .select('id')
          .eq('email', userContext.email)
          .maybeSingle()
        
        if (whitelistData) {
          userContext.role = 'user'
          userContext.status = 'active'
          userContext.isActive = true
        } else {
          // Set default inactive status nếu không có whitelist
          userContext.status = 'inactive'
          userContext.isActive = false
        }
      } catch (whitelistError) {
        console.error('Whitelist fallback check failed:', whitelistError)
        userContext.status = 'inactive'
        userContext.isActive = false
      }
    }

    // Check admin routes
    if (matchesRoute(pathname, ROUTES_CONFIG.ADMIN)) {
      if (userContext.role !== 'admin' || !userContext.isActive) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            createErrorResponse('Admin access required', 403, 'ADMIN_REQUIRED'),
            { status: 403 }
          )
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Check moderator routes
    if (matchesRoute(pathname, ROUTES_CONFIG.MODERATOR)) {
      if (!['admin', 'moderator'].includes(userContext.role) || !userContext.isActive) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            createErrorResponse('Moderator access required', 403, 'MODERATOR_REQUIRED'),
            { status: 403 }
          )
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Check authenticated routes
    if (matchesRoute(pathname, ROUTES_CONFIG.AUTHENTICATED)) {
      if (!userContext.isActive) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            createErrorResponse('Active account required', 403, 'ACCOUNT_INACTIVE'),
            { status: 403 }
          )
        }
        return NextResponse.redirect(new URL('/account-inactive', request.url))
      }
    }

    // Thêm user context vào headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', userContext.id)
    requestHeaders.set('x-user-email', userContext.email)
    requestHeaders.set('x-user-role', userContext.role)
    requestHeaders.set('x-user-status', userContext.status)
    requestHeaders.set('x-is-active', userContext.isActive.toString())
    requestHeaders.set('x-permissions', userContext.permissions.join(','))
    requestHeaders.set('x-auth-method', 'supabase')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Middleware error:', error)
    
    // Generic error response
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR'),
        { status: 500 }
      )
    }
    
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
}

// Route protection test function
export async function testRouteProtection(request: NextRequest) {
  const testCases = [
    {
      path: '/dashboard',
      expectedStatus: 401, // Should redirect to sign-in for unauthenticated
      description: 'Protected route without auth'
    },
    {
      path: '/admin',
      expectedStatus: 401, // Should redirect to sign-in for unauthenticated
      description: 'Admin route without auth'
    },
    {
      path: '/api/quizzes',
      expectedStatus: 401, // Should return 401 JSON response
      description: 'API protected route without auth'
    },
    {
      path: '/api/admin/users',
      expectedStatus: 401, // Should return 401 JSON response
      description: 'API admin route without auth'
    },
    {
      path: '/sign-in',
      expectedStatus: 200, // Should allow access
      description: 'Public auth route'
    },
    {
      path: '/',
      expectedStatus: 200, // Should allow access
      description: 'Home page'
    }
  ]

  return testCases
}

// Enhanced middleware configuration
export const config = {
  matcher: [
    // Include all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|webp|svg|css|js)$).*)',
  ],
}