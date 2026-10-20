// Ollama 大模型调用封装
const axios = require("axios");

const BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const GEN_MODEL = process.env.GENERATION_MODEL || "qwen2:7b";
const EMBED_MODEL = process.env.EMBEDDING_MODEL || "nomic-embed-text";

async function generate(systemPrompt, userMessage) {
  try {
    const response = await axios.post(BASE_URL + "/api/chat", {
      model: GEN_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      stream: false,
      temperature: 0.1,
    });
    return response.data.message.content;
  } catch (err) {
    console.error("Ollama generate 失败:", err.message);
    return "抱歉，我暂时无法回答，请稍后再试。";
  }
}

async function embed(text) {
  try {
    const response = await axios.post(BASE_URL + "/api/embeddings", {
      model: EMBED_MODEL,
      prompt: text,
    });
    return response.data.embedding;
  } catch (err) {
    console.error("Ollama embed 失败:", err.message);
    throw err;
  }
}

module.exports = { generate, embed };
