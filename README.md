# 基于 AnythingLLM 和 Ollama 的手机智能问答系统

> 1班-63组 · 电商场景智能问答系统课程项目

面向电商场景的本地智能问答系统:前端为移动端风格的原生网页,后端基于 Express + RAG(检索增强生成),通过 [Ollama](https://ollama.com/) 在本地运行大模型,结合自建电商知识库实现商品信息、优惠活动、售后规则、配送规则等场景的智能问答。

## 功能

- 🛍️ **智能问答**:商品信息、优惠活动、配送规则、会员体系、常见问题
- 🔧 **售后服务**:退换货、售后规则、投诉纠纷处理
- ⚖️ **商品对比**:多商品参数对比
- 📚 **本地知识库**:基于 Markdown 知识库的 RAG 检索(向量语义搜索 + 关键词回退)

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | 原生 HTML / CSS / JavaScript |
| 后端 | Node.js + Express 5 |
| 模型 | Ollama(生成模型 `qwen2:7b`、嵌入模型 `nomic-embed-text`) |
| RAG | 自研向量检索(余弦相似度)+ 关键词回退 |

## 目录结构

```
mobile-Q&A-system/
├── client/              # 前端(原生 HTML/CSS/JS)
│   ├── index.html
│   ├── css/style.css
│   └── js/              # app / qa / after-sales / compare
├── server/              # 后端(Express)
│   ├── server.js        # 入口
│   ├── routes/          # 路由(售后 / 问答 / 对比)
│   ├── services/        # 知识库 / 嵌入 / RAG / 商品解析
│   ├── .env.example     # 环境变量模板
│   └── .env             # 环境变量(不入库,自行创建)
├── 电商知识库/          # Markdown 知识库
└── 系统架构图.svg       # 系统架构图
```

## 环境要求

- Node.js 18+
- [Ollama](https://ollama.com/) 已安装并运行

## 快速开始

### 1. 安装 Ollama 并拉取模型

```bash
ollama pull qwen2:7b
ollama pull nomic-embed-text
```

### 2. 配置环境变量

```bash
cd server
cp .env.example .env   # 按需修改端口 / 模型名
```

### 3. 启动后端

```bash
cd server
npm install
node server.js
```

后端默认运行在 `http://localhost:3002`,启动时会读取 `电商知识库/` 下的 Markdown 文件并生成向量索引。

### 4. 打开前端

直接用浏览器打开 `client/index.html`,即可访问问答界面。

## 环境变量说明

| 变量 | 默认值 | 说明 |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama 服务地址 |
| `GENERATION_MODEL` | `qwen2:7b` | 生成模型 |
| `EMBEDDING_MODEL` | `nomic-embed-text` | 嵌入模型 |
| `SERVER_PORT` | `3002` | 后端端口 |

## 作者

1班-63组
