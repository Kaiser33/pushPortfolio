import type { ArtworkInput } from "./metadata";

export type PlatformDocument = { title: string; body: string; tags: string[] };
export type PlatformCopy = {
  zcool: PlatformDocument;
  tuhua: PlatformDocument;
  behance: PlatformDocument;
  artstation: PlatformDocument;
  deviantart: PlatformDocument;
};

const tagDictionary: Record<string, string> = {
  "儿童插画": "children's illustration",
  "绘本": "picture book",
  "角色设计": "character design",
  "水彩": "watercolor",
};

function englishTags(tags: string[]) {
  return tags.map((tag) => tagDictionary[tag] ?? `${tag} (please review)`);
}

function englishDocument(input: ArtworkInput): PlatformDocument {
  const generated = !input.titleEn?.trim() || !input.descriptionEn?.trim();
  const title = input.titleEn?.trim() || `${input.titleZh} — Yalo Illustration`;
  const description = input.descriptionEn?.trim() || `Please review: ${input.descriptionZh?.trim() || "Yalo's original illustration."}`;
  return { title, body: `${title}\n\n${description}\n\n© Yalo. All rights reserved.`, tags: englishTags(input.tagsZh ?? []) };
}

function chineseDocument(input: ArtworkInput): PlatformDocument {
  const title = input.titleZh.trim();
  return { title, body: `${title}\n\n${input.descriptionZh?.trim() || ""}\n\n创作日期：${input.date}\n\n© Yalo. 保留所有权利。`, tags: input.tagsZh ?? [] };
}

export function buildPlatformCopy(input: ArtworkInput): PlatformCopy {
  const chinese = chineseDocument(input);
  const english = englishDocument(input);
  return { zcool: chinese, tuhua: chinese, behance: english, artstation: english, deviantart: english };
}
