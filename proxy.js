import { NextResponse } from 'next/server'

/**
 * Minimal middleware — no auth checks, just pass through.
 */
export async function proxy(request) {
  return NextResponse.next()
}

export { proxy as middleware }

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)',
  ],
}
