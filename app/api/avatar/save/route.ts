import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export async function POST(request: Request) {
  try {
    const client = await createInsForgeServerClient()
    
    // Authenticate user session
    const { data: userData, error: userError } = await client.auth.getCurrentUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { name, style, prompt, image_url_16_9, image_url_9_16 } = await request.json()
    if (!name || !style || !image_url_16_9 || !image_url_9_16) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Insert custom avatar into the avatars table
    const { data, error } = await client.database
      .from('avatars')
      .insert([{
        user_id: userData.user.id,
        name,
        style,
        prompt: prompt || null,
        image_url_16_9,
        image_url_9_16,
      }])
      .select()

    if (error) {
      console.error("Database insert error", error)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, avatar: data?.[0] })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
