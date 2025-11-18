import { NextResponse, type NextRequest } from 'next/server'
import { createServer } from "@/lib/supabase/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // // if user is not signed in and the current path is not / redirect the user to /
  // if (!user && request.nextUrl.pathname === '/dashboard') {
  //   return NextResponse.redirect(new URL('/', request.url))
  // }

  return response
}

