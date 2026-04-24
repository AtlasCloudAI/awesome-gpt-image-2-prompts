import fs from "fs";
import path from "path";
import { t } from "./utils/i18n.js";

interface LanguageConfig {
  code: string;
  name: string;
  readmeFileName: string;
}

interface HubPrompt {
  id: number | string;
  title: string;
  description: string;
  prompt?: string;
  translated_prompt?: string;
  original_prompt?: string;
  source_link?: string;
  source_platform?: string;
  source_published_at?: string;
  author_name?: string;
  author_link?: string;
  remote_images?: string[];
  language?: string;
}

interface CategoryItem {
  title: string;
  slug: string;
}

interface CategoryGroup {
  title: string;
  items: CategoryItem[];
}

const REPO_ROOT = process.cwd();
const PROMPTS_HUB_ROOT = path.resolve(REPO_ROOT, "../prompts-hub");
const PROMPTS_DIR = path.join(PROMPTS_HUB_ROOT, "src/data/records_by_locale");
const MAX_REGULAR_PROMPTS_TO_DISPLAY = 120;
const FEATURED_PROMPT_IDS = [14492, 14490, 14370, 14630, 14507, 14448];

const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: "en", name: "English", readmeFileName: "README.md" },
  { code: "zh", name: "简体中文", readmeFileName: "README_zh.md" },
  { code: "zh-TW", name: "繁體中文", readmeFileName: "README_zh-TW.md" },
  { code: "ja-JP", name: "日本語", readmeFileName: "README_ja-JP.md" },
  { code: "ko-KR", name: "한국어", readmeFileName: "README_ko-KR.md" },
  { code: "th-TH", name: "ไทย", readmeFileName: "README_th-TH.md" },
  { code: "vi-VN", name: "Tiếng Việt", readmeFileName: "README_vi-VN.md" },
  { code: "hi-IN", name: "हिन्दी", readmeFileName: "README_hi-IN.md" },
  { code: "es-ES", name: "Español", readmeFileName: "README_es-ES.md" },
  { code: "es-419", name: "Español (Latinoamérica)", readmeFileName: "README_es-419.md" },
  { code: "de-DE", name: "Deutsch", readmeFileName: "README_de-DE.md" },
  { code: "fr-FR", name: "Français", readmeFileName: "README_fr-FR.md" },
  { code: "it-IT", name: "Italiano", readmeFileName: "README_it-IT.md" },
  { code: "pt-BR", name: "Português (Brasil)", readmeFileName: "README_pt-BR.md" },
  { code: "pt-PT", name: "Português", readmeFileName: "README_pt-PT.md" },
  { code: "tr-TR", name: "Türkçe", readmeFileName: "README_tr-TR.md" },
];

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: "Use Cases",
    items: [
      { title: "Profile / Avatar", slug: "profile-avatar" },
      { title: "Social Media Post", slug: "social-media-post" },
      { title: "Infographic / Edu Visual", slug: "infographic-edu-visual" },
      { title: "YouTube Thumbnail", slug: "youtube-thumbnail" },
      { title: "Comic / Storyboard", slug: "comic-storyboard" },
      { title: "Product Marketing", slug: "product-marketing" },
      { title: "E-commerce Main Image", slug: "ecommerce-main-image" },
      { title: "Game Asset", slug: "game-asset" },
      { title: "Poster / Flyer", slug: "poster-flyer" },
      { title: "App / Web Design", slug: "app-web-design" },
    ],
  },
  {
    title: "Style",
    items: [
      { title: "Photography", slug: "photography" },
      { title: "Cinematic / Film Still", slug: "cinematic-film-still" },
      { title: "Anime / Manga", slug: "anime-manga" },
      { title: "Illustration", slug: "illustration" },
      { title: "Sketch / Line Art", slug: "sketch-line-art" },
      { title: "Comic / Graphic Novel", slug: "comic-graphic-novel" },
      { title: "3D Render", slug: "3d-render" },
      { title: "Chibi / Q-Style", slug: "chibi-q-style" },
      { title: "Isometric", slug: "isometric" },
      { title: "Pixel Art", slug: "pixel-art" },
      { title: "Oil Painting", slug: "oil-painting" },
      { title: "Watercolor", slug: "watercolor" },
      { title: "Ink / Chinese Style", slug: "ink-chinese-style" },
      { title: "Retro / Vintage", slug: "retro-vintage" },
      { title: "Cyberpunk / Sci-Fi", slug: "cyberpunk-sci-fi" },
      { title: "Minimalism", slug: "minimalism" },
    ],
  },
  {
    title: "Subjects",
    items: [
      { title: "Portrait / Selfie", slug: "portrait-selfie" },
      { title: "Influencer / Model", slug: "influencer-model" },
      { title: "Character", slug: "character" },
      { title: "Group / Couple", slug: "group-couple" },
      { title: "Product", slug: "product" },
      { title: "Food / Drink", slug: "food-drink" },
      { title: "Fashion Item", slug: "fashion-item" },
      { title: "Animal / Creature", slug: "animal-creature" },
      { title: "Vehicle", slug: "vehicle" },
      { title: "Architecture / Interior", slug: "architecture-interior" },
      { title: "Landscape / Nature", slug: "landscape-nature" },
      { title: "Cityscape / Street", slug: "cityscape-street" },
      { title: "Diagram / Chart", slug: "diagram-chart" },
      { title: "Text / Typography", slug: "text-typography" },
      { title: "Abstract / Background", slug: "abstract-background" },
    ],
  },
];

