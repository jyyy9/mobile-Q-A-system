const express = require("express");
const router = express.Router();
const rag = require("../services/rag");
const ollama = require("../services/ollama");

const SYSTEM_PROMPT = `你是一个电商智能助手"小智"。根据以下知识库内容直接回答用户的问题。

【知识库相关段落】
{context}

回答要求：
1. 直接回答，给出具体数值、金额、规则
2. 不要反问用户，不要问"请问您需要什么帮助"
3. 如果知识库中有相关信息，直接引用具体数值回答
4. 如果用户问到"退换货""维修""保修""以旧换新""投诉""纠纷"等售后问题，必须回复："我是通用助手小智，无法解答售后问题哦~ 请返回主页点击「售后客服」模块，有专业的售后客服小帮为您服务 😊"
5. 如果知识库中没有相关信息，直接说"抱歉，知识库中没有相关信息"
6. 回答控制在 150 字以内`;

router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "请输入消息" });

  try {
    const context = await rag.query("generalQA", message);
    const systemPrompt = SYSTEM_PROMPT.replace("{context}", context || "知识库暂无相关内容");
    const reply = await ollama.generate(systemPrompt, message);
    res.json({ reply });
  } catch (err) {
    console.error("通用问答路由错误:", err.message);
    res.json({ reply: "抱歉，我现在暂时无法回答，请稍后再试。" });
  }
});

module.exports = router;
