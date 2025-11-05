'use client'

import { UserButton } from './AuthButtons'
import { useQuizzes } from './hooks/useQuizzes'
import QuizForm from './QuizForm'
import Spinner from './Spinner'
import { formatDate } from '../types'
import type { Quiz } from '../types'
import type { AuthUser, UserRole } from '../types'
import { DeleteIcon } from './Icons'

interface UserDashboardProps {
  user: AuthUser
  userRole: UserRole
}

export default function UserDashboard({ user, userRole }: UserDashboardProps) {
  const { quizzes, isLoading, addQuiz, deleteQuiz } = useQuizzes()

  const handleAddQuiz = async (embedCode: string) => {
    await addQuiz(embedCode)
  }

  const handleDeleteQuiz = async (quizId: string) => {
    await deleteQuiz(quizId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📚 My Quizzes</h1>
              <p className="text-sm text-gray-500">Welcome, {user.firstName || user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Whitelisted User
              </span>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Add Quiz Section */}
        <div className="mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Quiz</h2>
            <QuizForm onSubmit={handleAddQuiz} />
          </div>
        </div>

        {/* My Quizzes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              My Quizzes ({quizzes.length})
            </h2>
            
            {quizzes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">You haven't created any quizzes yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz: Quiz) => (
                  <div key={quiz.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {quiz.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete quiz"
                      >
                        <DeleteIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      Created: {formatDate(quiz.createdAt)}
                    </p>
                    
                    <div className="bg-gray-100 rounded p-2 mb-3">
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {quiz.embedCode}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <a
                        href={quiz.quizUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        View Quiz →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}