import { task, metadata, logger } from "@trigger.dev/sdk";
import { createAdminClient } from "@insforge/sdk";

function parseInsForgeStorageUrl(urlStr: string): { bucket: string; key: string } | null {
  try {
    const url = new URL(urlStr);
    const pathname = url.pathname;
    const regex = /\/api\/storage\/buckets\/([^/]+)\/objects\/(.+)$/;
    const match = pathname.match(regex);
    if (match) {
      return {
        bucket: decodeURIComponent(match[1]),
        key: decodeURIComponent(match[2])
      };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export const cloneVoiceTask = task({
  id: "clone-voice",
  maxDuration: 600, // 10 minutes timeout
  run: async (payload: {
    voiceId: string;
    userId: string;
    voiceName: string;
    sampleUrl: string;
    language: string; // 'en' or 'hi'
  }) => {
    logger.info("Voice cloning task started", { payload });

    const BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL!;
    const API_KEY  = process.env.INSFORGE_API_KEY!;
    const client = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

    await metadata.set("progress", 10);
    await metadata.set("status", "Initializing cloner...");

    let fileBuffer: Buffer | null = null;
    let fileMime = "audio/wav";

    // 1. Download the voice sample from InsForge Storage using the SDK
    try {
      await metadata.set("progress", 30);
      await metadata.set("status", "Downloading voice sample...");

      const parsed = parseInsForgeStorageUrl(payload.sampleUrl);
      if (!parsed) {
        throw new Error(`Invalid sample URL: ${payload.sampleUrl}`);
      }

      logger.info("Downloading file from InsForge storage", { parsed });
      const { data: blob, error: dlError } = await client.storage.from(parsed.bucket).download(parsed.key);
      if (dlError || !blob) {
        throw new Error(`Failed to download audio file: ${dlError?.message || "Empty response"}`);
      }

      const arrayBuffer = await blob.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileMime = blob.type || "audio/wav";
      logger.info("Successfully downloaded audio sample", { size: fileBuffer.length, mime: fileMime });
    } catch (err: any) {
      logger.error("Download phase failed", { error: err.message });
      // Delete the voice record from DB on failure
      await client.database.from("voices").delete().eq("id", payload.voiceId);
      return { success: false, error: `Download failed: ${err.message}` };
    }

    // 2. POST the sample to Chatterbox API
    try {
      await metadata.set("progress", 50);
      await metadata.set("status", "Transmitting to Chatterbox GPU cloner...");

      const isEnglish = payload.language === "en";
      const endpoint = isEnglish
        ? "https://mishramritunjay45--chatterbox-tts-chatterbox-web.modal.run/turbo/save-voice"
        : "https://mishramritunjay45--chatterbox-tts-chatterbox-web.modal.run/multi/save-voice";

      const formData = new FormData();
      const filename = payload.sampleUrl.split("/").pop()?.split("?")[0] ?? "sample.wav";
      
      const fileBlob = new Blob([fileBuffer], { type: fileMime });
      formData.append("ref_audio", fileBlob, filename);
      formData.append("user_id", payload.userId);
      formData.append("voice_name", payload.voiceName);

      // Add default preview text based on language
      if (isEnglish) {
        formData.append("preview_text", "Hello, this is a preview of my cloned voice.");
      } else {
        formData.append("language_id", payload.language);
        formData.append("preview_text", "नमस्ते, यह मेरी आवाज़ का प्रीव्यू है।");
      }

      logger.info(`Sending multipart post to ${endpoint}`, { filename, userId: payload.userId });
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Chatterbox API returned status ${response.status}: ${await response.text()}`);
      }

      const resData = await response.json();
      logger.info("Chatterbox cloner response received", { resData });

      const clip_url = resData.clip_url || resData.url;
      const preview_url = resData.preview_url || resData.audio_url || resData.url;

      if (!clip_url || !preview_url) {
        throw new Error(`Response did not contain required URLs: ${JSON.stringify(resData)}`);
      }

      // 3. Update the voice record in database
      await metadata.set("progress", 80);
      await metadata.set("status", "Updating database records...");

      const { error: dbError } = await client.database
        .from("voices")
        .update({
          status: "active",
          sample_url: clip_url,
          voice_url: preview_url
        })
        .eq("id", payload.voiceId);

      if (dbError) {
        throw new Error(`Failed to update voice status in database: ${dbError.message}`);
      }

      await metadata.set("progress", 100);
      await metadata.set("status", "completed");

      return {
        success: true,
        voiceId: payload.voiceId,
        clipUrl: clip_url,
        previewUrl: preview_url
      };
    } catch (err: any) {
      logger.error("Cloning phase failed, deleting voice record", { error: err.message });
      // Delete voice record from database on failure
      await client.database.from("voices").delete().eq("id", payload.voiceId);
      
      // Also delete the temporary sample from storage
      try {
        const parsed = parseInsForgeStorageUrl(payload.sampleUrl);
        if (parsed) {
          await client.storage.from(parsed.bucket).remove([parsed.key]);
        }
      } catch (rmErr) {
        logger.error("Failed to delete sample from storage after cloning error", rmErr);
      }

      return { success: false, error: err.message };
    }
  }
});
