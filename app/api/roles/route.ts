import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { UserService, AuthHelpers } from '../../../services/userService'
import type { UserRoleType } from '../../types'

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

    const userProfile = await UserService.getUserProfile(session.user.id)
    if (!userProfile || userProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Active account required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as UserRoleType | null

    if (role) {
      // Get permissions for specific role
      const permissions = await UserService.getRolePermissions(role)
      return NextResponse.json({
        data: permissions
      })
    } else {
      // Get all permissions
      const allPermissions: Record<UserRoleType, any> = {} as any
      const roles: UserRoleType[] = ['admin', 'moderator', 'user', 'guest']
      
      for (const r of roles) {
        allPermissions[r] = await UserService.getRolePermissions(r)
      }
      
      return NextResponse.json({
        data: allPermissions
      })
    }

  } catch (error) {
    console.error('Error in GET /api/roles:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch role permissions' },
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

    const userProfile = await UserService.getUserProfile(session.user.id)
    if (!userProfile || userProfile.status !== 'active') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Active account required' },
        { status: 403 }
      )
    }

    // Only admin can modify role permissions
    if (!AuthHelpers.isAdmin(userProfile)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { role, resource, action, isAllowed } = body

    // Validate input
    if (!role || !resource || !action) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Role, resource, and action are required' },
        { status: 400 }
      )
    }

    // Use Supabase directly to insert/update permission
    const { error } = await supabase
      .from('role_permissions')
      .upsert({
        role,
        resource,
        action,
        is_allowed: isAllowed,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'role,resource,action'
      })

    if (error) {
      console.error('Error updating permission:', error)
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to update permission' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Permission updated successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/roles:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update permission' },
      { status: 500 }
    )
  }
}