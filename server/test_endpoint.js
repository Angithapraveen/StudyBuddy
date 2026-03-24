require('dotenv').config({ path: './.env' });

async function testApi() {
  const modelUrl = 'https://router.huggingface.co/hf-inference/models/google/flan-t5-base';
  try {
    const res = await fetch(modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: "summarize: Test." })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}
testApi();