function getGalleryLocale(locale: string): string {
  if (locale === "en") {
    return "en-US";
  }
  if (locale === "zh") {
    return "zh-CN";
  }
  return locale;
}

function getDataLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    zh: "zh-CN",
    "zh-TW": "zh-TW",
    "ja-JP": "ja-JP",
    "ko-KR": "ko-KR",
    "th-TH": "th-TH",
  };

  return localeMap[locale] ?? "en-US";
}

function buildPromptsUrl(locale: string, extraParams: Record<string, string> = {}): string {
  const params = new URLSearchParams({
    locale: getGalleryLocale(locale),
    ...extraParams,
  });
  return `https://www.atlascloud.ai/prompts-hub/gpt-image-2-prompt?${params.toString()}`;
}

function cleanPromptContent(content: string): string {
  if (!content) {
    return "";
  }

  return content
    .replace(/^```[\w-]*\s*\n?/im, "")
    .replace(/\n?```\s*$/im, "")
    .replace(/\n```[\w-]*\s*\n/g, "\n")
    .trim();
}

function readPrompts(locale: string): HubPrompt[] {
  const dataLocale = getDataLocale(locale);
  const filePath = path.join(PROMPTS_DIR, `${dataLocale}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as HubPrompt[];
}

function sortPrompts(prompts: HubPrompt[]): HubPrompt[] {
  return [...prompts].sort((a, b) => {
    return (
      new Date(b.source_published_at ?? 0).getTime() -
      new Date(a.source_published_at ?? 0).getTime()
    );
  });
}

function pickFeatured(prompts: HubPrompt[]): HubPrompt[] {
  const promptMap = new Map(prompts.map((prompt) => [String(prompt.id), prompt]));
  return FEATURED_PROMPT_IDS.map((id) => promptMap.get(String(id))).filter(
    (prompt): prompt is HubPrompt => Boolean(prompt)
  );
}

function getRegularPrompts(prompts: HubPrompt[], featured: HubPrompt[]): HubPrompt[] {
  const featuredIds = new Set(featured.map((prompt) => String(prompt.id)));
  return prompts.filter((prompt) => !featuredIds.has(String(prompt.id)));
}

function getPromptContent(prompt: HubPrompt): string {
  return cleanPromptContent(
    prompt.prompt || prompt.translated_prompt || prompt.original_prompt || ""
  );
}

function getLocaleDate(date: string | undefined, locale: string): string {
  if (!date) {
    return "Unknown";
  }

  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getNow(locale: string): string {
  return new Date().toLocaleString(locale, {
    timeZone: "UTC",
    dateStyle: "full",
    timeStyle: "long",
  });
}

function getMorePromptsNote(locale: string): string {
  const notes: Record<string, string> = {
    en: `Due to GitHub's content length limitations, we can only display the first ${MAX_REGULAR_PROMPTS_TO_DISPLAY} regular prompts in this README.`,
    zh: `由于 GitHub 内容长度限制，此 README 仅展示前 ${MAX_REGULAR_PROMPTS_TO_DISPLAY} 条常规提示词。`,
    "zh-TW": `由於 GitHub 內容長度限制，此 README 僅展示前 ${MAX_REGULAR_PROMPTS_TO_DISPLAY} 條常規提示詞。`,
    "ja-JP": `GitHub の表示長制限により、この README では通常プロンプトの先頭 ${MAX_REGULAR_PROMPTS_TO_DISPLAY} 件のみ表示しています。`,
    "ko-KR": `GitHub 콘텐츠 길이 제한으로 인해 이 README에는 일반 프롬프트 상위 ${MAX_REGULAR_PROMPTS_TO_DISPLAY}개만 표시됩니다.`,
    "th-TH": `เนื่องจากข้อจำกัดด้านความยาวของเนื้อหาใน GitHub README นี้จะแสดงพรอมต์ทั่วไปเพียง ${MAX_REGULAR_PROMPTS_TO_DISPLAY} รายการแรกเท่านั้น`,
    "vi-VN": `Do gioi han do dai noi dung cua GitHub, README nay chi hien thi ${MAX_REGULAR_PROMPTS_TO_DISPLAY} prompt thong thuong dau tien.`,
    "hi-IN": `GitHub ki samagri lambai seema ke karan, is README me keval pahale ${MAX_REGULAR_PROMPTS_TO_DISPLAY} regular prompts dikhaye gaye hain.`,
    "es-ES": `Debido al limite de longitud de contenido de GitHub, este README solo muestra los primeros ${MAX_REGULAR_PROMPTS_TO_DISPLAY} prompts regulares.`,
    "es-419": `Debido al limite de longitud de contenido de GitHub, este README solo muestra los primeros ${MAX_REGULAR_PROMPTS_TO_DISPLAY} prompts regulares.`,
    "de-DE": `Aufgrund der Inhaltslangenbegrenzung von GitHub zeigt diese README nur die ersten ${MAX_REGULAR_PROMPTS_TO_DISPLAY} regulaeren Prompts an.`,
    "fr-FR": `En raison de la limite de longueur du contenu sur GitHub, ce README n'affiche que les ${MAX_REGULAR_PROMPTS_TO_DISPLAY} premiers prompts standards.`,
    "it-IT": `A causa dei limiti di lunghezza dei contenuti di GitHub, questo README mostra solo i primi ${MAX_REGULAR_PROMPTS_TO_DISPLAY} prompt regolari.`,
    "pt-BR": `Devido ao limite de comprimento de conteudo do GitHub, este README mostra apenas os primeiros ${MAX_REGULAR_PROMPTS_TO_DISPLAY} prompts regulares.`,
    "pt-PT": `Devido ao limite de comprimento de conteudo do GitHub, este README mostra apenas os primeiros ${MAX_REGULAR_PROMPTS_TO_DISPLAY} prompts regulares.`,
    "tr-TR": `GitHub icerik uzunlugu siniri nedeniyle bu README yalnizca ilk ${MAX_REGULAR_PROMPTS_TO_DISPLAY} normal promptu gosterir.`,
  };

  return notes[locale] ?? notes.en;
}

function getGalleryFeaturesLead(locale: string): string {
  const labels: Record<string, string> = {
    en: "The gallery features:",
    zh: "图库还提供：",
    "zh-TW": "圖庫還提供：",
    "ja-JP": "ギャラリーでは以下も利用できます：",
    "ko-KR": "갤러리에서 추가로 제공하는 기능:",
    "th-TH": "แกลเลอรียังมีฟีเจอร์เหล่านี้:",
    "vi-VN": "Bo suu tap con ho tro:",
    "hi-IN": "Gallery me ye features bhi hain:",
    "es-ES": "La galeria tambien ofrece:",
    "es-419": "La galeria tambien ofrece:",
    "de-DE": "Die Galerie bietet ausserdem:",
    "fr-FR": "La galerie propose aussi :",
    "it-IT": "La galleria offre anche:",
    "pt-BR": "A galeria tambem oferece:",
    "pt-PT": "A galeria tambem oferece:",
    "tr-TR": "Galeri ayrica sunar:",
  };

  return labels[locale] ?? labels.en;
}

function generateHeader(locale: string): string {
  return `
<a href="${buildPromptsUrl(locale)}">
  <img src="https://static.atlascloud.ai/prompt/gpt-image2/images/13656_1.jpg" alt="GPT Image 2 Prompts" width="100%" />
</a>

> 💡 ${t("seedancePromo", locale)}
# 🚀 ${t("title", locale)}

[![Awesome](https://awesome.re/badge.svg)](https://github.com/sindresorhus/awesome)
[![GitHub stars](https://img.shields.io/github/stars/AtlasCloudAI/gpt-image2-prompt-awesome?style=social)](https://github.com/AtlasCloudAI/gpt-image2-prompt-awesome)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Update README](https://github.com/AtlasCloudAI/gpt-image2-prompt-awesome/actions/workflows/update-readme.yml/badge.svg)](https://github.com/AtlasCloudAI/gpt-image2-prompt-awesome/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

> 🎨 ${t("subtitle", locale)}

> ⚠️ ${t("copyright", locale)}

---

`;
}

function generateLanguageNavigation(currentLocale: string): string {
  const badges = SUPPORTED_LANGUAGES.map((lang) => {
    const isCurrent = lang.code === currentLocale;
    const color = isCurrent ? "brightgreen" : "lightgrey";
    const text = isCurrent ? "Current" : "Click%20to%20View";
    const safeName = encodeURIComponent(lang.name);
    return `[![${lang.name}](https://img.shields.io/badge/${safeName}-${text}-${color})](${lang.readmeFileName})`;
  });

  return `${badges.join(" ")}\n\n---\n\n`;
}

function generateCategoriesSection(locale: string): string {
  let md = `### 🏷️ ${t("browseByCategory", locale)}\n\n`;

  for (const group of CATEGORY_GROUPS) {
    md += `- **${group.title}**\n`;
    for (const item of group.items) {
      md += `  - [${item.title}](${buildPromptsUrl(locale, { categories: item.slug })})\n`;
    }
  }

  return `${md}\n`;
}

function generateGallerySection(locale: string): string {
  const imageLang = locale === "zh" || locale === "zh-TW" ? "zh" : "en";

  return `## 🌐 ${t("viewInGallery", locale)}

<div align="center">

![Cover](public/images/gpt-image-2-prompts-cover-${imageLang}.png)

</div>

**[${t("browseGallery", locale)}](${buildPromptsUrl(locale)})**

${t("galleryFeatures", locale)}

| Feature | ${t("githubReadme", locale)} | ${t("youmindGallery", locale)} |
|---------|--------------|---------------------|
| 🎨 ${t("visualLayout", locale)} | ${t("linearList", locale)} | ${t("masonryGrid", locale)} |
| 🔍 ${t("search", locale)} | ${t("ctrlFOnly", locale)} | ${t("fullTextSearch", locale)} |
| 🤖 ${t("aiGenerate", locale)} | - | ${t("aiOneClickGen", locale)} |
| 📱 ${t("mobile", locale)} | ${t("basic", locale)} | ${t("fullyResponsive", locale)} |
| 🏷️ ${t("categories", locale)} | - | ${t("categoryBrowsing", locale)} |

${generateCategoriesSection(locale)}---

`;
}

function generateTOC(locale: string): string {
  return `## 📖 ${t("toc", locale)}

- [🌐 ${t("viewInGallery", locale)}](#-view-in-web-gallery)
- [🤔 ${t("whatIs", locale)}](#-what-is-gpt-image-2)
- [📊 ${t("stats", locale)}](#-statistics)
- [🔥 ${t("featuredPrompts", locale)}](#-featured-prompts)
- [📋 ${t("allPrompts", locale)}](#-all-prompts)
- [🤝 ${t("howToContribute", locale)}](#-how-to-contribute)
- [📄 ${t("license", locale)}](#-license)
- [🙏 ${t("acknowledgements", locale)}](#-acknowledgements)
- [⭐ ${t("starHistory", locale)}](#-star-history)

---

`;
}

function generateWhatIs(locale: string): string {
  return `## 🤔 ${t("whatIs", locale)}

${t("whatIsIntro", locale)}

- 🎯 ${t("multimodalUnderstanding", locale)}
- 🎨 ${t("highQualityGeneration", locale)}
- ⚡ ${t("fastIteration", locale)}
- 🌈 ${t("diverseStyles", locale)}
- 🔧 ${t("preciseControl", locale)}
- 📐 ${t("complexScenes", locale)}

📚 ${t("learnMore", locale)}

### 🚀 ${t("raycastIntegration", locale)}

${t("raycastDescription", locale)}

**${t("example", locale)}**
\`\`\`
${t("raycastExample", locale)}
\`\`\`

${t("raycastUsage", locale)}

---

`;
}

function getSourceLabel(prompt: HubPrompt): string {
  const link = prompt.source_link ?? "";
  if (link.includes("x.com") || link.includes("twitter.com")) {
    return "Twitter Post";
  }
  return prompt.source_platform || "Source";
}

function generatePromptSection(
  prompt: HubPrompt,
  index: number,
  locale: string,
  featured = false
): string {
  const promptContent = getPromptContent(prompt);
  const hasArguments = promptContent.includes("{argument");
  const authorName = prompt.author_name || "Unknown";
  const authorLink = prompt.author_link || "#";
  const images = prompt.remote_images || [];

  let md = `### No. ${index + 1}: ${prompt.title}\n\n`;
  md += `![Language-${(prompt.language || "en").toUpperCase()}](https://img.shields.io/badge/Language-${(prompt.language || "en").toUpperCase()}-blue)\n`;

  if (featured) {
    md += `![Featured](https://img.shields.io/badge/⭐-Featured-gold)\n`;
  }

  if (hasArguments) {
    md += `![Raycast](https://img.shields.io/badge/🚀-Raycast_Friendly-purple)\n`;
  }

  md += `\n#### 📖 ${t("description", locale)}\n\n${prompt.description}\n\n`;
  md += `#### 📝 ${t("prompt", locale)}\n\n\`\`\`\n${promptContent}\n\`\`\`\n\n`;

  if (images.length > 0) {
    md += `#### 🖼️ ${t("generatedImages", locale)}\n\n`;
    images.forEach((imageUrl, imageIndex) => {
      md += `##### Image ${imageIndex + 1}\n\n`;
      md += `<div align="center">\n`;
      md += `<img src="${imageUrl}" width="${featured ? "700" : "600"}" alt="${prompt.title} - Image ${imageIndex + 1}">\n`;
      md += `</div>\n\n`;
    });
  }

  md += `#### 📌 ${t("details", locale)}\n\n`;
  md += `- **${t("author", locale)}:** [${authorName}](${authorLink})\n`;
  md += `- **${t("source", locale)}:** [${getSourceLabel(prompt)}](${prompt.source_link || "#"})\n`;
  md += `- **${t("published", locale)}:** ${getLocaleDate(prompt.source_published_at, locale)}\n`;
  md += `- **${t("languages", locale)}:** ${(prompt.language || "en").toUpperCase()}\n\n`;
  md += `**[${t("tryItNow", locale)}](${buildPromptsUrl(locale, { id: String(prompt.id) })})**\n\n`;
  md += `---\n\n`;

  return md;
}

function generateFeaturedSection(featured: HubPrompt[], locale: string): string {
  if (featured.length === 0) {
    return "";
  }

  let md = `## 🔥 ${t("featuredPrompts", locale)}\n\n`;
  md += `> ⭐ ${t("handPicked", locale)}\n\n`;

  featured.forEach((prompt, index) => {
    md += generatePromptSection(prompt, index, locale, true);
  });

  return md;
}

function generateAllPromptsSection(
  regular: HubPrompt[],
  hiddenCount: number,
  locale: string
): string {
  let md = `## 📋 ${t("allPrompts", locale)}\n\n`;
  md += `> 📝 ${t("sortedByDate", locale)}\n\n`;

  regular.forEach((prompt, index) => {
    md += generatePromptSection(prompt, index, locale, false);
  });

  if (hiddenCount > 0) {
    md += `## 📚 ${t("morePrompts", locale)}\n\n`;
    md += `<div align="center">\n\n`;
    md += `### 🎯 ${hiddenCount} ${t("morePromptsDesc", locale)}\n\n`;
    md += `${getMorePromptsNote(locale)}\n\n`;
    md += `**[${t("viewAll", locale)}](${buildPromptsUrl(locale)})**\n\n`;
    md += `${getGalleryFeaturesLead(locale)}\n\n`;
    md += `${t("galleryFeature1", locale)}\n\n`;
    md += `${t("galleryFeature2", locale)}\n\n`;
    md += `${t("galleryFeature3", locale)}\n\n`;
    md += `${t("galleryFeature4", locale)}\n\n`;
    md += `</div>\n\n`;
    md += `---\n\n`;
  }

  return md;
}

function generateStats(total: number, featuredCount: number, locale: string): string {
  return `## 📊 ${t("stats", locale)}

<div align="center">

| ${t("metric", locale)} | ${t("count", locale)} |
|--------|-------|
| 📝 ${t("totalPrompts", locale)} | **${total}** |
| ⭐ ${t("featured", locale)} | **${featuredCount}** |
| 🔄 ${t("lastUpdated", locale)} | **${getNow(locale)}** |

</div>

---

`;
}

function generateContribute(locale: string): string {
  return `## 🤝 ${t("howToContribute", locale)}

${t("welcomeContributions", locale)}

### 🐛 ${t("githubIssue", locale)}

1. Click [**${t("submitNewPrompt", locale)}**](https://github.com/AtlasCloudAI/gpt-image2-prompt-awesome/issues/new?template=submit-prompt.yml)
2. ${t("fillForm", locale)}
3. ${t("submitWait", locale)}
4. ${t("approvedSync", locale)}
5. ${t("appearInReadme", locale)}

**${t("note", locale)}** ${t("noteContent", locale)}

${t("seeContributing", locale)}

---

`;
}

function generateFooter(locale: string): string {
  return `## 📄 ${t("license", locale)}

${t("licensedUnder", locale)}

---

## 🙏 ${t("acknowledgements", locale)}

- [Payload CMS](https://payloadcms.com/)
- [atlascloud.ai](https://www.atlascloud.ai)

---

## ⭐ ${t("starHistory", locale)}

[![Star History Chart](https://api.star-history.com/svg?repos=AtlasCloudAI/gpt-image2-prompt-awesome&type=Date)](https://star-history.com/#AtlasCloudAI/gpt-image2-prompt-awesome&Date)

---

<div align="center">

**[🌐 ${t("viewInGallery", locale)}](${buildPromptsUrl(locale)})** •
**[📝 ${t("submitPrompt", locale)}](https://github.com/AtlasCloudAI/gpt-image2-prompt-awesome/issues/new?template=submit-prompt.yml)** •
**[⭐ ${t("starRepo", locale)}](https://github.com/AtlasCloudAI/gpt-image2-prompt-awesome)**

<sub>🤖 ${t("autoGenerated", locale)} ${new Date().toISOString()}</sub>

</div>
`;
}

function generateMarkdown(locale: string, prompts: HubPrompt[]): string {
  const sortedPrompts = sortPrompts(prompts);
  const featured = pickFeatured(sortedPrompts);
  const regular = getRegularPrompts(sortedPrompts, featured);
  const displayedRegular = regular.slice(0, MAX_REGULAR_PROMPTS_TO_DISPLAY);
  const hiddenCount = Math.max(regular.length - displayedRegular.length, 0);

  let md = "";
  md += generateHeader(locale);
  md += generateLanguageNavigation(locale);
  md += generateGallerySection(locale);
  md += generateTOC(locale);
  md += generateWhatIs(locale);
  md += generateStats(sortedPrompts.length, featured.length, locale);
  md += generateFeaturedSection(featured, locale);
  md += generateAllPromptsSection(displayedRegular, hiddenCount, locale);
  md += generateContribute(locale);
  md += generateFooter(locale);
  return md;
}

async function main() {
  for (const lang of SUPPORTED_LANGUAGES) {
    const prompts = readPrompts(lang.code);
    const markdown = generateMarkdown(lang.code, prompts);
    const outputPath = path.join(REPO_ROOT, lang.readmeFileName);
    fs.writeFileSync(outputPath, markdown, "utf-8");
    console.log(`Updated ${lang.readmeFileName} with ${prompts.length} prompts`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
