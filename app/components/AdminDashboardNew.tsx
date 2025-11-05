'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { UserService } from '../services/userService'
import { AdminOnly, RoleGuard, PermissionGuard } from './RoleBasedComponents'
import type { UserProfile } from '../types'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  moderatorUsers: number
  recentSignups: number
}

interface UserActivity {
  id: string
  type: 'signup' | 'login' | 'profile_update' | 'role_change' | 'status_change'
  userId: string
  userEmail: string
  description: string
  timestamp: string
}

export const AdminDashboard: React.FC = () => {
  const { user, refreshUserData } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    moderatorUsers: 0,
    recentSignups: 0
  })
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'activity' | 'settings'>('overview')

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load users
      const users = await UserService.getAllUsers(100, 0)
      
      // Calculate stats
      const totalUsers = users.length
      const activeUsers = users.filter(u => u.status === 'active').length
      const adminUsers = users.filter(u => u.role === 'admin').length
      const moderatorUsers = users.filter(u => u.role === 'moderator').length
      const recentSignups = users.filter(u => {
        const signupDate = new Date(u.createdAt)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return signupDate > weekAgo
      }).length

      setStats({
        totalUsers,
        activeUsers,
        adminUsers,
        moderatorUsers,
        recentSignups
      })

      // Get recent users (last 10)
      setRecentUsers(users.slice(0, 10))

      // Mock recent activity (in real app, this would come from an activity log)
      setRecentActivity([
        {
          id: '1',
          type: 'signup',
          userId: users[0]?.id || '',
          userEmail: users[0]?.email || '',
          description: 'New user registered',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'role_change',
          userId: users[1]?.id || '',
          userEmail: users[1]?.email || '',
          description: 'User role updated to moderator',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'status_change',
          userId: users[2]?.id || '',
          userEmail: users[2]?.email || '',
          description: 'User status changed to suspended',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const success = await UserService.updateUserRole(userId, newRole as any, user!.id)
      if (success) {
        await loadDashboardData()
        await refreshUserData()
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleUserStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      const success = await UserService.updateUserStatus(userId, newStatus as any, user!.id)
      if (success) {
        await loadDashboardData()
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Quản lý hệ thống và người dùng</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Tổng quan', icon: '📊' },
              { id: 'users', name: 'Người dùng', icon: '👥' },
              { id: 'activity', name: 'Hoạt động', icon: '📈' },
              { id: 'settings', name: 'Cài đặt', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Người dùng hoạt động</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Moderators</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.moderatorUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">👑</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.adminUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Người dùng gần đây</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <span className="text-lg">
                          {activity.type === 'signup' ? '👤' :
                           activity.type === 'login' ? '🔐' :
                           activity.type === 'profile_update' ? '📝' :
                           activity.type === 'role_change' ? '🔄' :
                           '⚠️'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.userEmail}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Quản lý người dùng</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Thêm người dùng
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tham gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map((userItem) => (
                    <tr key={userItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {userItem.firstName?.charAt(0) || userItem.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.firstName} {userItem.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleUserRoleUpdate(userItem.id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md"
                        >
                          <option value="guest">Khách</option>
                          <option value="user">Người dùng</option>
                          <option value="moderator">Điều hành viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={userItem.status}
                          onChange={(e) => handleUserStatusUpdate(userItem.id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md"
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Không hoạt động</option>
                          <option value="suspended">Đình chỉ</option>
                          <option value="pending">Chờ duyệt</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(userItem.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <PermissionGuard resource="users" action="write">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            Sửa
                          </button>
                        </PermissionGuard>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {selectedTab === 'activity' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Nhật ký hoạt động</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">
                      {activity.type === 'signup' ? '👤' :
                       activity.type === 'login' ? '🔐' :
                       activity.type === 'profile_update' ? '📝' :
                       activity.type === 'role_change' ? '🔄' :
                       '⚠️'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.userEmail}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt hệ thống</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Cài đặt chung</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email thông báo
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                      <span className="ml-2 text-sm text-gray-700">
                        Cho phép đăng ký tự do
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Bảo mật</h4>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                      <span className="ml-2 text-sm text-gray-700">
                        Yêu cầu xác thực 2FA cho admin
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                      <span className="ml-2 text-sm text-gray-700">
                        Lưu nhật ký đăng nhập
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminOnly>
  )
}

export default AdminDashboard