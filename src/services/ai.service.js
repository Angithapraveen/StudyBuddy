/**
 * StudyBuddy Frontend AI Service
 * This service provides a client-side option for summarization if required.
 * Note: To keep API keys secure, it is recommended to use the backend processing routes.
 */

const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const API_URL = 'https://router.huggingface.co/v1/chat/completions';

// Temporary debug as requested
console.log("HF Loaded:", !!API_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Reusable function to generate notes from text using Hugging Face Inference API.
 * @param {string} text - The input text (max 2000 chars)
 */
export async function generateNotes(text, retryCount = 0) {
  if (!API_KEY) {
    throw new Error("AI not configured");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{ role: "user", content: `summarize: ${text.slice(0, 2000)}` }],
        max_tokens: 500
      })
    });

    const data = await response.json();
    console.log("HF RESPONSE:", data);

    if (data?.error?.includes('loading')) {
      if (retryCount < 3) {
        console.log("Model loading, retrying in 5s...");
        await sleep(5000);
        return generateNotes(text, retryCount + 1);
      } else {
        throw new Error("AI model is loading, please wait...");
      }
    }

    if (data.error) {
       throw new Error(data.error.message || data.error);
    }

    let summaryText = "";
    if (data.choices?.[0]?.message?.content) {
      summaryText = data.choices[0].message.content;
    } else if (data.choices?.[0]?.text) {
      summaryText = data.choices[0].text;
    }

    return summaryText || "No summary generated";
  } catch (error) {
    console.error('Frontend AI Error:', error.message);
    if (error.message.includes('loading')) {
      throw new Error("AI model is loading, please wait...");
    }
    throw new Error("Failed to generate summary, try again");
  }
}
