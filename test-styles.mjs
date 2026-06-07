import { createAdminClient } from "@insforge/sdk";

const BASE_URL = "https://dtgr3dy7.ap-southeast.insforge.app";
const API_KEY = "ik_f5a98f8fa3974992e0f6084d3f88dd93";

const client = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

const styles = ["casual", "3d-cartoon", "podcast", "stylized"];

async function run() {
  for (const style of styles) {
    console.log(`\n--- Testing style: ${style} ---`);
    const prompt = `Generate a stunning avatar portrait. Style: ${style}. Professional character. Highly detailed, clean background. Tall portrait 9:16 profile picture format. Output the image only.`;
    try {
      const res = await client.ai.images.generate({
        model: "google/gemini-2.5-flash-image",
        prompt,
      });
      console.log(`Success for ${style}! data length:`, res.data?.length);
      if (res.data?.[0]?.b64_json) {
        console.log(`b64_json length:`, res.data[0].b64_json.length);
      } else {
        console.log(`Response data:`, res.data);
      }
    } catch (err) {
      console.error(`Failed for ${style}! Error:`, err.message || err);
      if (err.statusCode) console.error("Status:", err.statusCode);
      if (err.error) console.error("Error Code:", err.error);
    }
  }
}

run();
