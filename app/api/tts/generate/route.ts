import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'
import { tasks } from '@trigger.dev/sdk'
import type { generateTtsTask } from '@/trigger/tts-generator'

export async function POST(request: Request) {
  try {
    const client = await createInsForgeServerClient()
    
    // Authenticate user session
    const { data: userData, error: userError } = await client.auth.getCurrentUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { voiceId, voiceName, voiceType, text, language, voiceClipUrl: bodyVoiceClipUrl } = await request.json()
    if (!voiceId || !voiceName || !voiceType || !text || !language) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (text.length > 2000) {
      return NextResponse.json({ error: 'TEXT_TOO_LONG', message: 'Text exceeds maximum limit of 2,000 characters' }, { status: 400 })
    }

    // 1. Calculate credit cost: 10 credits per 500 characters
    const characterCount = text.length
    const cost = Math.ceil(characterCount / 500) * 10

    // 2. Retrieve user's current credits
    const { data: user, error: userFetchError } = await client.database
      .from('users')
      .select('credits')
      .eq('id', userData.user.id)
      .single()

    if (userFetchError || !user) {
      console.error("Failed to fetch user credits", userFetchError)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: 'Failed to verify credit balance' }, { status: 500 })
    }

    if (user.credits < cost) {
      return NextResponse.json({ error: 'INSUFFICIENT_CREDITS', message: `Insufficient credits. This generation requires ${cost} credits, but you only have ${user.credits}.` }, { status: 400 })
    }

    // 3. Deduct credits
    const { error: deductError } = await client.database
      .from('users')
      .update({ credits: user.credits - cost })
      .eq('id', userData.user.id)

    if (deductError) {
      console.error("Failed to deduct user credits", deductError)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: 'Failed to process credit deduction' }, { status: 500 })
    }

    // 4. Create the TTS recording record in database
    const { data: recordings, error: insertError } = await client.database
      .from('tts_recordings')
      .insert([{
        user_id: userData.user.id,
        voice_id: voiceId,
        voice_name: voiceName,
        voice_type: voiceType,
        text,
        status: 'generating',
        credits_used: cost
      }])
      .select()

    if (insertError || !recordings || recordings.length === 0) {
      console.error("Failed to insert TTS recording record", insertError)
      // Refund credits
      await client.database.from('users').update({ credits: user.credits }).eq('id', userData.user.id)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: 'Failed to save recording information' }, { status: 500 })
    }

    const recording = recordings[0]

    // 5. Retrieve reference voice clip URL. If it's a custom voice, fetch from database. Otherwise use the default premium voice URL.
    let voiceClipUrl = bodyVoiceClipUrl
    if (voiceType === 'custom') {
      const { data: voice, error: voiceError } = await client.database
        .from('voices')
        .select('sample_url')
        .eq('id', voiceId)
        .single()

      if (voiceError || !voice?.sample_url) {
        console.error("Failed to retrieve custom voice sample URL", voiceError)
        // Delete recording record and refund credits
        await client.database.from('tts_recordings').delete().eq('id', recording.id)
        await client.database.from('users').update({ credits: user.credits }).eq('id', userData.user.id)
        return NextResponse.json({ error: 'VOICE_NOT_FOUND', message: 'Custom voice reference sample could not be located' }, { status: 400 })
      }
      voiceClipUrl = voice.sample_url
    }

    // 6. Trigger the Trigger.dev background task
    let runId = 'mock_run'
    if (process.env.TRIGGER_SECRET_KEY) {
      try {
        const run = await tasks.trigger<typeof generateTtsTask>("generate-tts", {
          recordingId: recording.id,
          userId: userData.user.id,
          voiceId,
          voiceType,
          text,
          language,
          voiceClipUrl
        })
        runId = run.id
      } catch (err: any) {
        console.error("Failed to trigger Trigger.dev TTS task", err)
        // Delete recording record and refund credits
        await client.database.from('tts_recordings').delete().eq('id', recording.id)
        await client.database.from('users').update({ credits: user.credits }).eq('id', userData.user.id)
        return NextResponse.json({ error: 'TRIGGER_ERROR', message: err.message }, { status: 500 })
      }
    } else {
      console.warn("Trigger.dev secret key not configured, running in mock mode")
    }

    return NextResponse.json({ success: true, recording, runId })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
