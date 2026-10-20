//商品信息结构化解析器
const fs = require("fs");
const path = require("path");

const PRODUCT_FILE = path.resolve(__dirname, "..", "..", "电商知识库", "商品信息", "商品信息.md");

function parseProductInfo() {
  let text = fs.readFileSync(PRODUCT_FILE, "utf-8");
  // 统一换行符：\r\n → \n
  text = text.replace(/\r/g, "");

  const phones = [];

  // === 解析 Markdown 表格格式的手机 ===
  const tablePattern = /### ([^\n]+)\n+\|([^\n]+)\|\n\|[-| ]+\|\n((?:\|[^\n]+\|\n?)+)/g;
  let match;
  while ((match = tablePattern.exec(text)) !== null) {
    const name = match[1].trim().replace(/\*\*/g, "");
    const tableBody = match[3];

    const specs = {};
    const rows = tableBody.split("\n").filter(r => r.trim().startsWith("|") && !r.includes("---"));
    for (const row of rows) {
      const cols = row.split("|").filter(c => c.trim().length > 0);
      if (cols.length >= 2) {
        specs[cols[0].trim()] = cols[1].trim();
      }
    }
    phones.push({ name, specs });
  }

  // === 解析文本格式的补充手机 ===
  const supplementSections = text.split(/\n---\n/);
  for (const section of supplementSections) {
    if (!section.includes("商品名称：")) continue;

    const nameMatch = section.match(/商品名称：([^\n]+)/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    const specs = {};
    const lines = section.split("\n");
    let currentKey = "";
    let currentVal = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("商品名称") || line.startsWith("---")) continue;

      const kvMatch = line.match(/^([^：]+?)：(.+)/);
      if (kvMatch) {
        if (currentKey) specs[currentKey] = currentVal.trim();
        currentKey = kvMatch[1].trim();
        currentVal = kvMatch[2].trim();
      } else if (currentKey && line.length > 0) {
        currentVal += " / " + line;
      }
    }
    if (currentKey) specs[currentKey] = currentVal.trim();
    phones.push({ name, specs });
  }

  return phones;
}

function findPhone(phoneName) {
  const allPhones = parseProductInfo();
  const query = phoneName.trim().toLowerCase().replace(/\s+/g, " ");

  for (const p of allPhones) {
    if (p.name.toLowerCase() === query) return p;
  }
  for (const p of allPhones) {
    if (p.name.toLowerCase().includes(query) || query.includes(p.name.toLowerCase())) return p;
  }
  return null;
}

function getAllPhoneNames() {
  return parseProductInfo().map(p => p.name);
}

module.exports = { parseProductInfo, findPhone, getAllPhoneNames };
