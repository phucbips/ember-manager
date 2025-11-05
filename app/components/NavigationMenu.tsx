'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, useCanAccess } from '../hooks/useAuth'
import { AuthHelpers } from '../services/userService'
import { RoleBadge, UserStatusBadge } from './RoleBasedComponents'

interface NavigationItem {
  name: string
  href: string
  icon: string
  resource?: string
  action?: string
  roles?: string[]
  badge?: React.ReactNode
  children?: NavigationItem[]
}

interface NavigationProps {
  className?: string
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Trang chủ',
    href: '/',
    icon: '🏠',
    roles: ['guest', 'user', 'moderator', 'admin']
  },
  {
    name: 'Đăng nhập',
    href: '/sign-in',
    icon: '🔐',
    roles: ['guest']
  },
  {
    name: 'Đăng ký',
    href: '/sign-up',
    icon: '✍️',
    roles: ['guest']
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    resource: 'quizzes',
    action: 'read',
    roles: ['user', 'moderator', 'admin']
  },
  {
    name: 'Bài thi',
    href: '/quizzes',
    icon: '📝',
    resource: 'quizzes',
    action: 'read',
    roles: ['user', 'moderator', 'admin'],
    children: [
      {
        name: 'Danh sách bài thi',
        href: '/quizzes',
        icon: '📋',
        resource: 'quizzes',
        action: 'read',
        roles: ['user', 'moderator', 'admin']
      },
      {
        name: 'Tạo bài thi mới',
        href: '/quizzes/create',
        icon: '➕',
        resource: 'quizzes',
        action: 'write',
        roles: ['user', 'moderator', 'admin']
      }
    ]
  },
  {
    name: 'Cá nhân',
    href: '/profile',
    icon: '👤',
    roles: ['user', 'moderator', 'admin'],
    children: [
      {
        name: 'Thông tin cá nhân',
        href: '/profile',
        icon: '📝',
        roles: ['user', 'moderator', 'admin']
      },
      {
        name: 'Cài đặt',
        href: '/profile/settings',
        icon: '⚙️',
        roles: ['user', 'moderator', 'admin']
      },
      {
        name: 'Lịch sử đăng nhập',
        href: '/profile/sessions',
        icon: '📜',
        roles: ['user', 'moderator', 'admin']
      }
    ]
  },
  {
    name: 'Quản lý nội dung',
    href: '/moderation',
    icon: '🛡️',
    roles: ['moderator', 'admin'],
    children: [
      {
        name: 'Kiểm duyệt',
        href: '/moderation',
        icon: '👀',
        resource: 'quizzes',
        action: 'write',
        roles: ['moderator', 'admin']
      },
      {
        name: 'Báo cáo',
        href: '/moderation/reports',
        icon: '📊',
        resource: 'admin',
        action: 'read',
        roles: ['moderator', 'admin']
      }
    ]
  },
  {
    name: 'Quản trị',
    href: '/admin',
    icon: '👑',
    resource: 'admin',
    action: 'admin',
    roles: ['admin'],
    children: [
      {
        name: 'Tổng quan',
        href: '/admin',
        icon: '📈',
        resource: 'admin',
        action: 'admin',
        roles: ['admin']
      },
      {
        name: 'Quản lý người dùng',
        href: '/admin/users',
        icon: '👥',
        resource: 'users',
        action: 'read',
        roles: ['admin']
      },
      {
        name: 'Quản lý quyền',
        href: '/admin/roles',
        icon: '🔐',
        resource: 'users',
        action: 'write',
        roles: ['admin']
      },
      {
        name: 'Cài đặt hệ thống',
        href: '/admin/settings',
        icon: '⚙️',
        resource: 'admin',
        action: 'admin',
        roles: ['admin']
      },
      {
        name: 'Nhật ký hệ thống',
        href: '/admin/logs',
        icon: '📜',
        resource: 'admin',
        action: 'admin',
        roles: ['admin']
      }
    ]
  }
]

const NavigationItemComponent: React.FC<{
  item: NavigationItem
  isActive: boolean
  hasPermission: boolean
  isCollapsed: boolean
  level?: number
}> = ({ item, isActive, hasPermission, isCollapsed, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()
  const { canAccess } = useCanAccess(item.resource || '', item.action || 'read')

  if (!hasPermission) {
    return null
  }

  const paddingLeft = level * 16 + 16

  if (item.children && item.children.length > 0) {
    const hasAnyChildPermission = item.children.some(child => 
      canAccess(child.resource || '', child.action || 'read')
    )

    if (!hasAnyChildPermission) {
      return null
    }

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between ${
            isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          } ${isCollapsed ? 'justify-center' : ''}`}
          style={{ paddingLeft }}
        >
          <div className="flex items-center">
            <span className="text-lg mr-3">{item.icon}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </div>
          {!isCollapsed && (
            <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
          )}
        </button>
        {isExpanded && !isCollapsed && (
          <div className="ml-4">
            {item.children.map((child, index) => (
              <NavigationItemComponent
                key={index}
                item={child}
                isActive={pathname === child.href}
                hasPermission={canAccess(child.resource || '', child.action || 'read')}
                isCollapsed={isCollapsed}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link href={item.href}>
      <div
        className={`block px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
          isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        } ${isCollapsed ? 'text-center' : ''}`}
        style={{ paddingLeft }}
        title={isCollapsed ? item.name : ''}
      >
        <div className="flex items-center">
          <span className="text-lg mr-3">{item.icon}</span>
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.name}</span>
              {item.badge}
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export const NavigationMenu: React.FC<NavigationProps> = ({ 
  className = "w-64 bg-white shadow-lg" 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, isAuthenticated, getDisplayName } = useAuth()
  const pathname = usePathname()

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className={`${className} h-full overflow-y-auto`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {!isCollapsed && (
                <>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getDisplayName()}
                    </p>
                    <div className="flex items-center space-x-1">
                      <RoleBadge showIcon={false} />
                      <UserStatusBadge className="text-xs" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-gray-100"
          >
            {isCollapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="p-4 space-y-2">
        {navigationItems.map((item, index) => (
          <NavigationItemComponent
            key={index}
            item={item}
            isActive={pathname === item.href}
            hasPermission={
              !item.resource || 
              !item.action || 
              canAccess(item.resource, item.action)
            }
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="text-xs text-gray-500">
            <p>Phiên bản: 2.0.0</p>
            <p>© 2024 Role Management System</p>
          </div>
        </div>
      )}
    </nav>
  )
}

// Mobile Navigation Component
export const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="fixed inset-y-0 left-0 w-64 bg-white z-50">
            <NavigationMenu className="h-full" />
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default NavigationMenu