import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const DEFAULT_RECORDS_DIR = path.resolve(
  projectRoot,
  "../prompts-hub/src/data/records_by_locale"
);

const LOCALE_TO_FILE: Record<string, string> = {
  en: "en-US.json",
  "en-US": "en-US.json",
  zh: "zh-CN.json",
  "zh-CN": "zh-CN.json",
  "zh-TW": "zh-TW.json",
  "ja-JP": "ja-JP.json",
  "ko-KR": "ko-KR.json",
  "th-TH": "th-TH.json",
};

export interface Media {
  id: number;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface Prompt {
  id: number;
  model?: string;
  title: string;
  description: string;
  content: string;
  translatedContent?: string; // Translated content for current locale
  sourceLink?: string; // Optional source link
  sourcePublishedAt: string;
  sourceMedia: string[];
  video?: {
    url: string;
    thumbnail?: string;
  };
  media?: Media[];
  author: {
    name: string;
    link?: string;
  };
  language: string;
  featured?: boolean;
  sort?: number;
  needReferenceImages?: boolean; // Whether this prompt requires user to input images
  sourceMeta?: Record<string, unknown>;
  imageCategories?: {
    useCases?: Array<PromptCategory>;
    styles?: Array<PromptCategory>;
    subjects?: Array<PromptCategory>;
  };
}

interface LocalRecord {
  id: number;
  title?: string;
  description?: string;
  prompt?: string;
  original_prompt?: string;
  translated_prompt?: string;
  source_link?: string;
  source_published_at?: string;
  author_name?: string;
  author_link?: string;
  language?: string;
  need_reference_images?: boolean;
  remote_images?: string[];
}

function normalizeLocale(locale: string): string {
  return LOCALE_TO_FILE[locale] ? locale : "en-US";
}

function recordsDir(): string {
  return process.env.PROMPTS_RECORDS_DIR || DEFAULT_RECORDS_DIR;
}

function resolveLocaleFile(locale: string): string {
  const normalized = normalizeLocale(locale);
  const fileName = LOCALE_TO_FILE[normalized] || "en-US.json";
  return path.resolve(recordsDir(), fileName);
}

function toPrompt(item: LocalRecord): Prompt {
  return {
    id: item.id,
    model: "gpt-image-2",
    title: String(item.title || `Prompt ${item.id}`),
    description: String(item.description || "No description available."),
    content: String(item.original_prompt || item.prompt || ""),
    translatedContent: item.translated_prompt || item.prompt || "",
    sourceLink: item.source_link,
    sourcePublishedAt: item.source_published_at || new Date(0).toISOString(),
    sourceMedia: Array.isArray(item.remote_images) ? item.remote_images : [],
    author: {
      name: String(item.author_name || "Unknown"),
      link: item.author_link,
    },
    language: String(item.language || "en"),
    featured: false,
    needReferenceImages: Boolean(item.need_reference_images),
  };
}

function dedupeById(prompts: Prompt[]): Prompt[] {
  const seen = new Set<number>();
  const result: Prompt[] = [];
  for (const prompt of prompts) {
    if (seen.has(prompt.id)) {
      continue;
    }
    seen.add(prompt.id);
    result.push(prompt);
  }
  return result;
}

function readLocaleRecords(locale: string): LocalRecord[] {
  const localeFile = resolveLocaleFile(locale);
  if (!fs.existsSync(localeFile)) {
    return [];
  }
  const raw = fs.readFileSync(localeFile, "utf-8");
  const parsed = JSON.parse(raw) as LocalRecord[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function fetchAllPrompts(
  locale: string = "en-US",
  _allCategories: FilterCategory[] = []
): Promise<{ docs: Prompt[]; total: number }> {
  const normalized = normalizeLocale(locale);
  const records = readLocaleRecords(normalized);
  const docs = dedupeById(
    records
      .filter((item) => item && item.id && (item.prompt || item.original_prompt))
      .map(toPrompt)
      .filter((prompt) => prompt.sourceMedia.length > 0)
      .sort(
        (a, b) =>
          new Date(b.sourcePublishedAt).getTime() -
          new Date(a.sourcePublishedAt).getTime()
      )
  );

  return {
    docs,
    total: docs.length,
  };
}

/**
 * 排序 prompts
 * @param prompts prompts 数组
 * @param total 可选的总数（用于显示真实总数，而非当前获取的数量）
 */
export function sortPrompts(prompts: Prompt[], total?: number) {
  const featured = prompts.filter((p) => p.featured);
  const regular = prompts.filter((p) => !p.featured);

  return {
    all: prompts,
    featured,
    regular,
    stats: {
      total: total ?? prompts.length,
      featured: featured.length,
    },
  };
}

/**
 * 根据 GitHub issue 编号查找已存在的 prompt
 */
export async function findPromptByGitHubIssue(
  _issueNumber: string
): Promise<Prompt | null> {
  throw new Error("CMS sync is disabled in AtlasCloud local-data mode.");
}

/**
 * 创建新 prompt（直接发布，无草稿）
 */
export async function createPrompt(
  _data: Partial<Prompt>
): Promise<Prompt | null> {
  throw new Error("CMS sync is disabled in AtlasCloud local-data mode.");
}

/**
 * 更新已存在的 prompt
 */
export async function updatePrompt(
  _id: number,
  _data: Partial<Prompt>
): Promise<Prompt | null> {
  throw new Error("CMS sync is disabled in AtlasCloud local-data mode.");
}

/**
 * Category from CMS
 */
export interface PromptCategory {
  id: number;
  title: string;
  slug: string;
  parent?: PromptCategory | null;
  featured?: boolean;
  sort?: number;
}

/**
 * Processed category for filtering
 */
export interface FilterCategory {
  id: number;
  title: string;
  slug: string;
  parentId?: number | null;
  parentSlug?: string | null;
  featured?: boolean;
  sort?: number | null;
}

/**
 * Category group organized by parent-child structure
 */
export interface CategoryGroup {
  parentId: number | null;
  parentTitle: string | null;
  parentSlug: string | null;
  children: FilterCategory[];
}

export async function fetchPromptCategories(
  _locale: string = "en-US"
): Promise<{
  allCategories: FilterCategory[];
  featuredCategories: FilterCategory[];
}> {
  return {
    allCategories: [],
    featuredCategories: [],
  };
}
