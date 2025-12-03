import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { RESERVED_USERNAMES } from "@/lib/constants";
import { createClient } from '@supabase/supabase-js'

export async function proxy(request: NextRequest) {
  // 1. Run Supabase Auth Session Update
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session
  await supabase.auth.getUser()

  // 2. Proxy / Routing Logic
  const pathname = request.nextUrl.pathname

  // Regex to match /username pattern (single segment)
  const usernameMatch = pathname.match(/^\/([a-zA-Z0-9_-]+)$/)

  // Exclusions
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/auth') || 
    pathname.startsWith('/logins') ||
    pathname === '/' ||
    pathname === '/me' || // Explicitly exclude /me
    pathname.includes('.') 
  ) {
    return supabaseResponse
  }

  if (usernameMatch) {
    const username = usernameMatch[1]
    const reservedRoutes = RESERVED_USERNAMES;
    
    if (reservedRoutes.includes(username)) {
      return supabaseResponse
    }

    // Check username existence using a lightweight client (Edge compatible)
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await anonSupabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (!data || error) {
        // Rewrite to not-found
        const notFoundUrl = request.nextUrl.clone()
        notFoundUrl.pathname = '/not-found'
        const rewriteResponse = NextResponse.rewrite(notFoundUrl)
        
        // Important: Copy over the cookies/headers from the auth response
        supabaseResponse.headers.forEach((value, key) => {
            rewriteResponse.headers.set(key, value)
        })
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            rewriteResponse.cookies.set(cookie)
        })
        
        rewriteResponse.headers.set('x-reason', 'user-not-found')
        return rewriteResponse
      }
    } catch (err) {
      console.error('Proxy error checking username:', err)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
