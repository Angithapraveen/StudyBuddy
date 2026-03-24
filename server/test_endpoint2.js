require('dotenv').config({ path: './.env' });

async function testApi() {
  const urls = [
      'https://router.huggingface.co/models/google/flan-t5-base',
      'https://api-inference.huggingface.co/models/google/flan-t5-base',
  ];
  for (let url of urls) {
      console.log("Testing:", url);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: "summarize: Test." })
        });
        
        console.log("  Status:", res.status);
        const text = await res.text();
        console.log("  Body:", text.substring(0, 100));
      } catch (e) {
         console.error(e.message);
      }
  }
}
testApi();
