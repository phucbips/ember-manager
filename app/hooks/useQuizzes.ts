import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { 
  getQuizzes, 
  getQuizzesByUser, 
  addQuiz, 
  deleteQuiz,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist 
} from '../services/supabaseService'
import type { Quiz, WhitelistEntry } from '../types'
import toast from 'react-hot-toast'

export const useQuizzes = () => {
  const { user, userRole, isSignedIn } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchQuizzes = async () => {
    if (!isSignedIn) return
    
    setIsLoading(true)
    try {
      let data: Quiz[]
      if (userRole?.isAdmin) {
        data = await getQuizzes() // Admin sees all quizzes
      } else {
        data = await getQuizzesByUser(user!.id) // Users see only their quizzes
      }
      setQuizzes(data)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setIsLoading(false)
    }
  }

  const addNewQuiz = async (embedCode: string) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const result = await addQuiz(
        user.id, 
        embedCode, 
        user.email
      )
      await fetchQuizzes() // Refresh the list
      toast.success('Quiz added successfully!')
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add quiz'
      toast.error(message)
      throw error
    }
  }

  const removeQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId)
      setQuizzes(prev => prev.filter(q => q.id !== quizId))
      toast.success('Quiz deleted successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete quiz'
      toast.error(message)
      throw error
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      fetchQuizzes()
    }
  }, [isSignedIn, userRole])

  return {
    quizzes,
    isLoading,
    addQuiz: addNewQuiz,
    deleteQuiz: removeQuiz,
    refetch: fetchQuizzes,
  }
}

export const useWhitelist = () => {
  const { userRole } = useAuth()
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchWhitelist = async () => {
    if (!userRole?.isAdmin) return
    
    setIsLoading(true)
    try {
      const data = await getWhitelist()
      setWhitelist(data)
    } catch (error) {
      console.error('Error fetching whitelist:', error)
      toast.error('Failed to load whitelist')
    } finally {
      setIsLoading(false)
    }
  }

  const addEmailToWhitelist = async (email: string) => {
    try {
      await addToWhitelist(email)
      await fetchWhitelist()
      toast.success('Email added to whitelist successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add email to whitelist'
      toast.error(message)
      throw error
    }
  }

  const removeEmailFromWhitelist = async (email: string) => {
    try {
      await removeFromWhitelist(email)
      await fetchWhitelist()
      toast.success('Email removed from whitelist successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove email from whitelist'
      toast.error(message)
      throw error
    }
  }

  useEffect(() => {
    if (userRole?.isAdmin) {
      fetchWhitelist()
    }
  }, [userRole])

  return {
    whitelist,
    isLoading,
    addToWhitelist: addEmailToWhitelist,
    removeFromWhitelist: removeEmailFromWhitelist,
    refetch: fetchWhitelist,
  }
}