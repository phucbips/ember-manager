import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth Error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }
  
  // Handle successful OAuth flow
  if (code) {
    try {
      const supabase = createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL('/login?error=authentication_failed', request.url)
        )
      }
      
      // Check if user exists in whitelist if needed
      const user = data.user
      if (user) {
        // Optionally check whitelist here
        // const isWhitelisted = await checkWhitelist(user.email)
        // if (!isWhitelisted) {
        //   return NextResponse.redirect(
        //     new URL('/login?error=not_authorized', request.url)
        //   )
        // }
      }
      
      // Redirect to dashboard on successful authentication
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL('/login?error=callback_failed', request.url)
      )
    }
  }
  
  // Invalid request
  return NextResponse.redirect(new URL('/login?error=invalid_request', request.url))
}