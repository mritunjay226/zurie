import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@insforge/sdk/ssr'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  // Update session cookies to ensure tokens are rotated/maintained
  await updateSession({
    requestCookies: request.cookies,
    responseCookies: response.cookies
  })

  const path = request.nextUrl.pathname
  const hasAccessToken = request.cookies.has('insforge_access_token')

  // Protect dashboard: redirect to sign-in if guest
  if (path.startsWith('/dashboard')) {
    if (!hasAccessToken) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (path === '/sign-in' || path === '/sign-up' || path === '/') {
    if (hasAccessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
