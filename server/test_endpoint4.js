require('dotenv').config({ path: './.env' });

async function testApi() {
  const url = 'https://router.huggingface.co/v1/chat/completions';
  console.log("Testing:", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{role: "user", content: "summarize: The artificial intelligence industry is booming."}],
        max_tokens: 50
      })
    });
    
    console.log("  Status:", res.status);
    const text = await res.text();
    console.log("  Body:", text.substring(0, 300));
  } catch (e) {
     console.error(e.message);
  }
}
testApi();
