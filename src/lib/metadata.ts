export type ArtworkInput = {
  titleZh: string;
  descriptionZh?: string;
  date: string;
  tagsZh?: string[];
  titleEn?: string;
  descriptionEn?: string;
};

export type ValidationResult = { errors: string[] };

export function validateArtwork(input: Partial<ArtworkInput>): ValidationResult {
  const errors: string[] = [];
  if (!input.titleZh?.trim()) errors.push("请填写作品中文标题");
  if (!input.date?.trim()) errors.push("请填写创作日期");
  return { errors };
}

export function toSlug(title: string, date: string): string {
  const latin = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${date}_${latin || "yalo-artwork"}`;
}
