import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { UserService, AuthHelpers } from '../../../services/userService'
import type { UserRoleType, UserStatusType } from '../../types'

export async function GET(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user context from database
    const userProfile = await UserService.getUserProfile(session.user.id)
    if (!userProfile || userProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Active account required' },
        { status: 403 }
      )
    }

    // Check if user is admin
    if (!AuthHelpers.isAdmin(userProfile)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const role = searchParams.get('role') as UserRoleType | null
    const status = searchParams.get('status') as UserStatusType | null
    const search = searchParams.get('search') || ''

    // Get users based on filters
    let users = await UserService.getAllUsers(limit, offset)

    // Apply filters
    if (role) {
      users = users.filter(user => user.role === role)
    }
    
    if (status) {
      users = users.filter(user => user.status === status)
    }
    
    if (search) {
      users = users.filter(user => 
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.firstName && user.firstName.toLowerCase().includes(search.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(search.toLowerCase()))
      )
    }

    return NextResponse.json({
      data: users,
      pagination: {
        limit,
        offset,
        total: users.length
      }
    })

  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user context from database
    const userProfile = await UserService.getUserProfile(session.user.id)
    if (!userProfile || userProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Active account required' },
        { status: 403 }
      )
    }

    // Check if user is admin
    if (!AuthHelpers.isAdmin(userProfile)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, role = 'user', status = 'active', firstName, lastName } = body

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await UserService.getUserProfileByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Conflict', message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await UserService.createUser({
      email,
      role,
      status,
      firstName,
      lastName,
      createdBy: session.user.id
    })

    if (!newUser) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: newUser,
      message: 'User created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to create user' },
      { status: 500 }
    )
  }
}