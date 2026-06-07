import { createAdminClient } from "@insforge/sdk";

const BASE_URL = "https://dtgr3dy7.ap-southeast.insforge.app";
const API_KEY = "ik_f5a98f8fa3974992e0f6084d3f88dd93";

const client = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

async function run() {
  console.log("Testing google/gemini-2.5-flash-image-preview...");
  try {
    const res = await client.ai.images.generate({
      model: "google/gemini-2.5-flash-image-preview",
      prompt: "A beautiful portrait of a podcast host, highly detailed, clean background.",
    });
    console.log("Success! data length:", res.data?.length);
    if (res.data?.[0]?.b64_json) {
      console.log("b64_json length:", res.data[0].b64_json.length);
    }
  } catch (err) {
    console.error("Failed! Error:", err.message || err);
    if (err.statusCode) console.error("Status:", err.statusCode);
  }
}

run();
