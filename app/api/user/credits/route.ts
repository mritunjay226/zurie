import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export async function GET(request: Request) {
  try {
    const client = await createInsForgeServerClient()
    
    // Authenticate user session
    const { data: userData, error: userError } = await client.auth.getCurrentUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Retrieve user credit balance
    const { data: user, error: dbError } = await client.database
      .from('users')
      .select('credits')
      .eq('id', userData.user.id)
      .single()

    if (dbError || !user) {
      console.error("Database query credits error", dbError)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: dbError?.message || "Failed to load credits" }, { status: 500 })
    }

    return NextResponse.json({ success: true, credits: user.credits })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
