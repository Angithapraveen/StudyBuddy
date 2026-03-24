require('dotenv').config({ path: './.env' });

async function testApi() {
  const url = 'https://router.huggingface.co/v1/completions';
  console.log("Testing:", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        model: "google/flan-t5-base",
        prompt: "summarize: The artificial intelligence industry is booming.",
        max_tokens: 50
      })
    });
    
    console.log("  Status:", res.status);
    const text = await res.text();
    console.log("  Body:", text.substring(0, 200));
  } catch (e) {
     console.error(e.message);
  }
}
testApi();
