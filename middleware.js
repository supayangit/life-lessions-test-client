import { NextResponse } from 'next/server'

/**
 * Protected routes that require authentication.
 */
const PROTECTED_ROUTES = ['/add-lesson', '/my-lessons', '/dashboard']

/**
 * Routes only accessible to unauthenticated users.
 */
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Read the session token from cookies set by better-auth
  const sessionToken =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value

  // Consider a token valid only if it's a non-empty, non-placeholder string
  const isAuthenticated =
    Boolean(sessionToken) &&
    sessionToken !== 'undefined' &&
    sessionToken !== 'null' &&
    (typeof sessionToken === 'string' ? sessionToken.length > 10 : true)
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)',
  ],
}
