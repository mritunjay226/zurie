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

    // Retrieve user's custom avatars (ordered by creation date descending)
    const { data, error } = await client.database
      .from('avatars')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Database query error", error)
      return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 })
    }

    const avatars = data || []

    // Self-healing: Migrates legacy base64 image data to CDN Storage URLs on-the-fly
    const migratedAvatars = await Promise.all(
      avatars.map(async (av: any) => {
        let isModified = false
        let image_url_16_9 = av.image_url_16_9
        let image_url_9_16 = av.image_url_9_16

        if (image_url_16_9 && image_url_16_9.startsWith("data:")) {
          try {
            const [_, b64] = image_url_16_9.split(",")
            const file = new File([Buffer.from(b64, "base64")], `avatar_16_9_${Date.now()}.png`, { type: "image/png" })
            const up = await client.storage.from("avatars").uploadAuto(file)
            if (up.data?.url) {
              image_url_16_9 = up.data.url
              isModified = true
            }
          } catch (e) {
            console.error(`Failed to migrate landscape base64 for avatar ${av.id}`, e)
          }
        }

        if (image_url_9_16 && image_url_9_16.startsWith("data:")) {
          try {
            const [_, b64] = image_url_9_16.split(",")
            const file = new File([Buffer.from(b64, "base64")], `avatar_9_16_${Date.now()}.png`, { type: "image/png" })
            const up = await client.storage.from("avatars").uploadAuto(file)
            if (up.data?.url) {
              image_url_9_16 = up.data.url
              isModified = true
            }
          } catch (e) {
            console.error(`Failed to migrate portrait base64 for avatar ${av.id}`, e)
          }
        }

        if (isModified) {
          await client.database
            .from('avatars')
            .update({ image_url_16_9, image_url_9_16 })
            .eq('id', av.id)
          
          return { ...av, image_url_16_9, image_url_9_16 }
        }

        return av
      })
    )

    return NextResponse.json({ success: true, avatars: migratedAvatars })
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}
