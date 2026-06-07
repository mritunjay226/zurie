import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'
import { tasks } from '@trigger.dev/sdk'
import type { generateAvatarTask } from '@/trigger/avatar-generator'

export async function POST(request: Request) {
  try {
    const client = await createInsForgeServerClient()
    
    // Authenticate user session
    const { data: userData, error: userError } = await client.auth.getCurrentUser()
    if (userError || !userData?.user) {
      console.error("Auth verification failed:", { userError, userData })
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { style, prompt, uploadedImgUrl } = await request.json()
    if (!style) {
      return NextResponse.json({ error: 'Missing style parameter' }, { status: 400 })
    }

    const hasTriggerKey = !!process.env.TRIGGER_SECRET_KEY

    if (hasTriggerKey) {
      try {
        // Trigger the background task using Trigger.dev
        const run = await tasks.trigger<typeof generateAvatarTask>("generate-avatar", {
          userId: userData.user.id,
          style,
          prompt,
          uploadedImgUrl,
        })
        return NextResponse.json({ runId: run.id, isMock: false })
      } catch (err: any) {
        console.error("Failed to trigger task in Trigger.dev, falling back to mock", err)
      }
    }

    // Local Mock Fallback Pipeline: Encode payload details in the Mock Run ID
    const promptBase64 = prompt ? Buffer.from(prompt).toString('base64url') : ''
    const imgUrlBase64 = uploadedImgUrl ? Buffer.from(uploadedImgUrl).toString('base64url') : ''
    const mockRunId = `mock_${style}_${Date.now()}_${promptBase64}_${imgUrlBase64}`

    return NextResponse.json({ runId: mockRunId, isMock: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
