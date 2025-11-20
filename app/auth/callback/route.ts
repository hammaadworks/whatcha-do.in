import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('Error exchanging code for session:', error)
    
    // Redirect to error page with error message
    const errorUrl = new URL('/auth/auth-code-error', origin)
    errorUrl.searchParams.set('error', error.message || 'Failed to authenticate')
    return NextResponse.redirect(errorUrl.toString())
  }

  // No code provided
  const errorUrl = new URL('/auth/auth-code-error', origin)
  errorUrl.searchParams.set('error', 'No authentication code provided')
  return NextResponse.redirect(errorUrl.toString())
}
