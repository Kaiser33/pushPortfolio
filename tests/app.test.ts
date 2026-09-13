import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../src/App";

test("renders artwork title and image upload controls", () => {
  const html = renderToStaticMarkup(createElement(App));
  assert.match(html, /作品中文标题/);
  assert.match(html, /选择图片/);
});
