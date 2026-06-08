import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'
import { tasks } from '@trigger.dev/sdk'
import type { cloneVoiceTask } from '@/trigger/voice-cloner'

export async function POST(request: Request) {
  try {
    const client = await createInsForgeServerClient()
    
    // Authenticate user session
    const { data: userData, error: userError } = await client.auth.getCurrentUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { name, sampleUrl, language } = await request.json()
    if (!name || !sampleUrl || !language) {
      return NextResponse.json({ error: 'Missing parameters: name, sampleUrl, or language' }, { status: 400 })
    }

    // 1. Create a voice record in database with status 'cloning'
    const { data: voices, error: dbError } = await client.database
      .from('voices')
      .insert([{
        user_id: userData.user.id,
        name,
        type: 'custom',
        sample_url: sampleUrl,
        status: 'cloning',
        language
      }])
      .select()

    if (dbError || !voices || voices.length === 0) {
      console.error("Database insert voice error", dbError)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: dbError?.message || "Failed to create voice record" }, { status: 500 })
    }

    const voice = voices[0]

    // 2. Trigger the Trigger.dev background task
    let runId = 'mock_run'
    if (process.env.TRIGGER_SECRET_KEY) {
      try {
        const run = await tasks.trigger<typeof cloneVoiceTask>("clone-voice", {
          voiceId: voice.id,
          userId: userData.user.id,
          voiceName: name,
          sampleUrl,
          language,
        })
        runId = run.id
      } catch (err: any) {
        console.error("Failed to trigger Trigger.dev cloner task", err)
        // Roll back and delete the record
        await client.database.from('voices').delete().eq('id', voice.id)
        return NextResponse.json({ error: 'TRIGGER_ERROR', message: err.message }, { status: 500 })
      }
    } else {
      console.warn("Trigger.dev secret key not configured, running in mock mode")
    }

    return NextResponse.json({ success: true, voice, runId })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
