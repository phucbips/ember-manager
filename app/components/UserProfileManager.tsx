'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { UserService } from '../services/userService'
import { RoleBadge, UserStatusBadge } from './RoleBasedComponents'
import type { UserProfile, UserPreferences } from '../types'

interface UserProfileFormData {
  firstName: string
  lastName: string
  email: string
}

interface UserPreferencesFormData {
  theme: string
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisible: boolean
    activityVisible: boolean
  }
}

const defaultPreferences: UserPreferencesFormData = {
  theme: 'light',
  language: 'vi',
  notifications: {
    email: true,
    push: false,
    sms: false
  },
  privacy: {
    profileVisible: true,
    activityVisible: false
  }
}

export const UserProfileManager: React.FC = () => {
  const { user, userProfile, refreshUserData } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'activity'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [profileData, setProfileData] = useState<UserProfileFormData>({
    firstName: '',
    lastName: '',
    email: ''
  })

  const [preferencesData, setPreferencesData] = useState<UserPreferencesFormData>(defaultPreferences)

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email
      })
    }
    loadUserPreferences()
  }, [userProfile])

  const loadUserPreferences = async () => {
    if (!user) return

    try {
      const preferences = await UserService.getUserPreferences(user.id)
      const themePref = preferences.find(p => p.preferenceKey === 'theme')
      const languagePref = preferences.find(p => p.preferenceKey === 'language')
      const notificationsPref = preferences.find(p => p.preferenceKey === 'notifications')
      const privacyPref = preferences.find(p => p.preferenceKey === 'privacy')

      setPreferencesData({
        theme: themePref?.preferenceValue || 'light',
        language: languagePref?.preferenceValue || 'vi',
        notifications: notificationsPref?.preferenceValue || defaultPreferences.notifications,
        privacy: privacyPref?.preferenceValue || defaultPreferences.privacy
      })
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const success = await UserService.updateUserProfile(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName
      })

      if (success) {
        await refreshUserData()
        setSuccess('Cập nhật hồ sơ thành công!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError('Cập nhật hồ sơ thất bại!')
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi cập nhật hồ sơ!')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await Promise.all([
        UserService.updateUserPreference(user.id, 'theme', preferencesData.theme),
        UserService.updateUserPreference(user.id, 'language', preferencesData.language),
        UserService.updateUserPreference(user.id, 'notifications', preferencesData.notifications),
        UserService.updateUserPreference(user.id, 'privacy', preferencesData.privacy)
      ])

      setSuccess('Cập nhật cài đặt thành công!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError('Có lỗi xảy ra khi cập nhật cài đặt!')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý hồ sơ</h1>
        <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', name: 'Thông tin cá nhân', icon: '👤' },
            { id: 'preferences', name: 'Cài đặt', icon: '⚙️' },
            { id: 'security', name: 'Bảo mật', icon: '🔒' },
            { id: 'activity', name: 'Hoạt động', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
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

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">Email không thể thay đổi</p>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin tài khoản</h4>
              <div className="flex items-center space-x-4">
                <RoleBadge />
                <UserStatusBadge />
                <span className="text-sm text-gray-500">
                  Đăng nhập: {userProfile.loginCount} lần
                </span>
                <span className="text-sm text-gray-500">
                  Tham gia: {new Date(userProfile.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Cài đặt</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Giao diện</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giao diện</label>
                  <select
                    value={preferencesData.theme}
                    onChange={(e) => setPreferencesData({ ...preferencesData, theme: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="light">Sáng</option>
                    <option value="dark">Tối</option>
                    <option value="auto">Tự động</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngôn ngữ</label>
                  <select
                    value={preferencesData.language}
                    onChange={(e) => setPreferencesData({ ...preferencesData, language: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Thông báo</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferencesData.notifications.email}
                    onChange={(e) => setPreferencesData({
                      ...preferencesData,
                      notifications: { ...preferencesData.notifications, email: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferencesData.notifications.push}
                    onChange={(e) => setPreferencesData({
                      ...preferencesData,
                      notifications: { ...preferencesData.notifications, push: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Push notification</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferencesData.notifications.sms}
                    onChange={(e) => setPreferencesData({
                      ...preferencesData,
                      notifications: { ...preferencesData.notifications, sms: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">SMS</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Quyền riêng tư</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferencesData.privacy.profileVisible}
                    onChange={(e) => setPreferencesData({
                      ...preferencesData,
                      privacy: { ...preferencesData.privacy, profileVisible: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hiển thị hồ sơ công khai</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferencesData.privacy.activityVisible}
                    onChange={(e) => setPreferencesData({
                      ...preferencesData,
                      privacy: { ...preferencesData.privacy, activityVisible: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hiển thị hoạt động</span>
                </label>
              </div>
            </div>

            <div>
              <button
                onClick={handlePreferencesUpdate}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Bảo mật</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Thay đổi mật khẩu</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Cập nhật mật khẩu
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Xác thực hai yếu tố</h4>
              <p className="text-sm text-gray-600 mb-4">Thêm lớp bảo mật bổ sung cho tài khoản của bạn</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                Kích hoạt 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">🔐</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Đăng nhập thành công</p>
                  <p className="text-xs text-gray-500">
                    {userProfile.lastLoginAt ? 
                      new Date(userProfile.lastLoginAt).toLocaleString('vi-VN') : 
                      'Chưa có thông tin'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">👤</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Cập nhật hồ sơ</p>
                  <p className="text-xs text-gray-500">
                    {new Date(userProfile.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">📊</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Tổng số lần đăng nhập</p>
                  <p className="text-xs text-gray-500">{userProfile.loginCount} lần</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfileManager