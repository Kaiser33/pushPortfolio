import JSZip from "jszip";
import { buildPlatformCopy } from "./copy";
import type { ArtworkInput } from "./metadata";
import { toSlug } from "./metadata";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILES = 20;
const MAX_BYTES = 200 * 1024 * 1024;

export function validateImageFiles(files: File[]): void {
  if (files.length === 0) throw new Error("请至少选择一张图片");
  if (files.length > MAX_FILES) throw new Error(`一次最多选择 ${MAX_FILES} 张图片`);
  const invalid = files.find((file) => !ACCEPTED_TYPES.has(file.type));
  if (invalid) throw new Error(`不支持的文件类型：${invalid.name}`);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_BYTES) throw new Error("图片总大小不能超过 200 MB，请分批导出");
}

function extensionFor(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && ["jpg", "jpeg", "png", "webp"].includes(extension) ? extension : "png";
}

function textFor(document: { title: string; body: string; tags: string[] }) {
  return `${document.body}\n\n标签：${document.tags.join("、")}`.trim();
}

export async function buildDistributionPackage(input: ArtworkInput, files: File[]): Promise<Blob> {
  validateImageFiles(files);
  const root = `${toSlug(input.titleZh, input.date)}/`;
  const zip = new JSZip();
  const copy = buildPlatformCopy(input);
  const folders = [
    `${root}zcool/图片/`,
    `${root}tuhua/图片/`,
    `${root}behance/images/`,
    `${root}artstation/images/`,
    `${root}deviantart/images/`,
  ];
  folders.forEach((folder) => zip.folder(folder));

  for (const [index, file] of files.entries()) {
    const filename = `${String(index + 1).padStart(2, "0")}.${extensionFor(file)}`;
    const bytes = await file.arrayBuffer();
    folders.forEach((folder) => zip.file(`${folder}${filename}`, bytes));
  }

  zip.file(`${root}zcool/发布文案.txt`, textFor(copy.zcool));
  zip.file(`${root}tuhua/发布文案.txt`, textFor(copy.tuhua));
  zip.file(`${root}behance/publish-copy.md`, textFor(copy.behance));
  zip.file(`${root}artstation/publish-copy.md`, textFor(copy.artstation));
  zip.file(`${root}deviantart/publish-copy.md`, textFor(copy.deviantart));
  zip.file(`${root}README.txt`, "本分发包仅在浏览器本地生成。上传前请人工检查隐私、版权、图片顺序和文案。\n\n站酷、涂鸦王国使用中文文案；Behance、ArtStation、DeviantArt 使用英文文案。\n");
  return zip.generateAsync({ type: "blob" });
}
