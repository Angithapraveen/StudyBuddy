class AIService {
  constructor() {
    this.hfApiKey = process.env.HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY;
    this.apiUrl = 'https://router.huggingface.co/models/google/flan-t5-base';
    console.log("HF Loaded:", !!this.hfApiKey);
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Internal function to summarize a single text chunk.
   */
  async _summarizeChunk(chunkText, retryCount = 0) {
    const prompt = `summarize: ${chunkText.slice(0, 1500)}`;

    try {
      console.log("API KEY LOADED:", !!this.hfApiKey);
      console.log("INPUT LENGTH:", chunkText.length);
      console.log(`[AI Service] Calling HF Router (Attempt ${retryCount + 1})...`);
      
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.hfApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-1B-Instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500
        })
      });

      console.log("STATUS:", response.status);

      if (response.status !== 200) {
        console.log("API request failed with status code", response.status);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI Service] API Error (${response.status}):`, errorText);
        
        if (errorText.toLowerCase().includes('loading') || response.status === 503 || response.status === 429) {
          if (retryCount < this.maxRetries) {
            console.log(`[AI Service] Model loading or busy. Retrying in ${this.retryDelay / 1000}s...`);
            await this.sleep(this.retryDelay);
            return this._summarizeChunk(chunkText, retryCount + 1);
          }
        }
        throw new Error(`API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("HF FULL RESPONSE:", data);
      
      if (data.error) {
          console.log("HF ERROR:", data.error);
      } else if (Array.isArray(data)) {
          console.log("SUMMARY:", data[0]);
      } else if (data.choices && data.choices[0]) {
          console.log("SUMMARY:", data.choices[0]);
      } else {
          console.log("UNEXPECTED FORMAT:", data);
      }
      
      let summaryText = "";
      if (data.choices?.[0]?.message?.content) {
        summaryText = data.choices[0].message.content;
      } else if (data.choices?.[0]?.text) {
        summaryText = data.choices[0].text;
      }

      if (!summaryText) {
        throw new Error("Failed to generate summary, try again");
      }

      return summaryText;
    } catch (error) {
      console.error("FETCH ERROR:", error);
      if (error.message.includes('loading')) {
        throw new Error("AI service temporarily unavailable (loading), please try again later.");
      }
      throw error;
    }
  }

  /**
   * Reusable function to generate notes from text using Hugging Face.
   */
  async generateNotes(text) {
    if (!this.hfApiKey) {
      throw new Error("AI not configured");
    }

    if (!text || text.trim().length < 50) {
      throw new Error('Material content too short for meaningful analysis');
    }

    // Limit total text to a reasonable size to prevent extremely long processing
    // Example: 15000 chars is roughly 10 chunks of 1500 chars (approx 2000-3000 words limit)
    const limitedText = text.slice(0, 15000); 
    
    // Chunking Logic (1500 chars per chunk)
    const CHUNK_SIZE = 1500;
    const textChunks = [];
    for (let i = 0; i < limitedText.length; i += CHUNK_SIZE) {
      textChunks.push(limitedText.slice(i, i + CHUNK_SIZE));
    }

    console.log(`[AI Service] Split input text into ${textChunks.length} chunk(s).`);

    let combinedSummary = "";
    
    // Process each chunk sequentially to avoid rate limiting
    try {
      for (let i = 0; i < textChunks.length; i++) {
        console.log(`[AI Service] Processing chunk ${i + 1}/${textChunks.length}...`);
        const chunkSummary = await this._summarizeChunk(textChunks[i], 0);
        combinedSummary += chunkSummary + " ";
        
        // Add a small delay between chunk requests to avoid 429 Too Many Requests
        if (i < textChunks.length - 1) {
          await this.sleep(2000);
        }
      }
    } catch (error) {
      console.error('Hugging Face Analysis Error:', error.message);
      if (error.message.includes('AI service temporarily unavailable')) {
        throw new Error("AI service temporarily unavailable");
      }
      throw new Error("Failed to generate summary, try again");
    }

    const cleanedSummary = combinedSummary.trim();

    // Split summary into sentences for study notes
    const sentences = cleanedSummary.split(/(?<=\.)\s+/).filter(s => s.trim().length > 0);

    return {
      summary: cleanedSummary,
      notes: sentences.length > 0 ? sentences : [cleanedSummary],
      keyPoints: [
        `Summary generated via Google FLAN-T5 model from ${textChunks.length} chunk(s).`,
        "Processed via Hugging Face Unified Router with chunking logic."
      ],
      definitions: [],
      vivaQuestions: [],
      relatedTopics: []
    };
  }


  /**
   * Main analysis called by routes.
   */
  async analyzeMaterial(text, options = {}) {
    // Use the same function for both Document and YouTube summarization
    return this.generateNotes(text);
  }

  /**
   * Grounded Chatbot: Temporarily disabled since we removed Gemini.
   */
  async chatWithContext(contextText, userMessage, history = []) {
    return "The chat feature is currently unavailable as we migrated to Hugging Face summarization.";
  }
}

module.exports = new AIService();
