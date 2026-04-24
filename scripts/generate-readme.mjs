import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourcePath =
  process.env.PROMPTS_SOURCE ||
  path.resolve(projectRoot, "../prompts-hub/src/data/records.json");
const maxItems = Number(process.env.MAX_ITEMS || 18);
const atlasBaseUrl = "https://www.atlascloud.ai/prompts-hub/gpt-image-2-prompt";
const defaultLocale = process.env.ATLASCLOUD_DEFAULT_LOCALE || "en-US";

function atlasLink(locale = defaultLocale) {
  return `${atlasBaseUrl}?locale=${encodeURIComponent(locale)}`;
}

const locales = [
  {
    locale: "en-US",
    dataLang: "en",
    fileName: "README.md",
    switchLabel: "English",
    titleBrowse: "Browse Online (Recommended)",
    ctaOpen: "👉 Open AtlasCloud GPT-Image-2 Prompt Library",
    summaryLabel: "Quick Stats",
    tocLabel: "Table Of Contents",
    examplesLabel: "Featured Prompt Examples",
    examplesDesc: "These examples are sampled from `prompts-hub/src/data/records.json`.",
    useLabel: "How To Use",
    notesLabel: "Acknowledgements And Notes",
    descFallback: "No description available.",
    imageFallback: "_No preview image available._",
    detailsCta: "👉 View Full Prompt Library On AtlasCloud",
    metricItems: "Curated Items",
    metricSource: "Data Source",
    metricLangMix: "Language Mix",
    metricGenerated: "Generated At",
    useStep1: "1. Copy one `Prompt` into GPT-Image-2.",
    useStep2: "2. Replace placeholder params like `{argument name=\"...\" default=\"...\"}`.",
    useStep3: "3. Browse more reusable templates:",
    useStep4: "4. Switch languages quickly:",
    note1: "Data source: `prompts-hub` dataset.",
    note2: "This repository is for learning and curation; keep original author and source links.",
    note3: "If you find infringement or inappropriate content, please open an issue.",
    noData: "No records found for this language yet.",
  },
  {
    locale: "zh-CN",
    dataLang: "zh",
    fileName: "README.zh-CN.md",
    switchLabel: "中文",
    titleBrowse: "在线浏览（推荐）",
    ctaOpen: "👉 打开 AtlasCloud GPT-Image-2 提示词库",
    summaryLabel: "快速统计",
    tocLabel: "目录",
    examplesLabel: "精选 Prompt 示例",
    examplesDesc: "这些样例来自 `prompts-hub/src/data/records.json`。",
    useLabel: "使用方式",
    notesLabel: "致谢与声明",
    descFallback: "暂无描述。",
    imageFallback: "_暂无示意图_",
    detailsCta: "👉 在 AtlasCloud 查看完整提示词库",
    metricItems: "本次精选条目",
    metricSource: "数据来源",
    metricLangMix: "语言分布",
    metricGenerated: "生成时间",
    useStep1: "1. 复制某条 `Prompt` 到 GPT-Image-2。",
    useStep2: "2. 替换 `{argument name=\"...\" default=\"...\"}` 占位参数。",
    useStep3: "3. 查看更多可复用模板：",
    useStep4: "4. 快速切换语言：",
    note1: "数据来源：`prompts-hub` 数据集。",
    note2: "本仓库用于学习与示例整理，请保留原作者与来源链接。",
    note3: "若发现侵权或不当内容，请提交 issue。",
    noData: "当前语言暂无可用记录。",
  },
  {
    locale: "ja-JP",
    dataLang: "ja",
    fileName: "README.ja-JP.md",
    switchLabel: "日本語",
    titleBrowse: "オンライン閲覧（推奨）",
    ctaOpen: "👉 AtlasCloud GPT-Image-2 プロンプトライブラリを開く",
    summaryLabel: "クイック統計",
    tocLabel: "目次",
    examplesLabel: "注目の Prompt 例",
    examplesDesc: "これらの例は `prompts-hub/src/data/records.json` から抽出されています。",
    useLabel: "使い方",
    notesLabel: "謝辞と注意事項",
    descFallback: "説明はありません。",
    imageFallback: "_プレビュー画像はありません。_",
    detailsCta: "👉 AtlasCloud で完全なプロンプトライブラリを見る",
    metricItems: "掲載件数",
    metricSource: "データソース",
    metricLangMix: "言語構成",
    metricGenerated: "生成時刻",
    useStep1: "1. `Prompt` を GPT-Image-2 に貼り付けます。",
    useStep2: "2. `{argument name=\"...\" default=\"...\"}` のプレースホルダーを置き換えます。",
    useStep3: "3. さらにテンプレートを見る：",
    useStep4: "4. 言語を切り替える：",
    note1: "データソース：`prompts-hub` データセット。",
    note2: "学習と整理目的のリポジトリです。作者情報と出典を保持してください。",
    note3: "問題のある内容は issue で報告してください。",
    noData: "この言語のレコードはまだありません。",
  },
  {
    locale: "ko-KR",
    dataLang: "ko",
    fileName: "README.ko-KR.md",
    switchLabel: "한국어",
    titleBrowse: "온라인 보기 (권장)",
    ctaOpen: "👉 AtlasCloud GPT-Image-2 프롬프트 라이브러리 열기",
    summaryLabel: "빠른 통계",
    tocLabel: "목차",
    examplesLabel: "추천 Prompt 예시",
    examplesDesc: "이 예시는 `prompts-hub/src/data/records.json` 에서 추출되었습니다.",
    useLabel: "사용 방법",
    notesLabel: "감사의 말 및 안내",
    descFallback: "설명이 없습니다.",
    imageFallback: "_미리보기 이미지가 없습니다._",
    detailsCta: "👉 AtlasCloud에서 전체 프롬프트 라이브러리 보기",
    metricItems: "선정 항목 수",
    metricSource: "데이터 소스",
    metricLangMix: "언어 분포",
    metricGenerated: "생성 시간",
    useStep1: "1. `Prompt`를 GPT-Image-2에 붙여넣으세요.",
    useStep2: "2. `{argument name=\"...\" default=\"...\"}` 자리표시자를 바꾸세요.",
    useStep3: "3. 더 많은 템플릿 보기:",
    useStep4: "4. 언어 빠르게 전환:",
    note1: "데이터 소스: `prompts-hub` 데이터셋.",
    note2: "학습/정리 목적의 저장소입니다. 원작자와 출처를 유지하세요.",
    note3: "문제가 있는 내용은 issue로 알려주세요.",
    noData: "이 언어의 레코드가 아직 없습니다.",
  },
  {
    locale: "es-ES",
    dataLang: "es",
    fileName: "README.es-ES.md",
    switchLabel: "Español",
    titleBrowse: "Explorar En Línea (Recomendado)",
    ctaOpen: "👉 Abrir Biblioteca de Prompts GPT-Image-2 en AtlasCloud",
    summaryLabel: "Estadísticas Rápidas",
    tocLabel: "Tabla De Contenidos",
    examplesLabel: "Prompts Destacados",
    examplesDesc: "Estos ejemplos se toman de `prompts-hub/src/data/records.json`.",
    useLabel: "Cómo Usar",
    notesLabel: "Agradecimientos Y Notas",
    descFallback: "Sin descripción.",
    imageFallback: "_No hay imagen de vista previa._",
    detailsCta: "👉 Ver biblioteca completa de prompts en AtlasCloud",
    metricItems: "Elementos Curados",
    metricSource: "Fuente De Datos",
    metricLangMix: "Mezcla De Idiomas",
    metricGenerated: "Generado En",
    useStep1: "1. Copia un `Prompt` en GPT-Image-2.",
    useStep2: "2. Reemplaza parámetros como `{argument name=\"...\" default=\"...\"}`.",
    useStep3: "3. Ver más plantillas reutilizables:",
    useStep4: "4. Cambiar idioma rápidamente:",
    note1: "Fuente de datos: conjunto `prompts-hub`.",
    note2: "Este repositorio es para aprendizaje y curación; conserva autor y fuente.",
    note3: "Si encuentras contenido inapropiado, abre un issue.",
    noData: "Aún no hay registros para este idioma.",
  },
  {
    locale: "fr-FR",
    dataLang: "fr",
    fileName: "README.fr-FR.md",
    switchLabel: "Français",
    titleBrowse: "Navigation En Ligne (Recommandé)",
    ctaOpen: "👉 Ouvrir la bibliothèque de prompts GPT-Image-2 sur AtlasCloud",
    summaryLabel: "Statistiques Rapides",
    tocLabel: "Table Des Matières",
    examplesLabel: "Exemples De Prompts",
    examplesDesc: "Ces exemples proviennent de `prompts-hub/src/data/records.json`.",
    useLabel: "Utilisation",
    notesLabel: "Remerciements Et Notes",
    descFallback: "Aucune description.",
    imageFallback: "_Aucune image d'aperçu._",
    detailsCta: "👉 Voir la bibliothèque complète sur AtlasCloud",
    metricItems: "Éléments Sélectionnés",
    metricSource: "Source Des Données",
    metricLangMix: "Répartition Linguistique",
    metricGenerated: "Généré Le",
    useStep1: "1. Copiez un `Prompt` dans GPT-Image-2.",
    useStep2: "2. Remplacez les paramètres `{argument name=\"...\" default=\"...\"}`.",
    useStep3: "3. Voir plus de modèles réutilisables :",
    useStep4: "4. Changer rapidement de langue :",
    note1: "Source des données : dataset `prompts-hub`.",
    note2: "Ce dépôt sert à l'apprentissage/curation; conservez auteur et source.",
    note3: "En cas de contenu inapproprié, ouvrez une issue.",
    noData: "Aucun enregistrement disponible pour cette langue.",
  },
  {
    locale: "de-DE",
    dataLang: "de",
    fileName: "README.de-DE.md",
    switchLabel: "Deutsch",
    titleBrowse: "Online Durchsuchen (Empfohlen)",
    ctaOpen: "👉 AtlasCloud GPT-Image-2 Prompt-Bibliothek öffnen",
    summaryLabel: "Schnellstatistik",
    tocLabel: "Inhaltsverzeichnis",
    examplesLabel: "Ausgewählte Prompt-Beispiele",
    examplesDesc: "Diese Beispiele stammen aus `prompts-hub/src/data/records.json`.",
    useLabel: "Verwendung",
    notesLabel: "Danksagung Und Hinweise",
    descFallback: "Keine Beschreibung verfügbar.",
    imageFallback: "_Kein Vorschaubild verfügbar._",
    detailsCta: "👉 Vollständige Prompt-Bibliothek auf AtlasCloud ansehen",
    metricItems: "Kuratiere Einträge",
    metricSource: "Datenquelle",
    metricLangMix: "Sprachverteilung",
    metricGenerated: "Erstellt Am",
    useStep1: "1. Kopiere einen `Prompt` in GPT-Image-2.",
    useStep2: "2. Ersetze Platzhalter wie `{argument name=\"...\" default=\"...\"}`.",
    useStep3: "3. Weitere Vorlagen ansehen:",
    useStep4: "4. Sprache schnell wechseln:",
    note1: "Datenquelle: `prompts-hub`-Datensatz.",
    note2: "Dieses Repository dient Lernen/Kuratierung; Autor und Quelle beibehalten.",
    note3: "Bei problematischen Inhalten bitte ein Issue eröffnen.",
    noData: "Für diese Sprache sind noch keine Einträge vorhanden.",
  },
];

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

