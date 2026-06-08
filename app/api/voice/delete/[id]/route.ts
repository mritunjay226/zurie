import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await createInsForgeServerClient()
    
    // Authenticate user session
    const { data: userData, error: userError } = await client.auth.getCurrentUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // First fetch the voice to ensure it belongs to the user
    const { data: voice, error: fetchError } = await client.database
      .from('voices')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single()

    if (fetchError || !voice) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Voice not found or access denied' }, { status: 404 })
    }

    // Delete from database
    const { error: deleteError } = await client.database
      .from('voices')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error("Database delete voice error", deleteError)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Voice deleted successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
