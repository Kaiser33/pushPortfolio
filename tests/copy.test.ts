import assert from "node:assert/strict";
import test from "node:test";
import { buildPlatformCopy } from "../src/lib/copy";

test("marks generated English copy for human review", () => {
  const copy = buildPlatformCopy({
    titleZh: "月亮和小熊",
    descriptionZh: "一个睡前故事",
    date: "2026-09-13",
    tagsZh: ["儿童插画"],
  });
  assert.match(copy.behance.body, /Please review/);
  assert.match(copy.behance.tags.join(" "), /children's illustration/);
});
