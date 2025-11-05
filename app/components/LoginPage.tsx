import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'
import type { NotificationMessage } from '../types';
import Spinner from './Spinner';
import { SignInButton, SignUpButton } from './AuthButtons';

interface LoginPageProps {
  onNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNotification }) => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
        <Spinner />
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Embed Manager
            </h1>
            <p className="text-gray-600">
              A simple solution for content embedding with Supabase
            </p>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Successfully Signed In!
              </h2>
              <p className="text-gray-600 mb-4">
                Welcome back, {user.firstName || user.email}!
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Go to Dashboard
                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl mb-2">🔐</div>
              <h3 className="font-semibold text-gray-900 text-sm">Secure</h3>
              <p className="text-gray-600 text-xs">Supabase Authentication</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">🗄️</div>
              <h3 className="font-semibold text-gray-900 text-sm">Reliable</h3>
              <p className="text-gray-600 text-xs">Supabase Database</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900 text-sm">Fast</h3>
              <p className="text-gray-600 text-xs">React & Vite</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Embed Manager. Built with Supabase.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Embed Manager
          </h1>
          <p className="text-gray-600">
            A simple solution for content embedding with Supabase
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'signin'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {activeTab === 'signin' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                  Welcome Back
                </h2>
                <SignInButton onSuccess={() => onNotification('Signed in successfully!', 'success')} />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                  Create Account
                </h2>
                <SignUpButton onSuccess={() => onNotification('Account created successfully!', 'success')} />
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-semibold text-gray-900 text-sm">Secure</h3>
            <p className="text-gray-600 text-xs">Supabase Authentication</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">🗄️</div>
            <h3 className="font-semibold text-gray-900 text-sm">Reliable</h3>
            <p className="text-gray-600 text-xs">Supabase Database</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 text-sm">Fast</h3>
            <p className="text-gray-600 text-xs">React & Vite</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>&copy; 2025 Embed Manager. Built with Supabase.</p>
      </footer>
    </div>
  );
};

export default LoginPage;