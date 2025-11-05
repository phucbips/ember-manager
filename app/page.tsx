'use client'

import { useAuth } from './hooks/useAuth'
import { SignInButton } from './components/AuthButtons'
import AdminDashboard from './components/AdminDashboard'
import UserDashboard from './components/UserDashboard'
import Spinner from './components/Spinner'

export default function HomePage() {
  const { user, userRole, isLoaded, isSignedIn, isLoading } = useAuth()

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">📚 Embed Manager</h1>
          <p className="text-gray-600 mb-6">Sign in to your account</p>
          <SignInButton />
        </div>
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>A simple solution for content embedding with Supabase authentication.</p>
        </footer>
      </div>
    )
  }

  if (user && userRole?.isAdmin) {
    return <AdminDashboard user={user} userRole={userRole} />
  }

  if (user && userRole?.isWhitelisted) {
    return <UserDashboard user={user} userRole={userRole} />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">🚫 Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this application. Please contact the administrator.
        </p>
        <p className="text-sm text-gray-500">
          Your email: {userRole?.email}
        </p>
      </div>
    </div>
  )
}