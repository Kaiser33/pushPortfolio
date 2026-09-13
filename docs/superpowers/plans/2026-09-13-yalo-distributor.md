# Yalo 作品一键分发工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建可部署到 GitHub Pages 的中文网页工具，在浏览器本地生成五个平台的插画上传 ZIP 分发包。

**Architecture:** 使用 Vite、React 和 TypeScript 构建静态单页应用。图片和作品资料仅在浏览器内存中处理；纯函数模块生成元数据、文案、文件名和 ZIP 条目，页面只负责输入、状态和下载。

**Tech Stack:** React、TypeScript、Vite、JSZip、Node 内置测试运行器、GitHub Actions、GitHub Pages。

**Spec:** `docs/superpowers/specs/2026-09-13-yalo-distributor-design.md`

## Global Constraints

- 不上传、不保存、不分析作品图片或儿童个人资料。
- 不实现账号登录、平台自动上传或自动发布。
- 支持站酷、涂鸦王国、Behance、ArtStation、DeviantArt。
- 只接受 JPG、PNG、WebP；每次 1–20 张，总大小上限 200 MB。
- `.gitignore` 排除图片、ZIP 和环境文件；GitHub 仅保存源码及构建产物。

---

### Task 1: 初始化静态应用和 GitHub Pages 配置

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Create: `.gitignore`, `.github/workflows/deploy-pages.yml`, `public/favicon.svg`
- Create: `src/main.tsx`, `src/styles.css`

**Produces:** `npm run dev`、`npm run build`、`npm test` 和 GitHub Pages 构建流程。

- [ ] **Step 1: 创建 Vite React TypeScript 项目配置**

在 `package.json` 中定义：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "tsx --test tests/**/*.test.ts"
  }
}
```

- [ ] **Step 2: 添加隐私忽略规则**

写入 `.gitignore`：

```gitignore
node_modules/
dist/
*.zip
*.jpg
*.jpeg
*.png
*.webp
.env
```

- [ ] **Step 3: 添加 Pages 部署工作流**

创建只在 `main` 推送时构建 `dist/` 并部署 GitHub Pages 的工作流；不在工作流中传送作品文件。

- [ ] **Step 4: 验证构建**

Run: `npm run build`

Expected: 成功生成 `dist/index.html`，没有作品图片。

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.ts tsconfig.json index.html .gitignore .github src/main.tsx src/styles.css public/favicon.svg
git commit -m "chore: initialize yalo distributor"
```

### Task 2: 作品元数据与五平台文案生成

**Files:**
- Create: `src/lib/metadata.ts`, `src/lib/copy.ts`
- Create: `tests/metadata.test.ts`, `tests/copy.test.ts`

**Consumes:** `ArtworkInput { titleZh, descriptionZh, date, tagsZh, titleEn?, descriptionEn? }`.

**Produces:** `validateArtwork(input): ValidationResult`、`toSlug(title, date): string`、`buildPlatformCopy(input): PlatformCopy`。

- [ ] **Step 1: 写失败测试**

```ts
test("rejects artwork without a Chinese title", () => {
  assert.deepEqual(validateArtwork({ titleZh: "", date: "2026-09-13" }).errors, ["请填写作品中文标题"]);
});
```

- [ ] **Step 2: 验证测试失败**

Run: `npm test -- tests/metadata.test.ts`

Expected: FAIL，原因是 `metadata` 模块不存在。

- [ ] **Step 3: 最小实现**

实现必填标题、日期校验及 `toSlug`。不可转换的中文标题使用 `yalo-artwork`，不臆译故事名称。

- [ ] **Step 4: 验证测试通过**

Run: `npm test -- tests/metadata.test.ts`

Expected: PASS。

- [ ] **Step 5: 写英文草稿失败测试**

```ts
test("marks generated English copy for human review", () => {
  const copy = buildPlatformCopy({ titleZh: "月亮和小熊", descriptionZh: "一个睡前故事", date: "2026-09-13", tagsZh: ["儿童插画"] });
  assert.match(copy.behance.body, /Please review/);
  assert.match(copy.behance.tags.join(" "), /children's illustration/);
});
```

- [ ] **Step 6: 验证文案测试失败**

Run: `npm test -- tests/copy.test.ts`

Expected: FAIL，原因是 `copy` 模块不存在。

- [ ] **Step 7: 最小实现**

输出站酷、涂鸦王国中文 TXT 和 Behance、ArtStation、DeviantArt 英文 Markdown；英文自动草稿标记人工核对，词表只翻译通用标签。

- [ ] **Step 8: 验证全部逻辑**

Run: `npm test`

Expected: PASS。

- [ ] **Step 9: Commit**

```bash
git add src/lib tests/metadata.test.ts tests/copy.test.ts
git commit -m "feat: generate platform copy"
```

