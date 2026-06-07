const url = 'https://dtgr3dy7.ap-southeast.insforge.app/api/storage/buckets/avatars/upload-strategy';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTg1Mjl9.2AsCwvbqYxiDxIAfY1PLWZUoGcpUygAR_UOu-aB29oc';

async function run() {
  console.log("Fetching upload strategy from", url);
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${anonKey}`
      }
    });
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

run();
