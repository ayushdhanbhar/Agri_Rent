
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Pinecone } = require("@pinecone-database/pinecone");
const OpenAI = require('openai');

// Exact fallback required by product: use curly apostrophe U+2019
const OUT_OF_DOMAIN_REPLY = "Sorry, I can\u2019t answer this.";

/**
 * Simple domain check to ensure the user question is agriculture-related.
 * If no agriculture keywords are present, we immediately refuse with the exact OUT_OF_DOMAIN_REPLY.
 * This lightweight heuristic prevents sending obvious out-of-domain queries to the RAG pipeline.
 */
const isAgricultureQuery = (text) => {
    if (!text || typeof text !== 'string') return false;
    const normalized = text.toLowerCase();
    const keywords = [
        'agri', 'agriculture', 'farm', 'farmer', 'crop', 'crops', 'soil', 'irrigat', 'pest', 'fertil',
        'tractor', 'harvest', 'harvesting', 'seeds', 'crop', 'livestock', 'cattle', 'dairy', 'mandi', 'market',
        'weather', 'sowing', 'rental', 'rent', 'equipment', 'tractor', 'harvester', 'pesticide', 'fertilizer'
    ];
    return keywords.some(k => normalized.includes(k));
};

const chatbotController = {
    chat: async (req, res) => {
        try {
            const { message } = req.body;
            if (!message) {
                console.warn("Chatbot: Message is missing in request body.");
                return res.status(400).json({ error: "Message is required" });
            }

            // Enforce domain restriction early
            if (!isAgricultureQuery(message)) {
                return res.json({ reply: OUT_OF_DOMAIN_REPLY });
            }

            // --- RAG PIPELINE ---
            try {
                // 1. Embed query
                const embeddings = new GoogleGenerativeAIEmbeddings({
                    apiKey: process.env.GEMINI_API_KEY,
                    model: "models/text-embedding-004",
                });
                const queryVector = await embeddings.embedQuery(message);

                // 2. Search Pinecone
                const pinecone = new Pinecone({
                    apiKey: process.env.PINECONE_API_KEY, // Ensure API key is passed
                });
                const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

                const searchResults = await pineconeIndex.query({
                    topK: 5, // Top 5 is usually enough
                    vector: queryVector,
                    includeMetadata: true,
                });

                // 3. Compose context
                const context = (searchResults.matches || [])
                    .map(match => match.metadata?.text || '')
                    .filter(Boolean)
                    .join("\n\n---\n\n");

                console.log("RAG Context Retrieved:", context.length, "chars");

                // If no context available, respond with the exact refusal
                if (!context || context.trim().length < 20) {
                    console.warn("RAG: insufficient context retrieved for query");
                    return res.json({ reply: OUT_OF_DOMAIN_REPLY });
                }

                // 4. (RAG) Use GROQ / Llama chat model for rewriting + answering (provided RAG example)
                // Use GROQ API (llama) for final answer generation to avoid Gemini-only fallback.
                const groq = new OpenAI({
                    apiKey: process.env.GROQ_API_KEY,
                    baseURL: "https://api.groq.com/openai/v1",
                });

                // Optional: rewrite the query into a standalone question (simple single-turn rewrite)
                let rewritten = message;
                try {
                    const rewriteResp = await groq.chat.completions.create({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            {
                                role: "system",
                                content: `You are a query rewriting expert.
Based on the provided user question, rephrase it into a complete, standalone question that can be understood without any additional context.
Only output the rewritten question and nothing else.`
                            },
                            {
                                role: "user",
                                content: message,
                            }
                        ],
                    });
                    const candidate = rewriteResp.choices?.[0]?.message?.content;
                    if (candidate && typeof candidate === 'string' && candidate.trim().length > 0) {
                        rewritten = candidate.trim();
                    }
                } catch (rewriteErr) {
                    // Log but continue with original message
                    console.warn("Query rewrite failed, continuing with original query:", rewriteErr?.message || rewriteErr);
                }

                // Build final system prompt with strict instructions and injected context
                const systemPrompt = `
You are 'AgroBot', a specialized AI assistant for the 'FarmWare' platform.
STRICT INSTRUCTIONS:
1. DOMAIN: You answer ONLY questions about:
   - Agriculture, Farming, Crops, Soil, Irrigation, Weather, Pest Control.
   - Farm Equipment rental/usage (Tractors, Harvesters, etc.).
   - Government schemes for farmers.
   - Market prices (Mandi rates) generally.
2. OUT OF DOMAIN: If the query is NOT about the above topics, you MUST refuse politely.
   - Response: "${OUT_OF_DOMAIN_REPLY}"
3. TONE & STYLE:
   - Be polite, concise, and helpful.
   - Use simple language suitable for farmers.
4. CONTEXT: Use ONLY the following context to answer. If the answer is not in the context, say: "${OUT_OF_DOMAIN_REPLY}"

CONTEXT:
${context}
                `;

                const answerResp = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: rewritten },
                    ],
                });

                let text = answerResp.choices?.[0]?.message?.content || "";
                // Normalize undefined/empty responses to exact fallback
                if (!text || typeof text !== 'string' || text.trim().length === 0) {
                    text = OUT_OF_DOMAIN_REPLY;
                }

                // Out-of-domain fallback regex check (match both straight and curly apostrophes and common refusal phrases)
                if (/(out of domain|not in the context|can(?:'|’)?t answer this|not in the provided document)/i.test(text)) {
                    text = OUT_OF_DOMAIN_REPLY;
                }

                // Return final reply
                return res.json({ reply: text });

            } catch (ragError) {
                // Log full error for debugging, but return a safe, non-technical fallback to the user
                console.error("RAG Pipeline Error:", ragError);
                return res.json({ reply: OUT_OF_DOMAIN_REPLY });
            }

        } catch (error) {
            // Unexpected internal error: log details, return safe fallback
            console.error("Chatbot API Error:", error);
            return res.json({ reply: OUT_OF_DOMAIN_REPLY });
        }
    }
};

module.exports = chatbotController;
