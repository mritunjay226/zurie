import { NextResponse } from 'next/server'
import { createServerClient, setAuthCookies } from '@insforge/sdk/ssr'

export async function POST(request: Request) {
  try {
    const client = createServerClient()
    
    const body = await request.json()
    const { data, error } = await client.auth.verifyEmail({
      email: body.email,
      otp: body.otp
    })

    if (error) {
      return NextResponse.json(
        { error: error.error ?? 'AUTH_VERIFICATION_FAILED', message: error.message ?? 'Verification failed' },
        { status: error.statusCode ?? 400 }
      )
    }

    if (!data?.accessToken) {
      return NextResponse.json(
        { error: 'MISSING_ACCESS_TOKEN', message: 'Verification succeeded but no access token was returned' },
        { status: 400 }
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
