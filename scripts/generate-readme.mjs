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
const atlasBaseUrl = "https://www.atlascloud.ai/prompts-hub/gpt-image-2-prompt";
const defaultLocale = process.env.ATLASCLOUD_DEFAULT_LOCALE || "en-US";

function atlasLink(locale = defaultLocale) {
  return `${atlasBaseUrl}?locale=${encodeURIComponent(locale)}`;
}

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
  const desc = sanitize(item.description || "No description available.");
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
    : "_No preview image available._";

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

**[👉 View Full Prompt Library On AtlasCloud](${atlasLink()})**

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
  const localeSwitch = `**Language:** [English](${atlasLink("en-US")}) | [中文](${atlasLink("zh-CN")})`;

  const header = `# 🚀 Awesome GPT-Image-2 Prompts (AtlasCloud Edition)

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![AtlasCloud](https://img.shields.io/badge/AtlasCloud-Prompts%20Hub-blue)](${atlasLink()})

> Automatically generated GPT-Image-2 prompt collection from \`prompts-hub\` data.
>
> Goal: provide an awesome-style curated list and link to AtlasCloud for full browsing.

---

## 🌐 Browse Online (Recommended)

**[👉 Open AtlasCloud GPT-Image-2 Prompt Library](${atlasLink()})**
${localeSwitch}

---

## 📊 Quick Stats

| Metric | Value |
|---|---|
| Curated Items | **${scored.length}** |
| Data Source | \`prompts-hub records dataset\` |
| Language Mix | ${langLine || "N/A"} |
| Generated At | ${generatedAt} |

---

## 📖 Table Of Contents

- [🌐 Browse Online (Recommended)](#-browse-online-recommended)
- [📊 Quick Stats](#-quick-stats)
- [🔥 Featured Prompt Examples](#-featured-prompt-examples)
- [🧭 How To Use](#-how-to-use)
- [🙏 Acknowledgements And Notes](#-acknowledgements-and-notes)

---

## 🔥 Featured Prompt Examples

> These examples are sampled from \`prompts-hub/src/data/records.json\`.

`;

  const footer = `
## 🧭 How To Use

1. Copy one \`Prompt\` into GPT-Image-2.
2. Replace placeholder params like \`{argument name="..." default="..."}\`.
3. Browse more reusable templates: **[AtlasCloud Prompt Library](${atlasLink()})**.
4. Switch languages quickly: [English](${atlasLink("en-US")}) | [中文](${atlasLink("zh-CN")}).

---

## 🙏 Acknowledgements And Notes

- Data source: \`prompts-hub\` dataset.
- This repository is for learning and curation; keep original author and source links.
- If you find infringement or inappropriate content, please open an issue.
`;

  const body = scored.map((item, index) => renderItem(item, index)).join("\n");
  fs.writeFileSync(outputPath, `${header}${body}${footer}`, "utf-8");
  console.log(`README generated: ${outputPath}`);
}

main();
