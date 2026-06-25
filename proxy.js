import { NextResponse } from 'next/server'

/**
 * Protected routes that require authentication.
 */
const PROTECTED_ROUTES = ['/add-lesson', '/my-lessons', '/dashboard']

export async function proxy(request) {
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

  // Redirect unauthenticated user away from protected routes
  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated user away from auth pages
  // NOTE: previously we redirected authenticated users away from auth pages.
  // That caused some valid users (or stale tokens) to be redirected unexpectedly.
  // To allow reliable access to `/auth/login` and `/auth/register`, do not
  // automatically redirect here. Keep protected-route redirect above.

  return NextResponse.next()
}

export { proxy as middleware }

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)',
  ],
}
