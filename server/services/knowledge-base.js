// 知识库文件读取层
const fs = require("fs");
const path = require("path");

// 知识库根目录
const KB_ROOT = path.resolve(__dirname, "..", "..", "电商知识库");

function getFilePathsByCategory() {
  const categoryMap = {
    "售后规则": "afterSales",
    "投诉纠纷": "afterSales",
    "以旧换新": "afterSales",
    "商品信息": "productInfo",
    "手机配件": "productInfo",
    "常见问题": "generalQA",
    "配送规则": "generalQA",
    "优惠活动": "generalQA",
    "会员体系": "generalQA",
    "隐私安全": "generalQA",
  };

  const result = { afterSales: [], productInfo: [], generalQA: [] };

  if (!fs.existsSync(KB_ROOT)) {
    console.error("知识库目录不存在:", KB_ROOT);
    return result;
  }

  const dirs = fs.readdirSync(KB_ROOT, { withFileTypes: true });
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const category = categoryMap[dir.name];
    if (!category) continue;

    const dirPath = path.join(KB_ROOT, dir.name);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".md") || f.endsWith(".txt"));
    for (const file of files) {
      result[category].push(path.join(dirPath, file));
    }
  }

  return result;
}

function readCategory(category) {
  const files = getFilePathsByCategory()[category] || [];
  let combined = "";
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      combined += "\n\n===== " + path.basename(filePath) + " =====\n" + content;
    } catch (err) {
      console.error("读取文件失败:", filePath, err.message);
    }
  }
  return combined.trim();
}

function readAll() {
  return {
    afterSales: readCategory("afterSales"),
    productInfo: readCategory("productInfo"),
    generalQA: readCategory("generalQA"),
  };
}

module.exports = { getFilePathsByCategory, readCategory, readAll };
