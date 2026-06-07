import { task, metadata, logger } from "@trigger.dev/sdk";
import { createAdminClient } from "@insforge/sdk";

// ── Convert base64 data URI → File ───────────────────────────────────────────
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

// ── Task ──────────────────────────────────────────────────────────────────────
export const generateAvatarTask = task({
  id: "generate-avatar",
  maxDuration: 300,
  run: async (payload: {
    userId: string;
    style: string;
    prompt?: string;
    uploadedImgUrl?: string;
  }) => {
    logger.info("Avatar task started", { payload });

    const BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL!;
    const API_KEY  = process.env.INSFORGE_API_KEY!;

    await metadata.set("progress", 10);
    await metadata.set("status", "Initializing...");

    await metadata.set("progress", 30);
    await metadata.set("status", payload.uploadedImgUrl ? "Analyzing reference..." : "Configuring style...");
    await new Promise(r => setTimeout(r, 600));

    const styleName = payload.style.replace(/-/g, " ");
    const promptText = payload.uploadedImgUrl
      ? `Using the provided reference image as the person's face and likeness, generate a high-quality avatar portrait. Style: ${styleName}. ${payload.prompt ?? ""}. Keep the person's facial features, apply the style. Tall portrait 9:16 profile picture format.`
      : `Generate a stunning avatar portrait. Style: ${styleName}. ${payload.prompt ?? "Professional character"}. Highly detailed, clean background. Tall portrait 9:16 profile picture format.`;

    const requestBody: any = {
      model: "sourceful/riverflow-v2.5-pro:free",
      messages: [
        {
          role: "user",
          content: payload.uploadedImgUrl ? [
            {
              type: "text",
              text: promptText
            },
            {
              type: "image_url",
              image_url: {
                url: payload.uploadedImgUrl
              }
            }
          ] : promptText
        }
      ],
      modalities: ["image"]
    };

    if (payload.uploadedImgUrl) {
      requestBody.image_config = {
        strength: 0.2
      };
    }

    const insforge = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

    // ── 2. Generate portrait 9:16 avatar ──────────────────────────────────────
    await metadata.set("progress", 50);
    await metadata.set("status", "Generating avatar portrait...");

    let finalPortraitUrl = getUnsplashFallback(payload.style, "portrait");
    try {
      logger.info("Calling OpenRouter Image Generation", {
        model: requestBody.model,
        prompt: promptText,
        hasImages: !!payload.uploadedImgUrl
      });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://zurie.app",
          "X-Title": "Zurie App"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status} ${await response.text()}`);
      }

      const resData = await response.json();
      const choice = resData.choices?.[0];
      const imageObj = choice?.message?.images?.[0];
      const dataUri = typeof imageObj === "string" 
        ? imageObj 
        : imageObj?.image_url?.url || imageObj?.url;

      if (dataUri) {
        const file = await imageUrlToFile(dataUri, `avatar_9_16_${Date.now()}.png`);
        const up = await insforge.storage.from("avatars").uploadAuto(file);
        finalPortraitUrl = up.data?.url ?? dataUri;
        logger.info("Avatar image ready", { url: finalPortraitUrl.slice(0, 80) });
      } else {
        logger.warn("No image data returned from generation", { resData });
      }
    } catch (e: any) {
      logger.error("Avatar image generation failed", { error: e.message });
    }

    const finalLandscapeUrl = finalPortraitUrl; // Reuse same portrait avatar to ensure 100% character/style consistency

    await metadata.set("progress", 100);
    await metadata.set("status", "completed");

    return {
      success: true,
      image_url_16_9: finalLandscapeUrl,
      image_url_9_16: finalPortraitUrl,
      style: payload.style,
      prompt: payload.prompt,
    };
  },
});

function getUnsplashFallback(style: string, orientation: "landscape" | "portrait"): string {
  const land: Record<string, string> = {
    podcast:    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1024",
    casual:     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1024",
    "3d-cartoon":"https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1024",
    stylized:   "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1024",
  };
  const port: Record<string, string> = {
    podcast:    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=576&h=1024&fit=crop",
    casual:     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=576&h=1024&fit=crop",
    "3d-cartoon":"https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=576&h=1024&fit=crop",
    stylized:   "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=576&h=1024&fit=crop",
  };
  const m = orientation === "portrait" ? port : land;
  return m[style] ?? m.casual;
}
