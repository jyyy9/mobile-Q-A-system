require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rag = require("./services/rag");

const app = express();
app.use(cors());
app.use(express.json());

// 挂载路由
app.use("/api/after-sales", require("./routes/after-sales"));
app.use("/api/general-qa", require("./routes/general-qa"));
app.use("/api/compare", require("./routes/compare"));

const PORT = process.env.SERVER_PORT || 3002;

async function start() {
  console.log("正在加载知识库并生成向量索引...");
  await rag.initialize();
  console.log("RAG 知识库加载完成");

  app.listen(PORT, () => {
    console.log("电商助手后端运行在 http://localhost:" + PORT);
  });
}

start().catch(err => {
  console.error("启动失败:", err.message);
  process.exit(1);
});
