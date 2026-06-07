import { createAdminClient } from "@insforge/sdk";

const BASE_URL = "https://dtgr3dy7.ap-southeast.insforge.app";
const API_KEY = "ik_f5a98f8fa3974992e0f6084d3f88dd93";

const client = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

async function run() {
  console.log("--- Test A: Image generation WITHOUT reference image ---");
  try {
    const res = await client.ai.images.generate({
      model: "google/gemini-2.5-flash-image",
      prompt: "A beautiful landscape image, vibrant colors."
    });
    console.log("Test A Success! Response keys:", Object.keys(res));
  } catch (err) {
    console.error("Test A Failed! Error:", err);
  }

  console.log("\n--- Test B: Image generation WITH reference image ---");
  try {
    const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const res = await client.ai.images.generate({
      model: "google/gemini-2.5-flash-image",
      prompt: "A 3D cartoon style avatar portrait of the person in the reference image.",
      images: [
        { url: dummyImage }
      ]
    });
    console.log("Test B Success! Response keys:", Object.keys(res));
    console.log("Test B data[0] keys:", Object.keys(res.data[0]));
    if (res.data[0].b64_json) {
      console.log("b64_json length:", res.data[0].b64_json.length);
    }
    if (res.data[0].content) {
      console.log("content preview:", res.data[0].content.substring(0, 100));
    }
  } catch (err) {
    console.error("Test B Failed! Error:", err);
  }
}

run();