function getBaseLang(code) {
  return String(code || "").toLowerCase().split("-")[0];
}

function isTextCompatible(text, lang) {
  const t = sanitize(text);
  if (!t) return false;
  const hasCjk = /[\u4e00-\u9fff]/.test(t);
  const hasKana = /[\u3040-\u30ff]/.test(t);
  const hasHangul = /[\uac00-\ud7af]/.test(t);
  const hasCyrillic = /[\u0400-\u04FF]/.test(t);
  const hasArabic = /[\u0600-\u06FF]/.test(t);

  if (lang === "zh") return hasCjk && !hasKana && !hasHangul;
  if (lang === "ja") return hasKana;
  if (lang === "ko") return hasHangul;
  if (lang === "en" || lang === "es" || lang === "fr" || lang === "de") {
    return !hasCjk && !hasKana && !hasHangul && !hasCyrillic && !hasArabic;
  }
  return true;
}

function detailI18n(lang) {
  if (lang === "zh") {
    return {
      secDesc: "Description",
      secPrompt: "Prompt",
      secImage: "Generated Image",
      secDetails: "Details",
      labelId: "ID",
      labelAuthor: "作者",
      labelSource: "来源",
      labelPublished: "发布时间",
      labelLanguage: "语言",
      sourceName: "Twitter 原帖",
    };
  }
  if (lang === "ja") {
    return {
      secDesc: "説明",
      secPrompt: "プロンプト",
      secImage: "生成画像",
      secDetails: "詳細",
      labelId: "ID",
      labelAuthor: "作者",
      labelSource: "出典",
      labelPublished: "公開日",
      labelLanguage: "言語",
      sourceName: "Twitter 投稿",
    };
  }
  if (lang === "ko") {
    return {
      secDesc: "설명",
      secPrompt: "프롬프트",
      secImage: "생성 이미지",
      secDetails: "상세",
      labelId: "ID",
      labelAuthor: "작성자",
      labelSource: "출처",
      labelPublished: "게시일",
      labelLanguage: "언어",
      sourceName: "Twitter 게시물",
    };
  }
  if (lang === "es") {
    return {
      secDesc: "Descripción",
      secPrompt: "Prompt",
      secImage: "Imagen Generada",
      secDetails: "Detalles",
      labelId: "ID",
      labelAuthor: "Autor",
      labelSource: "Fuente",
      labelPublished: "Publicado",
      labelLanguage: "Idioma",
      sourceName: "Publicación en Twitter",
    };
  }
  if (lang === "fr") {
    return {
      secDesc: "Description",
      secPrompt: "Prompt",
      secImage: "Image Générée",
      secDetails: "Détails",
      labelId: "ID",
      labelAuthor: "Auteur",
      labelSource: "Source",
      labelPublished: "Publié",
      labelLanguage: "Langue",
      sourceName: "Publication Twitter",
    };
  }
  if (lang === "de") {
    return {
      secDesc: "Beschreibung",
      secPrompt: "Prompt",
      secImage: "Generiertes Bild",
      secDetails: "Details",
      labelId: "ID",
      labelAuthor: "Autor",
      labelSource: "Quelle",
      labelPublished: "Veröffentlicht",
      labelLanguage: "Sprache",
      sourceName: "Twitter-Beitrag",
    };
  }
  return {
    secDesc: "Description",
    secPrompt: "Prompt",
    secImage: "Generated Image",
    secDetails: "Details",
    labelId: "ID",
    labelAuthor: "Author",
    labelSource: "Source",
    labelPublished: "Published",
    labelLanguage: "Language",
    sourceName: "Twitter Post",
  };
}

