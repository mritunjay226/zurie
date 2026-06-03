import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, setAuthCookies } from '@insforge/sdk/ssr'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('insforge_code')
  const oauthError = request.nextUrl.searchParams.get('error')

  if (oauthError || !code) {
    if (oauthError) {
      console.warn('OAuth callback failed', { error: oauthError })
    }
    return NextResponse.redirect(new URL('/sign-in?error=oauth_failed', request.url))
  }

  const cookieStore = await cookies()
  const codeVerifier = cookieStore.get('insforge_code_verifier')?.value
  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/sign-in?error=missing_verifier', request.url))
  }

  const client = createServerClient()
  const { data, error } = await client.auth.exchangeOAuthCode(code, codeVerifier)
  if (error) {
    console.error('OAuth code exchange failed', error)
    return NextResponse.redirect(new URL(`/sign-in?error=exchange_failed&message=${encodeURIComponent(error.message || '')}`, request.url))
  }

  if (!data?.accessToken) {
    return NextResponse.redirect(new URL('/sign-in?error=missing_token', request.url))
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  setAuthCookies(response.cookies, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  })
  response.cookies.delete('insforge_code_verifier')

  return response
}
