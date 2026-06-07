import { createAdminClient } from "@insforge/sdk";

const BASE_URL = "https://dtgr3dy7.ap-southeast.insforge.app";
const API_KEY = "ik_f5a98f8fa3974992e0f6084d3f88dd93";

const client = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

async function run() {
  console.log("Listing AI image models...");
  try {
    const res = await client.http.get("/api/ai/models");
    const imageModels = res.filter(m => m.outputModality?.includes("image"));
    console.log("Image Models:", JSON.stringify(imageModels, null, 2));
  } catch (err) {
    console.error("Failed to list models:", err.message || err);
  }
}

run();
