import { NextResponse } from 'next/server'
import { createServerClient } from '@insforge/sdk/ssr'

export async function POST(request: Request) {
  try {
    const client = createServerClient()
    
    const body = await request.json()
    const { data, error } = await client.auth.signUp({
      email: body.email,
      password: body.password,
      name: body.name,
      redirectTo: new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').toString()
    })

    if (error) {
      return NextResponse.json(
        { error: error?.error ?? 'AUTH_REGISTRATION_FAILED', message: error?.message ?? 'Sign up failed' },
        { status: error?.statusCode ?? 400 }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message ?? 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
