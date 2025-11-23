import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {getUserByUsernameServer} from '@/lib/supabase/user.server'; // Corrected import

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Regex to match /username pattern, but not /_next, /api, /static, etc.
  // This specifically targets paths that are a single segment starting with a character
  // and are not known Next.js internal paths or file extensions.
  const usernameMatch = pathname.match(/^\/([a-zA-Z0-9_-]+)$/);

  // Exclude internal Next.js paths and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Exclude paths with file extensions (e.g., favicon.ico)
  ) {
    return NextResponse.next();
  }

  if (usernameMatch) {
    const username = usernameMatch[1];
    const userExists = await getUserByUsernameServer(username); // Corrected function call

    if (!userExists) {
      // If username is invalid, rewrite to generic /not-found and set header
      const response = NextResponse.rewrite(new URL('/not-found', request.url));
      response.headers.set('x-reason', 'user-not-found');
      return response;
    }
  }

  return NextResponse.next(); // Continue to the next middleware or page
}

export const config = {
  // Match all paths to be safe, but filter internally.
  // Or refine matcher to only target dynamic routes more precisely.
  matcher: ['/:path*'],
};