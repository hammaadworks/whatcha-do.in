import { NextResponse } from 'next/server'
import { createServerSideClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSideClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If the user was redirected to /me, we need to find their username
      if (next === '/me') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single()

          if (profile?.username) {
            return NextResponse.redirect(`${origin}/${profile.username}`)
          } else {
             // Fallback if username is missing
             return NextResponse.redirect(`${origin}/`)
          }
        }
      }

      // Default redirect
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
