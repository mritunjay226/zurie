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

    const { data: recordings, error: dbError } = await client.database
      .from('tts_recordings')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error("Database query recordings error", dbError)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, recordings: recordings || [] })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
