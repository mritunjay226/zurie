const urls = [
  "https://static.deepgram.com/examples/Aura-2-zeus.wav",
  "https://static.deepgram.com/examples/Aura-2-helios.wav",
  "https://static.deepgram.com/examples/Aura-2-athena.wav",
  "https://static.deepgram.com/examples/Aura-2-arcas.wav",
  "https://static.deepgram.com/examples/Aura-2-asteria.wav",
  "https://static.deepgram.com/examples/Aura-2-luna.wav",
  "https://static.deepgram.com/examples/voices/zeus.wav",
  "https://static.deepgram.com/examples/voices/helios.wav",
  "https://static.deepgram.com/examples/voices/athena.wav",
  "https://static.deepgram.com/examples/voices/arcas.wav",
  "https://static.deepgram.com/examples/voices/asteria.wav",
  "https://static.deepgram.com/examples/voices/luna.wav",
  "https://static.deepgram.com/examples/aura-zeus-en.mp3",
  "https://static.deepgram.com/examples/aura-helios-en.mp3",
  "https://static.deepgram.com/examples/aura-athena-en.mp3",
];

async function checkUrls() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`URL: ${url} -> Status: ${res.status}`);
    } catch (e) {
      console.log(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}

checkUrls();
