const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Pinecone } = require("@pinecone-database/pinecone");
const OpenAI = require("openai");
const { Agent } = require("undici"); // Required for fixing the timeout

// Exact fallback required by product: use curly apostrophe U+2019
const OUT_OF_DOMAIN_REPLY = "Sorry, I can\u2019t answer this.";

/**
 * Simple domain check to ensure the user question is agriculture-related.
 */
const isAgricultureQuery = (text) => {
  if (!text || typeof text !== "string") return false;
  const normalized = text.toLowerCase();
  const keywords = [
    "agri",
    "agriculture",
    "farm",
    "farmer",
    "crop",
    "crops",
    "soil",
    "irrigat",
    "pest",
    "fertil",
    "tractor",
    "harvest",
    "harvesting",
    "seeds",
    "livestock",
    "cattle",
    "dairy",
    "mandi",
    "market",
    "weather",
    "sowing",
    "rental",
    "rent",
    "equipment",
    "harvester",
    "pesticide",
    "fertilizer",
  ];
  return keywords.some((k) => normalized.includes(k));
};

const chatbotController = {
  chat: async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Enforce domain restriction early
      if (!isAgricultureQuery(message)) {
        return res.json({ reply: OUT_OF_DOMAIN_REPLY });
      }

      // --- RAG PIPELINE ---
      try {
        // 1. Embed query - Updated to match the indexing script
        const embeddings = new GoogleGenerativeAIEmbeddings({
          apiKey: process.env.GEMINI_API_KEY,
          model: "gemini-embedding-001", // Updated model name
        });

        const fullVector = await embeddings.embedQuery(message);

        // MANUALLY SLICE TO 1024: Matches your Pinecone Index dimension
        const queryVector = fullVector.slice(0, 1024);
        // 1. Search Pinecone - Simplified Initialization
        const pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });

        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

        // 2. Wrap the query in a timeout-safe call
        const searchResults = await Promise.race([
          pineconeIndex.query({
            topK: 5,
            vector: queryVector,
            includeMetadata: true,
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Pinecone request timed out")),
              15000,
            ),
          ),
        ]);

        // 3. Compose context
        const context = (searchResults.matches || [])
          .map((match) => match.metadata?.text || "")
          .filter(Boolean)
          .join("\n\n---\n\n");

        // If no context available, respond with the exact refusal
        if (!context || context.trim().length < 20) {
          return res.json({ reply: OUT_OF_DOMAIN_REPLY });
        }

        // 4. Answer Generation (GROQ)
        const groq = new OpenAI({
          apiKey: process.env.GROQ_API_KEY,
          baseURL: "https://api.groq.com/openai/v1",
        });

        // Standalone question rewrite
        let rewritten = message;
        try {
          const rewriteResp = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "Rephrase the user question into a standalone question. Output only the question.",
              },
              { role: "user", content: message },
            ],
          });
          rewritten =
            rewriteResp.choices?.[0]?.message?.content?.trim() || message;
        } catch (e) {
          console.warn("Rewrite failed, using original.");
        }

        const systemPrompt = `
You are 'AgroBot', a specialized AI assistant for the 'FarmWare' platform.
STRICT INSTRUCTIONS:
1. DOMAIN: Agriculture, Farming, Equipment rental, Govt schemes, Mandi rates.
2. OUT OF DOMAIN: If the query is unrelated, respond ONLY with: "${OUT_OF_DOMAIN_REPLY}"
3. CONTEXT: Use ONLY the provided context. If the answer isn't there, say: "${OUT_OF_DOMAIN_REPLY}"

CONTEXT:
${context}`;

        const answerResp = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: rewritten },
          ],
        });

        let text = answerResp.choices?.[0]?.message?.content || "";

        // Final safety check for refusal phrases
        if (
          !text ||
          /(out of domain|not in the context|can(?:'|’)?t answer this)/i.test(
            text,
          )
        ) {
          text = OUT_OF_DOMAIN_REPLY;
        }

        return res.json({ reply: text });
      } catch (ragError) {
        console.error("RAG Pipeline Error:", ragError);
        return res.json({ reply: OUT_OF_DOMAIN_REPLY });
      }
    } catch (error) {
      console.error("Chatbot API Error:", error);
      return res.json({ reply: OUT_OF_DOMAIN_REPLY });
    }
  },
};

module.exports = chatbotController;
