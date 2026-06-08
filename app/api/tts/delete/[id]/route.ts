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

    // First retrieve the record to obtain the storage audio key
    const { data: recording, error: fetchError } = await client.database
      .from('tts_recordings')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single()

    if (fetchError || !recording) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Recording not found or access denied' }, { status: 404 })
    }

    // If an audio file exists in storage, delete it
    if (recording.audio_key) {
      try {
        console.log("Removing audio file from InsForge storage", recording.audio_key)
        const { error: storageError } = await client.storage
          .from('audio')
          .remove([recording.audio_key])
        if (storageError) {
          console.warn("Storage deletion warning", storageError)
        }
      } catch (err) {
        console.error("Failed to delete audio file from storage", err)
      }
    }

    // Delete record from database
    const { error: deleteError } = await client.database
      .from('tts_recordings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error("Database delete recording error", deleteError)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'TTS recording deleted successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
