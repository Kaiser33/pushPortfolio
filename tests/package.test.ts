import assert from "node:assert/strict";
import test from "node:test";
import JSZip from "jszip";
import { buildDistributionPackage, validateImageFiles } from "../src/lib/package";
import type { ArtworkInput } from "../src/lib/metadata";

const validArtwork: ArtworkInput = {
  titleZh: "月亮和小熊",
  descriptionZh: "一个睡前故事",
  date: "2026-09-13",
  tagsZh: ["儿童插画"],
};

const pngFile = new File(["image"], "one.png", { type: "image/png" });

test("creates all five platform directories", async () => {
  const blob = await buildDistributionPackage(validArtwork, [pngFile]);
  const zip = await JSZip.loadAsync(blob);
  const entries = Object.keys(zip.files);
  assert.ok(entries.includes("2026-09-13_yalo-artwork/zcool/图片/"));
  assert.ok(entries.includes("2026-09-13_yalo-artwork/tuhua/图片/"));
  assert.ok(entries.includes("2026-09-13_yalo-artwork/behance/images/"));
  assert.ok(entries.includes("2026-09-13_yalo-artwork/artstation/images/"));
  assert.ok(entries.includes("2026-09-13_yalo-artwork/deviantart/images/"));
});

test("rejects unsupported image types", () => {
  assert.throws(() => validateImageFiles([new File(["x"], "note.gif", { type: "image/gif" })]));
});
