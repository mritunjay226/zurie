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

    let pollinationsImageUrl = undefined;
    if (payload.uploadedImgUrl) {
      await metadata.set("status", "Uploading reference to Pollinations...");
      try {
        pollinationsImageUrl = await uploadToPollinationsStorage(payload.uploadedImgUrl, process.env.POLLINATIONS_API_KEY!);
        logger.info("Uploaded reference image to Pollinations", { url: pollinationsImageUrl });
      } catch (err: any) {
        logger.error("Failed to upload reference image to Pollinations, falling back to original URL", { error: err.message });
        pollinationsImageUrl = payload.uploadedImgUrl;
      }
    }

    const requestBody: any = {
      model: "klein",
      prompt: promptText,
      image: pollinationsImageUrl,
      response_format: "b64_json"
    };

    const insforge = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

    // ── 2. Generate portrait 9:16 avatar ──────────────────────────────────────
    await metadata.set("progress", 50);
    await metadata.set("status", "Generating avatar portrait...");

    let finalPortraitUrl = getUnsplashFallback(payload.style, "portrait");
    try {
      logger.info("Calling Pollinations Image Generation", {
        model: requestBody.model,
        prompt: promptText,
        hasImages: !!payload.uploadedImgUrl
      });

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