### Task 3: 本地 ZIP 分发包生成器

**Files:**
- Create: `src/lib/package.ts`, `tests/package.test.ts`

**Consumes:** `ArtworkInput`、`File[]`、`buildPlatformCopy`、`toSlug`.

**Produces:** `validateImageFiles(files): void` 和 `buildDistributionPackage(input, files): Promise<Blob>`。

- [ ] **Step 1: 写 ZIP 目录失败测试**

```ts
test("creates all five platform directories", async () => {
  const entries = await listZipEntries(await buildDistributionPackage(validArtwork, [pngFile]));
  assert.ok(entries.includes("2026-09-13_yalo-artwork/zcool/图片/"));
  assert.ok(entries.includes("2026-09-13_yalo-artwork/tuhua/图片/"));
  assert.ok(entries.includes("2026-09-13_yalo-artwork/behance/images/"));
  assert.ok(entries.includes("2026-09-13_yalo-artwork/artstation/images/"));
  assert.ok(entries.includes("2026-09-13_yalo-artwork/deviantart/images/"));
});
```

- [ ] **Step 2: 验证测试失败**

Run: `npm test -- tests/package.test.ts`

Expected: FAIL，原因是 `package` 模块不存在。

- [ ] **Step 3: 最小实现**

使用 JSZip 写入五个平台目录、按导入顺序编号的原图副本、五份文案和 `README.txt`；保留原扩展名。

- [ ] **Step 4: 加入异常测试**

```ts
test("rejects unsupported image types", () => {
  assert.throws(() => validateImageFiles([new File(["x"], "note.gif", { type: "image/gif" })]));
});
```

- [ ] **Step 5: 实现校验并验证**

Run: `npm test`

Expected: PASS；覆盖文件顺序、五目录、错误类型、超过 20 张和超过 200 MB。

- [ ] **Step 6: Commit**

```bash
git add src/lib/package.ts tests/package.test.ts
git commit -m "feat: build five-platform package"
```

### Task 4: 可访问的中文分发工作台

**Files:**
- Create: `src/App.tsx`, `tests/app.test.tsx`
- Modify: `src/main.tsx`, `src/styles.css`

**Consumes:** `validateArtwork`、`validateImageFiles`、`buildDistributionPackage`.

**Produces:** 作品表单、拖入区、图片列表、错误状态、进度状态和 ZIP 下载按钮。

- [ ] **Step 1: 写页面失败测试**

```tsx
test("renders artwork title and image upload controls", () => {
  const html = renderToStaticMarkup(<App />);
  assert.match(html, /作品中文标题/);
  assert.match(html, /选择图片/);
});
```

- [ ] **Step 2: 验证测试失败**

Run: `npm test -- tests/app.test.tsx`

Expected: FAIL，原因是 `App` 组件不存在。

- [ ] **Step 3: 最小实现**

首屏放入中文标题、简介、日期、标签、可选英文内容、隐私提示、拖入区和“生成分发包”；点击后仅触发本地浏览器下载。

- [ ] **Step 4: 完成状态和响应式体验**

添加文件删除、数量与总大小错误、`aria-live` 进度、键盘可用“选择图片”按钮、移动端单列与桌面端双列布局。

- [ ] **Step 5: 验证**

Run: `npm test && npm run build`

Expected: 所有测试通过，静态构建成功。

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/main.tsx src/styles.css tests/app.test.tsx
git commit -m "feat: add distribution workspace"
```

### Task 5: 发布前验证与 GitHub 推送

**Files:**
- Create: `README.md`
- Verify: `.github/workflows/deploy-pages.yml`

**Produces:** 监护人使用说明、GitHub 仓库和 Pages 部署链接。

- [ ] **Step 1: 编写 README**

解释导入、下载、五个平台目录、儿童隐私与版权检查；明确工具不会自动上传。

- [ ] **Step 2: 自动验证**

Run: `npm test && npm run build && git check-ignore sample.png output.zip`

Expected: 全部通过；示例图片和 ZIP 均被忽略。

- [ ] **Step 3: 浏览器验收**

使用一张 PNG 和一张 JPG 验证导入、删除、必填错误、ZIP 下载、五个平台目录和移动端布局。

- [ ] **Step 4: 初始化并提交 Git 仓库**

```bash
git init
git branch -M main
git add .
git commit -m "feat: create yalo artwork distributor"
```

- [ ] **Step 5: 推送用户指定仓库**

```bash
git remote add origin <USER_PROVIDED_GITHUB_REPOSITORY_URL>
git push -u origin main
```

- [ ] **Step 6: 部署验证**

确认 GitHub Pages 工作流成功，再在已部署页面实际生成一次 ZIP；只有成功后交付链接。
