// RAG 检索引擎（核心）
const kb = require("./knowledge-base");
const ollama = require("./ollama");

const vectorStores = { afterSales: [], productInfo: [], generalQA: [] };
// 保存原始文本备用（关键词搜索时用）
const rawTexts = { afterSales: "", productInfo: "", generalQA: "" };

function chunkText(text) {
  const sections = text.split(/\n\n+/).filter(p => p.trim().length > 20);
  const chunks = [];
  for (const section of sections) {
    const trimmed = section.trim();
    if (trimmed.length > 800) {
      const sentences = trimmed.split(/(?<=[。！？\n])/);
      let current = "";
      for (const s of sentences) {
        if ((current + s).length > 600 && current.length > 100) {
          chunks.push(current.trim());
          current = s;
        } else {
          current += s;
        }
      }
      if (current.trim().length > 20) chunks.push(current.trim());
    } else {
      chunks.push(trimmed);
    }
  }
  return chunks;
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

async function initialize() {
  console.log("正在读取知识库文件...");
  const allContent = kb.readAll();
  rawTexts.afterSales = allContent.afterSales;
  rawTexts.productInfo = allContent.productInfo;
  rawTexts.generalQA = allContent.generalQA;

  const categories = ["afterSales", "productInfo", "generalQA"];
  const categoryNames = { afterSales: "售后", productInfo: "商品信息", generalQA: "通用问答" };

  for (const cat of categories) {
    const text = allContent[cat];
    if (!text) { console.log("  " + categoryNames[cat] + ": 无内容"); continue; }
    const chunks = chunkText(text);
    console.log("  " + categoryNames[cat] + ": " + chunks.length + " 个段落，正在生成向量...");

    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await ollama.embed(chunks[i]);
        vectorStores[cat].push({ text: chunks[i], embedding });
      } catch (err) {
        console.error("    段落 " + (i + 1) + " 向量化失败, 跳过");
      }
      if ((i + 1) % 5 === 0) {
        console.log("    进度: " + (i + 1) + "/" + chunks.length);
      }
    }
    console.log("  " + categoryNames[cat] + " 完成: " + vectorStores[cat].length + " 个向量");
  }
  console.log("RAG 知识库初始化完成");
}

/**
 * 向量语义搜索 + 关键词回退
 * @param {string} category
 * @param {string} userMessage
 * @param {number} topK
 * @param {string[]} keywords - 额外要匹配的关键词（如手机型号名）
 * @returns {Promise<string>}
 */
async function query(category, userMessage, topK = 4, keywords) {
  const store = vectorStores[category];
  if (!store || store.length === 0) return "";

  const queryVec = await ollama.embed(userMessage);
  const scored = store.map(item => ({
    text: item.text,
    score: cosineSimilarity(queryVec, item.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);

  // 取向量搜索 topK
  const selected = scored.slice(0, topK).map(item => item.text);

  // 关键词匹配：如果提供了 keywords，再从原始文本中找出包含关键词的段落
  if (keywords && keywords.length > 0) {
    const raw = rawTexts[category] || "";
    // 按双换行或 --- 分割成段落
    const rawParagraphs = raw.split(/\n---\n|\n\n+/).filter(p => p.trim().length > 30);
    for (const kw of keywords) {
      for (const para of rawParagraphs) {
        if (para.includes(kw)) {
          // 检查是否已经在 selected 中
          const exists = selected.some(s => para.includes(s.substring(0, 40)));
          if (!exists) {
            selected.push(para.trim());
          }
        }
      }
    }
  }

  return selected.join("\n\n---\n\n");
}

module.exports = { initialize, query };
