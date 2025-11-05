import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { UserService, AuthHelpers } from '../../../../services/userService'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const userProfile = await UserService.getUserProfile(session.user.id)
    if (!userProfile || userProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Active account required' },
        { status: 403 }
      )
    }

    const targetUser = await UserService.getUserProfile(params.id)
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      )
    }

    // Check permissions:
    // - Admin can access all users
    // - User can access their own profile
    // - Moderator can access basic info of all users
    if (!AuthHelpers.isAdmin(userProfile) && 
        session.user.id !== params.id && 
        !AuthHelpers.isModerator(userProfile)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      data: targetUser
    })

  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const userProfile = await UserService.getUserProfile(session.user.id)
    if (!userProfile || userProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Active account required' },
        { status: 403 }
      )
    }

    // Check if user can update this profile
    const targetUser = await UserService.getUserProfile(params.id)
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      )
    }

    // Only admin can update other users, user can update their own profile
    if (session.user.id !== params.id && !AuthHelpers.isAdmin(userProfile)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required to update other users' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, role, status } = body

    const updates: any = {}
    
    // Basic profile updates (anyone can update their own)
    if (firstName !== undefined) updates.firstName = firstName
    if (lastName !== undefined) updates.lastName = lastName
    
    // Role and status updates (admin only)
    if (role && AuthHelpers.isAdmin(userProfile)) {
      updates.role = role
    }
    
    if (status && AuthHelpers.isAdmin(userProfile)) {
      updates.status = status
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No valid updates provided' },
        { status: 400 }
      )
    }

    const success = await UserService.updateUserProfile(params.id, updates)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to update user' },
        { status: 500 }
      )
    }

    const updatedUser = await UserService.getUserProfile(params.id)

    return NextResponse.json({
      data: updatedUser,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const userProfile = await UserService.getUserProfile(session.user.id)
    if (!userProfile || userProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Active account required' },
        { status: 403 }
      )
    }

    // Only admin can delete users
    if (!AuthHelpers.isAdmin(userProfile)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Prevent self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Suspend user instead of hard delete for data integrity
    const success = await UserService.updateUserProfile(params.id, {
      status: 'suspended'
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to suspend user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User suspended successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to suspend user' },
      { status: 500 }
    )
  }
}