import assert from "node:assert/strict";
import test from "node:test";
import { toSlug, validateArtwork } from "../src/lib/metadata";

test("rejects artwork without a Chinese title", () => {
  assert.deepEqual(validateArtwork({ titleZh: "", date: "2026-09-13" }).errors, ["请填写作品中文标题"]);
});

test("creates a safe fallback slug for Chinese-only titles", () => {
  assert.equal(toSlug("月亮和小熊", "2026-09-13"), "2026-09-13_yalo-artwork");
});