function selectLocalizedRecord(item, i18n) {
  const promptRaw =
    i18n.dataLang === "zh"
      ? sanitize(item.translated_prompt || item.prompt)
      : sanitize(item.original_prompt || item.prompt);
  if (!isTextCompatible(promptRaw, i18n.dataLang)) return null;

  let title = sanitize(item.title || `Prompt ${item.id}`);
  let desc = sanitize(item.description || i18n.descFallback);

  if (!isTextCompatible(title, i18n.dataLang)) title = `Prompt ${item.id}`;
  if (!isTextCompatible(desc, i18n.dataLang)) desc = i18n.descFallback;

  return {
    ...item,
    _title: title,
    _desc: desc,
    _prompt: promptRaw,
  };
}

function renderItem(item, index, i18n) {
  const labels = detailI18n(i18n.dataLang);
  const prompt = shorten(sanitize(item._prompt), 1200);
  const desc = sanitize(item._desc || i18n.descFallback);
  const title = sanitize(item._title || `Prompt ${item.id}`);
  const author = sanitize(item.author_name || "Unknown");
  const authorLink = sanitize(item.author_link || "");
  const sourceLink = sanitize(item.source_link || "");
  const published = toDate(item.source_published_at);
  const language = sanitize(item.language || "unknown");
  const image = pickImage(item);
  const promptType = prompt.startsWith("{") || prompt.startsWith("[") ? "json" : "text";

  const authorPart = authorLink ? `[${author}](${authorLink})` : author;
  const sourcePart = sourceLink ? `[${labels.sourceName}](${sourceLink})` : "N/A";
  const imagePart = image
    ? `<div align="center">\n<img src="${image}" width="700" alt="${title}">\n</div>`
    : i18n.imageFallback;

  return `### No. ${index + 1}: ${title}

#### 📖 ${labels.secDesc}

${desc}

#### 📝 ${labels.secPrompt}

\`\`\`${promptType}
${prompt}
\`\`\`

#### 🖼️ ${labels.secImage}

${imagePart}

#### 📌 ${labels.secDetails}

- **${labels.labelId}:** ${item.id}
- **${labels.labelAuthor}:** ${authorPart}
- **${labels.labelSource}:** ${sourcePart}
- **${labels.labelPublished}:** ${published}
- **${labels.labelLanguage}:** ${language}

**[${i18n.detailsCta}](${atlasLink(i18n.locale)})**

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
  for (const config of locales) {
    const langPool = pool
      .filter((item) => getBaseLang(item.language) === config.dataLang)
      .map((item) => selectLocalizedRecord(item, config))
      .filter(Boolean);
    const scored = langPool
      .map((item) => ({ item, score: rng() }))
      .sort((a, b) => a.score - b.score)
      .slice(0, Math.min(maxItems, langPool.length))
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
    const switchLine = locales
      .map((x) => `[${x.switchLabel}](${x.fileName})`)
      .join(" | ");

    const tocBrowse = config.titleBrowse.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-");
    const tocSummary = config.summaryLabel.toLowerCase().replace(/\s+/g, "-");
    const tocExamples = config.examplesLabel.toLowerCase().replace(/\s+/g, "-");
    const tocUse = config.useLabel.toLowerCase().replace(/\s+/g, "-");
    const tocNotes = config.notesLabel.toLowerCase().replace(/\s+/g, "-");

    const header = `# 🚀 Awesome GPT-Image-2 Prompts (AtlasCloud Edition)

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![AtlasCloud](https://img.shields.io/badge/AtlasCloud-Prompts%20Hub-blue)](${atlasLink(config.locale)})

> Automatically generated GPT-Image-2 prompt collection from \`prompts-hub\` data.
>
> Goal: provide an awesome-style curated list and link to AtlasCloud for full browsing.

---

## 🌐 ${config.titleBrowse}

**[${config.ctaOpen}](${atlasLink(config.locale)})**
**Language:** ${switchLine}

---

## 📊 ${config.summaryLabel}

| Metric | Value |
|---|---|
| ${config.metricItems} | **${scored.length}** |
| ${config.metricSource} | \`prompts-hub records dataset\` |
| ${config.metricLangMix} | ${langLine || "N/A"} |
| ${config.metricGenerated} | ${generatedAt} |

---

## 📖 ${config.tocLabel}

- [🌐 ${config.titleBrowse}](#-${tocBrowse})
- [📊 ${config.summaryLabel}](#-${tocSummary})
- [🔥 ${config.examplesLabel}](#-${tocExamples})
- [🧭 ${config.useLabel}](#-${tocUse})
- [🙏 ${config.notesLabel}](#-${tocNotes})

---

## 🔥 ${config.examplesLabel}

> ${config.examplesDesc}

`;

    const body =
      scored.length > 0
        ? scored.map((item, index) => renderItem(item, index, config)).join("\n")
        : `${config.noData}\n\n---\n`;

    const footer = `
## 🧭 ${config.useLabel}

${config.useStep1}
${config.useStep2}
${config.useStep3} **[AtlasCloud Prompt Library](${atlasLink(config.locale)})**.
${config.useStep4} ${switchLine}.

---

## 🙏 ${config.notesLabel}

- ${config.note1}
- ${config.note2}
- ${config.note3}
`;

    const outputPath = path.resolve(projectRoot, config.fileName);
    fs.writeFileSync(outputPath, `${header}${body}${footer}`, "utf-8");
    console.log(`README generated: ${outputPath}`);
  }
}

main();
