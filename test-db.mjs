import { createAdminClient } from "@insforge/sdk";

const BASE_URL = "https://dtgr3dy7.ap-southeast.insforge.app";
const API_KEY = "ik_f5a98f8fa3974992e0f6084d3f88dd93";

const client = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

async function run() {
  console.log("Fetching avatars from database...");
  try {
    const { data, error } = await client.database
      .from('avatars')
      .select('*');
    if (error) {
      throw error;
    }
    console.log("Avatars:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Database Error:", err);
  }
}

run();
