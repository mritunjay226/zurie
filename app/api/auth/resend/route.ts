import { NextResponse } from 'next/server'
import { createServerClient } from '@insforge/sdk/ssr'

export async function POST(request: Request) {
  try {
    const client = createServerClient()
    
    const body = await request.json()
    const { data, error } = await client.auth.resendVerificationEmail({
      email: body.email,
      redirectTo: new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').toString()
    })

    if (error) {
      return NextResponse.json(
        { error: error?.error ?? 'AUTH_RESEND_FAILED', message: error?.message ?? 'Failed to resend' },
        { status: error?.statusCode ?? 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message ?? 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
