import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@insforge/sdk/ssr'

export async function GET(request: NextRequest) {
  try {
    const provider = request.nextUrl.searchParams.get('provider')
    if (!provider) {
      return NextResponse.json({ error: 'Missing provider' }, { status: 400 })
    }

    const client = createServerClient()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      redirectTo: new URL('/api/auth/callback', appUrl).toString(),
      skipBrowserRedirect: true
    })

    if (error || !data.url || !data.codeVerifier) {
      console.error('OAuth initiation failed', error)
      return NextResponse.json({ error: error?.message ?? 'OAuth init failed' }, { status: 400 })
    }

    const cookieStore = await cookies()
    cookieStore.set('insforge_code_verifier', data.codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600
    })

    return NextResponse.redirect(data.url)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
