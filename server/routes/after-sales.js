const express = require("express");
const router = express.Router();
const rag = require("../services/rag");
const ollama = require("../services/ollama");

const SYSTEM_PROMPT = `你是一个专业的电商售后客服"小帮"。请根据以下知识库内容直接回答用户的售后问题。

【知识库相关段落】
{context}

回答要求：
1. 直接回答，给出具体政策条款和数值（如天数、金额、条件）
2. 不要反问用户，不要问"请问您需要什么帮助"
3. 如果知识库有相关信息就引用具体条款，没有就说"抱歉，这个问题我需要转接人工客服，请拨打 400-888-9999"
4. 回答控制在 150 字以内
5. 语气专业、简洁`;

router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "请输入消息" });

  try {
    const context = await rag.query("afterSales", message);
    const systemPrompt = SYSTEM_PROMPT.replace("{context}", context || "知识库暂无相关内容");
    const reply = await ollama.generate(systemPrompt, message);
    res.json({ reply });
  } catch (err) {
    console.error("售后路由错误:", err.message);
    res.json({ reply: "抱歉，客服系统暂时不可用，请稍后再试或拨打客服热线 400-888-9999" });
  }
});

module.exports = router;
