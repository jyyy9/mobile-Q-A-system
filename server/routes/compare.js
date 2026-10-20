const express = require("express");
const router = express.Router();
const parser = require("../services/product-parser");
const rag = require("../services/rag");
const ollama = require("../services/ollama");

// 优先用解析器取数据（不走 LLM，不编造）
router.post("/phones", async (req, res) => {
  const { phone1, phone2 } = req.body;
  if (!phone1 || !phone2) {
    return res.status(400).json({ raw: "请输入两个手机型号" });
  }

  const p1 = parser.findPhone(phone1);
  const p2 = parser.findPhone(phone2);

  if (p1 && p2) {
    // 两个手机都从知识库解析到，直接返回结构化数据
    return res.json({
      phone1: { name: p1.name, specs: p1.specs },
      phone2: { name: p2.name, specs: p2.specs },
    });
  }

  // 有手机没找到，回退到 LLM + RAG（告诉 LLM 哪些没找到）
  const notFound = [];
  if (!p1) notFound.push(phone1);
  if (!p2) notFound.push(phone2);

  try {
    const found = [];
    if (p1) found.push(p1);
    if (p2) found.push(p2);
    const contextFromKB = found.map(p => p.name + ":\n" + Object.entries(p.specs).map(([k, v]) => k + ": " + v).join("\n")).join("\n\n");

    const message = "请提供 " + phone1 + " 和 " + phone2 + " 的全部参数和数据。" +
      (notFound.length > 0 ? "注意：" + notFound.join("、") + "在知识库中未找到，请如实告知用户无法提供该手机的数据。" : "");

    const ragContext = await rag.query("productInfo", message, 6, [phone1, phone2]);
    const fullContext = contextFromKB ? contextFromKB + "\n\n" + ragContext : ragContext;

    const systemPrompt = "你是一个手机产品专家。请根据以下知识库内容提供 " + phone1 + " 和 " + phone2 + " 的详细参数对比。\n\n" +
      "【知识库相关段落】\n" + (fullContext || "知识库暂无相关内容") + "\n\n" +
      "回答要求：\n" +
      "1. 只能使用上面知识库段落中的数据，不要添加任何外部知识或假设\n" +
      "2. 如果某个手机型号在知识库中完全没有数据，直接说“知识库中未找到该手机型号的数据”\n" +
      "3. 不要编造价格、配置等信息\n" +
      "4. 用 Markdown 表格输出对比结果\n\n" +
      "输出格式：\n" +
      "| 参数 | " + phone1 + " | " + phone2 + " |\n" +
      "|------|---------|---------|\n" +
      "| 价格 | ... | ... |\n" +
      "| 颜色 | ... | ... |\n" +
      "| 屏幕 | ... | ... |\n" +
      "| 处理器 | ... | ... |\n" +
      "| 摄像头 | ... | ... |\n" +
      "| 电池 | ... | ... |\n" +
      "| 售后 | ... | ... |\n" +
      "| 库存 | ... | ... |";

    const reply = await ollama.generate(systemPrompt, message);
    res.json({ raw: reply });
  } catch (err) {
    console.error("商品对比路由错误:", err.message);
    res.json({ raw: "抱歉，对比服务暂时不可用，请稍后再试。" });
  }
});

module.exports = router;
