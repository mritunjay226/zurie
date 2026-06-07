import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export async function GET() {
  try {
    const client = await createInsForgeServerClient()
    const { data, error } = await client.auth.getCurrentUser()

    if (error || !data?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    return NextResponse.json({ user: data.user })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
