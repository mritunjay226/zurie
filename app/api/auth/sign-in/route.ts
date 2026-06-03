import { NextResponse } from 'next/server'
import { createServerClient, setAuthCookies } from '@insforge/sdk/ssr'

export async function POST(request: Request) {
  try {
    const client = createServerClient()
    
    const body = await request.json()
    const { data, error } = await client.auth.signInWithPassword({
      email: body.email,
      password: body.password
    })

    if (error) {
      return NextResponse.json(
        { error: error.error ?? 'AUTH_UNAUTHORIZED', message: error.message ?? 'Sign in failed' },
        { status: error.statusCode ?? 401 }
      )
    }

    if (!data?.accessToken) {
      return NextResponse.json(
        { error: 'MISSING_ACCESS_TOKEN', message: 'Authentication succeeded but no access token was returned' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ user: data.user })
    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    })

    return response
  } catch (err: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message ?? 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
