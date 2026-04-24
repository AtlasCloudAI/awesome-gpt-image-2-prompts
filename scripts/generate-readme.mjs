import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourcePath =
  process.env.PROMPTS_SOURCE ||
  path.resolve(projectRoot, "../prompts-hub/src/data/records.json");
const outputPath = path.resolve(projectRoot, "README.md");
const maxItems = Number(process.env.MAX_ITEMS || 18);
const atlasLink = "https://www.atlascloud.ai/prompts-hub/gpt-image-2-prompt?locale=zh-CN";

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickImage(record) {
  if (Array.isArray(record.local_images) && record.local_images.length > 0) {
    const maybe = record.local_images[0];
    if (maybe?.remote_url) return maybe.remote_url;
  }
  if (Array.isArray(record.remote_images) && record.remote_images.length > 0) {
    return record.remote_images[0];
  }
  return "";
}

function sanitize(text) {
  return String(text || "").replace(/\r\n/g, "\n").trim();
}

function shorten(text, limit = 1400) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n...`;
}

function toDate(iso) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toISOString().slice(0, 10);
}

function renderItem(item, index) {
  const prompt = shorten(sanitize(item.prompt), 1200);
  const desc = sanitize(item.description || "暂无描述");
  const title = sanitize(item.title || `Prompt ${item.id}`);
  const author = sanitize(item.author_name || "Unknown");
  const authorLink = sanitize(item.author_link || "");
  const sourceLink = sanitize(item.source_link || "");
  const published = toDate(item.source_published_at);
  const language = sanitize(item.language || "unknown");
  const image = pickImage(item);
  const promptType = prompt.startsWith("{") || prompt.startsWith("[") ? "json" : "text";

  const authorPart = authorLink ? `[${author}](${authorLink})` : author;
  const sourcePart = sourceLink ? `[Twitter Post](${sourceLink})` : "N/A";
  const imagePart = image
    ? `<div align="center">\n<img src="${image}" width="700" alt="${title}">\n</div>`
    : "_暂无示意图_";

  return `### No. ${index + 1}: ${title}

#### 📖 Description

${desc}

#### 📝 Prompt

\`\`\`${promptType}
${prompt}
\`\`\`

#### 🖼️ Generated Image

${imagePart}

#### 📌 Details

- **ID:** ${item.id}
- **Author:** ${authorPart}
- **Source:** ${sourcePart}
- **Published:** ${published}
- **Language:** ${language}

**[👉 在 AtlasCloud 查看完整提示词库](${atlasLink})**

---
`;
}

function main() {
  const raw = fs.readFileSync(sourcePath, "utf-8");
  const all = JSON.parse(raw);
  if (!Array.isArray(all) || all.length === 0) {
    throw new Error("source data is empty");
  }

  const rng = mulberry32(20260423);
  const pool = all.filter((x) => x && x.id && x.prompt && x.title && pickImage(x));
  const scored = pool
    .map((item) => ({ item, score: rng() }))
    .sort((a, b) => a.score - b.score)
    .slice(0, Math.min(maxItems, pool.length))
    .map((x) => x.item);

  const languageCount = new Map();
  for (const i of scored) {
    const key = i.language || "unknown";
    languageCount.set(key, (languageCount.get(key) || 0) + 1);
  }
  const langLine = [...languageCount.entries()]
    .map(([k, v]) => `${k}: ${v}`)
    .join(" | ");

  const generatedAt = new Date().toISOString().replace("T", " ").replace(/\..+/, " UTC");

  const header = `# 🚀 Awesome GPT-Image-2 Prompts (AtlasCloud Edition)

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![AtlasCloud](https://img.shields.io/badge/AtlasCloud-Prompts%20Hub-blue)](${atlasLink})

> 基于 \`prompts-hub\` 数据自动生成的 GPT-Image-2 提示词精选仓库。
>
> 目标：提供一个类似 awesome 风格的可读清单，同时引导到 AtlasCloud 网页端进行完整检索。

---

## 🌐 在线浏览（推荐）

**[👉 访问 AtlasCloud GPT-Image-2 中文提示词库](${atlasLink})**

---

## 📊 快速统计

| Metric | Value |
|---|---|
| 本次精选条目 | **${scored.length}** |
| 数据来源 | \`prompts-hub records dataset\` |
| 语言分布 | ${langLine || "N/A"} |
| 生成时间 | ${generatedAt} |

---

## 📖 目录

- [🌐 在线浏览（推荐）](#-在线浏览推荐)
- [📊 快速统计](#-快速统计)
- [🔥 精选 Prompt 示例](#-精选-prompt-示例)
- [🧭 使用方式](#-使用方式)
- [🙏 致谢与声明](#-致谢与声明)

---

## 🔥 精选 Prompt 示例

> 这些样例来自 \`prompts-hub/src/data/records.json\`，并随机抽样生成。

`;

  const footer = `
## 🧭 使用方式

1. 复制某条 \`Prompt\` 到 GPT-Image-2。
2. 替换 \`{argument name="..." default="..."}\` 占位参数。
3. 查看更多可直接复用的模板：**[AtlasCloud 中文提示词库](${atlasLink})**。

---

##  致谢与声明

- 数据来源：\`prompts-hub\` 数据集
- 本仓库用于学习与示例整理，请保留原作者与来源链接
- 侵权或不当内容请提交 issue，我们会及时处理
`;

  const body = scored.map((item, index) => renderItem(item, index)).join("\n");
  fs.writeFileSync(outputPath, `${header}${body}${footer}`, "utf-8");
  console.log(`README generated: ${outputPath}`);
}

main();
