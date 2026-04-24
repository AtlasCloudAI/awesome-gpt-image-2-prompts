# 🛠️ Local Development Guide

## 📦 Prerequisites

- Node.js 20+
- 可访问提示词数据源（例如 `prompts-hub/src/data/records.json`）
- AtlasCloud API Key（用于可选验证）

## 🚀 Quick Start

### 1. 进入项目目录

```bash
cd gpt-image2-prompt-awesome
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：

```env
ATLASCLOUD_API_KEY=your-api-key
ATLASCLOUD_LLM_BASE_URL=https://api.atlascloud.ai/v1
ATLASCLOUD_MEDIA_BASE_URL=https://api.atlascloud.ai/api/v1
ATLASCLOUD_MODEL=deepseek-v3
```

注意：

- API Key 只在创建时显示一次，请妥善保存
- 每个 API 请求都需要 `Authorization: Bearer <API_KEY>`
- 不要把 `.env` 提交到版本库

## 🧱 生成 README（主流程）

```bash
node scripts/generate-readme.mjs
```

可选参数：

```bash
MAX_ITEMS=30 node scripts/generate-readme.mjs
PROMPTS_SOURCE=/absolute/path/to/records.json node scripts/generate-readme.mjs
```

## 🔐 验证 AtlasCloud API Key（可选）

脚本：`scripts/verify-atlas-key.mjs`

```bash
source .env
npm run verify:key
```

该脚本会调用 OpenAI 兼容端点：

- Base URL: `https://api.atlascloud.ai/v1`
- Path: `/chat/completions`
- Header: `Authorization: Bearer <ATLASCLOUD_API_KEY>`

如果返回 `Verification success`，说明 key 可用。

## 🧪 图像接口示例（文档参考）

如果你要走图像生成或媒体上传，AtlasCloud 文档中的接口是：

- 图像生成：`POST https://api.atlascloud.ai/api/v1/model/generateImage`
- 上传媒体：`POST https://api.atlascloud.ai/api/v1/model/uploadMedia`

建议做法：

- 本地和生产使用不同 key
- 定期轮换 key
- 遇到 429 时使用指数退避重试

## 🧰 Available Scripts

| Script | Command | Description |
|---|---|---|
| Generate README | `npm run generate` | 从 prompts-hub 数据生成丰富的 README |
| Verify API Key | `npm run verify:key` | 验证 AtlasCloud API Key 是否可调用 |

## 🔒 Security Checklist

- `API Key` 只放在本地环境变量或密钥系统
- 不要把 key 写入代码、文档示例或 commit 记录
- 使用不同 key 区分开发和生产
- 监控 key 用量，发现异常及时吊销
