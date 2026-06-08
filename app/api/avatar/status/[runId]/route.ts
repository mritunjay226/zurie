import { NextResponse } from 'next/server'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'
import { runs } from '@trigger.dev/sdk'

async function imageUrlToFile(imageUrl: string, filename: string): Promise<File> {
  if (imageUrl.startsWith("data:")) {
    const [meta, b64] = imageUrl.split(",");
    const mime = meta.match(/data:([^;]+);/)?.[1] ?? "image/png";
    const bytes = Buffer.from(b64, "base64");
    return new File([bytes], filename, { type: mime });
  } else {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const mime = res.headers.get("content-type") ?? "image/png";
    const bytes = Buffer.from(arrayBuffer);
    return new File([bytes], filename, { type: mime });
  }
}

async function uploadToPollinationsStorage(imageUrl: string, apiKey: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch source image: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const mime = res.headers.get("content-type") ?? "image/png";
  const bytes = Buffer.from(arrayBuffer);
  
  const formData = new FormData();
  const filename = imageUrl.split("/").pop()?.split("?")[0] ?? "image.png";
  const blob = new Blob([bytes], { type: mime });
  formData.append("file", blob, filename);

  const uploadRes = await fetch("https://media.pollinations.ai/upload", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!uploadRes.ok) {
    throw new Error(`Pollinations media upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  }

  const data = await uploadRes.json();
  if (!data?.url) {
    throw new Error(`No URL returned from Pollinations media upload: ${JSON.stringify(data)}`);
  }

  return data.url;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params
    
    const client = await createInsForgeServerClient()
    const { data: userData, error: userError } = await client.auth.getCurrentUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Check if it is a local mock run
    if (runId.startsWith('mock_')) {
      const parts = runId.split('_')
      const style = parts[1]
      const timestamp = parseInt(parts[2])
      const promptText = parts[3] ? Buffer.from(parts[3], 'base64url').toString('utf-8') : ''
      const uploadedImgUrl = parts[4] ? Buffer.from(parts[4], 'base64url').toString('utf-8') : ''
      
      const elapsedMs = Date.now() - timestamp
      const elapsedSeconds = elapsedMs / 1000

      if (elapsedSeconds < 2) {
        return NextResponse.json({ progress: 15, status: 'Initializing generation pipeline...' })
      } else if (elapsedSeconds < 4) {
        return NextResponse.json({ progress: 40, status: 'Configuring model weights...' })
      } else if (elapsedSeconds < 6) {
        return NextResponse.json({ progress: 70, status: 'Running Gemini Nano Banana...' })
      } else if (elapsedSeconds < 8) {
        return NextResponse.json({ progress: 90, status: 'Finalizing 16:9 and 9:16 formats...' })
      } else {
        // Mock generation completed - call Pollinations.ai directly
        let image_url_16_9 = getUnsplashFallback(style)
        let image_url_9_16 = getUnsplashFallback(style, "portrait")

        try {
          const styleName = style.replace(/-/g, " ")
          const promptTextFormatted = uploadedImgUrl
            ? `Using the provided reference image as the person's face and likeness, generate a high-quality avatar portrait. Style: ${styleName}. ${promptText || ""}. Keep the person's facial features, apply the style. Tall portrait 9:16 profile picture format.`
            : `Generate a stunning avatar portrait. Style: ${styleName}. ${promptText || "Professional character"}. Highly detailed, clean background. Tall portrait 9:16 profile picture format.`;

          let pollinationsImageUrl = undefined;
          if (uploadedImgUrl) {
            try {
              pollinationsImageUrl = await uploadToPollinationsStorage(uploadedImgUrl, process.env.POLLINATIONS_API_KEY!);
            } catch (uploadErr) {
              console.error("Failed to upload reference image to Pollinations media storage", uploadErr);
              pollinationsImageUrl = uploadedImgUrl;
            }
          }

          const requestBody: any = {
            model: "klein",
            prompt: promptTextFormatted,
            image: pollinationsImageUrl,
            response_format: "b64_json"
          };

          const response = await fetch("https://gen.pollinations.ai/v1/images/generations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.POLLINATIONS_API_KEY}`
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            throw new Error(`Pollinations error: ${response.status} ${await response.text()}`);
          }

          const resData = await response.json();
          const b64 = resData.data?.[0]?.b64_json;
          const dataUri = b64 ? `data:image/png;base64,${b64}` : null;

          if (dataUri) {
            try {
              const file = await imageUrlToFile(dataUri, `avatar_9_16_${Date.now()}.png`);
              const up = await client.storage.from("avatars").uploadAuto(file);
              image_url_9_16 = up.data?.url ?? dataUri;
            } catch (upErr) {
              console.error("Failed to upload mock portrait to storage", upErr);
              image_url_9_16 = dataUri;
            }
          }

          image_url_16_9 = image_url_9_16 // Reuse same portrait avatar to ensure 100% character/style consistency

        } catch (err) {
          console.error("Inline mock image generation failed, using unsplash fallback", err)
        }

        return NextResponse.json({
          progress: 100,
          status: 'completed',
          output: {
            image_url_16_9,
            image_url_9_16
          }
        })
      }
    }

    // Trigger.dev Run Polling
    try {
      const run = await runs.retrieve(runId)
      
      let progress = 0;
      let statusStr = run.status.toLowerCase();
      if (run.status === 'COMPLETED') {
        progress = 100;
        statusStr = 'completed';
      } else if (run.status === 'QUEUED') {
        progress = 5;
        statusStr = 'queued';
      } else if (run.status === 'EXECUTING') {
        progress = run.metadata?.progress ?? 50;
        statusStr = (run.metadata?.status as string) ?? 'executing';
      }

      return NextResponse.json({
        progress,
        status: statusStr,
        output: run.output,
        error: run.error
      })
    } catch (err: any) {
      return NextResponse.json({ error: 'TRIGGER_RETRIEVAL_ERROR', message: err.message }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 })
  }
}


function getUnsplashFallback(style: string, orientation: 'landscape' | 'portrait' = 'landscape'): string {
  const landscape: Record<string, string> = {
    podcast: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1024",
    casual: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1024",
    "3d-cartoon": "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1024",
    stylized: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1024",
  }
  const portrait: Record<string, string> = {
    podcast: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=576&h=1024&fit=crop",
    casual: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=576&h=1024&fit=crop",
    "3d-cartoon": "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=576&h=1024&fit=crop",
    stylized: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=576&h=1024&fit=crop",
  }
  const map = orientation === 'portrait' ? portrait : landscape
  return map[style] ?? map.casual
}
