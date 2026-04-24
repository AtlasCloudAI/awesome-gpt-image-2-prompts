# 🛠️ Local Development Guide

## 📦 Prerequisites

- Node.js 20+
- Access to a prompt data source (for example `prompts-hub/src/data/records.json`)
- AtlasCloud API key (optional verification)

## 🚀 Quick Start

### 1. Enter project directory

```bash
cd gpt-image2-prompt-awesome
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
ATLASCLOUD_API_KEY=your-api-key
ATLASCLOUD_LLM_BASE_URL=https://api.atlascloud.ai/v1
ATLASCLOUD_MEDIA_BASE_URL=https://api.atlascloud.ai/api/v1
ATLASCLOUD_MODEL=deepseek-v3
```

Notes:

- The API key is shown only once when created, store it safely.
- Every API request requires `Authorization: Bearer <API_KEY>`.
- Do not commit `.env` to version control.

## 🧱 Generate README (Main Flow)

```bash
node scripts/generate-readme.mjs
```

Optional parameters:

```bash
MAX_ITEMS=30 node scripts/generate-readme.mjs
PROMPTS_SOURCE=/absolute/path/to/records.json node scripts/generate-readme.mjs
```

## 🔐 Verify AtlasCloud API Key (Optional)

脚本：`scripts/verify-atlas-key.mjs`

```bash
source .env
npm run verify:key
```

This script calls an OpenAI-compatible endpoint:

- Base URL: `https://api.atlascloud.ai/v1`
- Path: `/chat/completions`
- Header: `Authorization: Bearer <ATLASCLOUD_API_KEY>`

If you get `Verification success`, the key is valid.

## 🧪 Image API References

If you need image generation or media upload, AtlasCloud docs provide:

- 图像生成：`POST https://api.atlascloud.ai/api/v1/model/generateImage`
- 上传媒体：`POST https://api.atlascloud.ai/api/v1/model/uploadMedia`

Recommended practices:

- Use different keys for local and production environments.
- Rotate keys regularly.
- Apply exponential backoff retries on 429 responses.

## 🧰 Available Scripts

| Script | Command | Description |
|---|---|---|
| Generate README | `npm run generate` | Generate a README from prompts-hub data |
| Verify API Key | `npm run verify:key` | Verify that the AtlasCloud API key is callable |

## 🔒 Security Checklist

- Keep `API Key` only in local env vars or a secret manager.
- Do not place keys in code, docs examples, or commit history.
- Use different keys for development and production.
- Monitor key usage and revoke suspicious keys immediately.
