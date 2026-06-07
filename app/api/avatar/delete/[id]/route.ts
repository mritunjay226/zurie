import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const client = await createInsForgeServerClient()
    const { data: userData, error: userError } = await client.auth.getCurrentUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing avatar ID' }, { status: 400 })
    }

    // Delete custom avatar from database table public.avatars (RLS will check ownership)
    const { data, error } = await client.database
      .from('avatars')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error("Database delete error", error)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, deletedCount: data?.length || 0 })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
