import { task, metadata, logger } from "@trigger.dev/sdk";
import { createAdminClient } from "@insforge/sdk";

export const generateTtsTask = task({
  id: "generate-tts",
  maxDuration: 300, // 5 minutes timeout
  run: async (payload: {
    recordingId: string;
    userId: string;
    voiceId: string; // custom voice UUID or default voice string
    voiceType: string; // 'custom' or 'default'
    text: string;
    language: string; // 'en' or 'hi'
    voiceClipUrl?: string; // only for custom voice
  }) => {
    logger.info("TTS generation task started", { payload });

    const BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL!;
    const API_KEY  = process.env.INSFORGE_API_KEY!;
    const client = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

    await metadata.set("progress", 10);
    await metadata.set("status", "Initializing TTS engine...");

    let generatedAudioUrl = "";

    try {
      await metadata.set("progress", 30);
      await metadata.set("status", "Generating audio via Chatterbox...");

      const isEnglish = payload.language === "en";
      const useClone = !!payload.voiceClipUrl;

      let endpoint = "";
      let response;

      if (useClone) {
        // Zero-shot voice cloning TTS (for custom or default premium voices with reference audios)
        endpoint = isEnglish
          ? "https://mishramritunjay45--chatterbox-tts-chatterbox-web.modal.run/turbo/clone"
          : "https://mishramritunjay45--chatterbox-tts-chatterbox-web.modal.run/multi/clone";

        const formData = new FormData();
        formData.append("text", payload.text);
        formData.append("voice_clip_url", payload.voiceClipUrl!);
        formData.append("exaggeration", "0.5");
        formData.append("cfg_weight", "0.5");
        
        if (!isEnglish) {
          formData.append("language_id", payload.language);
        }

        logger.info(`Sending multipart clone request to ${endpoint}`, { text: payload.text, voiceClipUrl: payload.voiceClipUrl });
        
        response = await fetch(endpoint, {
          method: "POST",
          body: formData
        });
      } else {
        // Default Voice TTS
        endpoint = isEnglish
          ? "https://mishramritunjay45--chatterbox-tts-chatterbox-web.modal.run/turbo/generate"
          : "https://mishramritunjay45--chatterbox-tts-chatterbox-web.modal.run/multi/generate";

        const bodyParams = new URLSearchParams();
        bodyParams.append("prompt", payload.text);
        bodyParams.append("exaggeration", "0.5");
        bodyParams.append("cfg_weight", "0.5");
        
        if (!isEnglish) {
          bodyParams.append("language_id", payload.language);
        }

        logger.info(`Sending urlencoded generate request to ${endpoint}`, { prompt: payload.text });

        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: bodyParams.toString()
        });
      }

      if (!response.ok) {
        throw new Error(`Chatterbox API returned status ${response.status}: ${await response.text()}`);
      }

      const resData = await response.json();
      logger.info("Chatterbox response received", { resData });

      // Robust parsing of the returned Cloudinary URL
      generatedAudioUrl = resData.url || resData.audio_url || resData.clip_url || resData.preview_url;
      if (!generatedAudioUrl) {
        throw new Error(`Response did not contain an audio URL: ${JSON.stringify(resData)}`);
      }

      logger.info("Successfully received generated Cloudinary URL", { generatedAudioUrl });

    } catch (err: any) {
      logger.error("TTS generation phase failed", { error: err.message });
      await client.database
        .from("tts_recordings")
        .update({ status: "failed" })
        .eq("id", payload.recordingId);
      return { success: false, error: err.message };
    }

    // 2. Download the audio file from the Cloudinary URL and upload to InsForge Storage
    try {
      await metadata.set("progress", 60);
      await metadata.set("status", "Downloading generated audio...");

      logger.info("Fetching generated audio bytes from Cloudinary", { url: generatedAudioUrl });
      const audioRes = await fetch(generatedAudioUrl);
      if (!audioRes.ok) {
        throw new Error(`Failed to fetch audio file from Cloudinary: ${audioRes.statusText}`);
      }

      const audioBuffer = await audioRes.arrayBuffer();
      const mime = audioRes.headers.get("content-type") || "audio/mpeg";
      const filename = `tts_${payload.recordingId}_${Date.now()}.mp3`;

      await metadata.set("progress", 80);
      await metadata.set("status", "Saving to project storage...");

      const file = new File([Buffer.from(audioBuffer)], filename, { type: mime });
      logger.info("Uploading audio file to InsForge storage", { filename, mime });
      const uploadRes = await client.storage.from("audio").uploadAuto(file);

      if (uploadRes.error || !uploadRes.data?.url) {
        throw new Error(`Failed to upload to InsForge storage: ${uploadRes.error?.message || "Unknown error"}`);
      }

      const audio_url = uploadRes.data.url;
      const audio_key = uploadRes.data.key;
      logger.info("Audio saved to InsForge storage", { audio_url, audio_key });

      // 3. Update database record to completed
      await metadata.set("progress", 90);
      await metadata.set("status", "Finalizing database records...");

      const { error: dbError } = await client.database
        .from("tts_recordings")
        .update({
          status: "completed",
          audio_url,
          audio_key
        })
        .eq("id", payload.recordingId);

      if (dbError) {
        throw new Error(`Failed to update database record: ${dbError.message}`);
      }

      await metadata.set("progress", 100);
      await metadata.set("status", "completed");

      return {
        success: true,
        recordingId: payload.recordingId,
        audioUrl: audio_url
      };

    } catch (err: any) {
      logger.error("Storage upload or DB update phase failed", { error: err.message });
      await client.database
        .from("tts_recordings")
        .update({ status: "failed" })
        .eq("id", payload.recordingId);
      return { success: false, error: err.message };
    }
  }
});
