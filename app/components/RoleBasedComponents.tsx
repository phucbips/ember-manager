'use client'

import React from 'react'
import { useAuth, useCanAccess } from '../hooks/useAuth'

interface PermissionGuardProps {
  children: React.ReactNode
  resource: string
  action?: string
  fallback?: React.ReactNode
  requireAll?: boolean // If true, user must have ALL the specified permissions
  permissions?: Array<{ resource: string; action?: string }>
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action = 'read',
  fallback = null,
  requireAll = false,
  permissions
}) => {
  const { canAccess, user, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return fallback
  }
  
  // Handle multiple permissions
  if (permissions) {
    const checks = permissions.map(p => canAccess(p.resource, p.action || 'read'))
    
    if (requireAll) {
      if (!checks.every(Boolean)) {
        return fallback
      }
    } else {
      if (!checks.some(Boolean)) {
        return fallback
      }
    }
  } else {
    // Handle single permission
    if (!canAccess(resource, action)) {
      return fallback
    }
  }
  
  return <>{children}</>
}

interface RoleGuardProps {
  children: React.ReactNode
  roles: string[]
  fallback?: React.ReactNode
  requireAll?: boolean
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  fallback = null,
  requireAll = false
}) => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return fallback
  }
  
  const checks = roles.map(role => user.role === role)
  
  if (requireAll) {
    if (!checks.every(Boolean)) {
      return fallback
    }
  } else {
    if (!checks.some(Boolean)) {
      return fallback
    }
  }
  
  return <>{children}</>
}

interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  return (
    <PermissionGuard resource="admin" action="admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

interface ModeratorOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ModeratorOnly: React.FC<ModeratorOnlyProps> = ({ children, fallback = null }) => {
  return (
    <RoleGuard roles={['admin', 'moderator']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

interface AuthenticatedOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AuthenticatedOnly: React.FC<AuthenticatedOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  const { isAuthenticated, isActive, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated || !isActive) {
    return fallback
  }
  
  return <>{children}</>
}

interface ActiveUserOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ActiveUserOnly: React.FC<ActiveUserOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  const { isActive, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!isActive) {
    return fallback
  }
  
  return <>{children}</>
}

// Permission-aware components
interface PermissionIconProps {
  resource: string
  action?: string
  className?: string
}

export const PermissionIcon: React.FC<PermissionIconProps> = ({ 
  resource, 
  action = 'read',
  className = "w-4 h-4" 
}) => {
  const { canAccess } = useAuth()
  
  const hasPermission = canAccess(resource, action)
  
  return (
    <div 
      className={`${className} ${hasPermission ? 'text-green-500' : 'text-gray-400'}`}
      title={hasPermission ? 'Có quyền' : 'Không có quyền'}
    >
      {hasPermission ? '✓' : '✗'}
    </div>
  )
}

interface RoleBadgeProps {
  userId?: string
  showIcon?: boolean
  className?: string
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  userId,
  showIcon = true,
  className = "px-2 py-1 rounded text-xs font-medium" 
}) => {
  const { user, getRoleDisplayName } = useAuth()
  
  if (userId && userId !== user?.id) {
    return null
  }
  
  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    moderator: 'bg-blue-100 text-blue-800', 
    user: 'bg-green-100 text-green-800',
    guest: 'bg-gray-100 text-gray-800'
  }
  
  const roleIcons = {
    admin: '👑',
    moderator: '⭐',
    user: '👤',
    guest: '👁'
  }
  
  const role = user?.role || 'user'
  const displayName = getRoleDisplayName()
  const colorClass = roleColors[role] || roleColors.user
  const icon = showIcon ? roleIcons[role] : ''
  
  return (
    <span className={`${className} ${colorClass}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {displayName}
    </span>
  )
}

interface UserStatusBadgeProps {
  userId?: string
  className?: string
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ 
  userId,
  className = "px-2 py-1 rounded text-xs font-medium" 
}) => {
  const { user } = useAuth()
  
  if (userId && userId !== user?.id) {
    return null
  }
  
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-blue-100 text-blue-800'
  }
  
  const statusIcons = {
    active: '✅',
    inactive: '⏸',
    suspended: '🚫',
    pending: '⏳'
  }
  
  const status = user?.status || 'inactive'
  const colorClass = statusColors[status] || statusColors.inactive
  const icon = statusIcons[status]
  
  const statusNames = {
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    suspended: 'Đình chỉ',
    pending: 'Chờ duyệt'
  }
  
  return (
    <span className={`${className} ${colorClass}`}>
      <span className="mr-1">{icon}</span>
      {statusNames[status]}
    </span>
  )
}

// Loading skeleton component
export const AuthLoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  )
}

// Error boundary cho permission errors
export const PermissionErrorBoundary: React.FC<{ 
  children: React.ReactNode
  fallback?: React.ReactNode 
}> = ({ children, fallback = null }) => {
  return (
    <PermissionGuard resource="general" action="read" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}