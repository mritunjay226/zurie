import { createAdminClient } from "@insforge/sdk";

const BASE_URL = "https://dtgr3dy7.ap-southeast.insforge.app";
const API_KEY = "ik_f5a98f8fa3974992e0f6084d3f88dd93";

const client = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

const models = [
  "black-forest-labs/flux.2-flex",
  "recraft/recraft-v4",
  "x-ai/grok-imagine-image-quality"
];

async function run() {
  for (const model of models) {
    console.log(`\n--- Testing model: ${model} ---`);
    try {
      const res = await client.ai.images.generate({
        model,
        prompt: "A beautiful portrait of a podcast host, highly detailed, clean background.",
      });
      console.log(`Success for ${model}! data length:`, res.data?.length);
      if (res.data?.[0]?.b64_json) {
        console.log(`b64_json length:`, res.data[0].b64_json.length);
      }
    } catch (err) {
      console.error(`Failed for ${model}! Error:`, err.message || err);
      if (err.statusCode) console.error("Status:", err.statusCode);
      if (err.error) console.error("Error Code:", err.error);
    }
  }
}

run();
