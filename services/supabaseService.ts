import { supabase, ADMIN_EMAIL } from '../lib/supabase'
import type { Quiz, WhitelistEntry } from '../types'
import { extractSrcAndTitle } from '../types'

// Quiz Service Functions
export const addQuiz = async (ownerId: string, embedCode: string, ownerEmail?: string): Promise<{ quizUrl: string; title: string }> => {
  if (!embedCode || !embedCode.trim()) {
    throw new Error('Embed code cannot be empty.')
  }

  const { src, title } = extractSrcAndTitle(embedCode)

  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      title,
      embed_code: embedCode,
      quiz_url: src,
      owner_id: ownerId,
      owner_email: ownerEmail,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add quiz: ${error.message}`)
  }

  return { quizUrl: src, title }
}

export const getQuizzes = async (): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch quizzes: ${error.message}`)
  }

  return data || []
}

export const getQuizzesByUser = async (userId: string): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch user quizzes: ${error.message}`)
  }

  return data || []
}

export const deleteQuiz = async (quizId: string): Promise<void> => {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId)

  if (error) {
    throw new Error(`Failed to delete quiz: ${error.message}`)
  }
}

// Whitelist Service Functions
export const isUserWhitelisted = async (email: string): Promise<boolean> => {
  if (!email) return false

  const { data, error } = await supabase
    .from('whitelist')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (error) {
    console.error('Error checking whitelist status:', error)
    return false
  }

  return !!data
}

export const addToWhitelist = async (email: string): Promise<void> => {
  const emailToAdd = email.toLowerCase()

  // Check if already whitelisted
  const { data: existing } = await supabase
    .from('whitelist')
    .select('id')
    .eq('email', emailToAdd)
    .maybeSingle()

  if (existing) {
    throw new Error('Email is already on the whitelist.')
  }

  const { error } = await supabase
    .from('whitelist')
    .insert({ email: emailToAdd })

  if (error) {
    throw new Error(`Failed to add to whitelist: ${error.message}`)
  }
}

export const removeFromWhitelist = async (email: string): Promise<void> => {
  const emailToRemove = email.toLowerCase()

  const { error } = await supabase
    .from('whitelist')
    .delete()
    .eq('email', emailToRemove)

  if (error) {
    throw new Error(`Failed to remove from whitelist: ${error.message}`)
  }
}

export const getWhitelist = async (): Promise<WhitelistEntry[]> => {
  const { data, error } = await supabase
    .from('whitelist')
    .select('*')
    .order('added_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch whitelist: ${error.message}`)
  }

  return data || []
}

// Role checking function
export const checkUserRole = (email: string): { isAdmin: boolean; isWhitelisted: boolean } => {
  const isAdmin = email === ADMIN_EMAIL
  return {
    isAdmin,
    isWhitelisted: !isAdmin // Admin doesn't need to be whitelisted
  }
}