import { useRef, useState } from "react";
import { buildDistributionPackage, validateImageFiles } from "./lib/package";
import { toSlug, validateArtwork, type ArtworkInput } from "./lib/metadata";

const emptyArtwork: ArtworkInput = { titleZh: "", descriptionZh: "", date: new Date().toISOString().slice(0, 10), tagsZh: [] };

function parseTags(value: string) {
  return value.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean);
}

export default function App() {
  const [artwork, setArtwork] = useState(emptyArtwork);
  const [tagsText, setTagsText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: File[]) => {
    try {
      const next = [...files, ...incoming];
      validateImageFiles(next);
      setFiles(next);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "图片导入失败");
    }
  };

  const createPackage = async () => {
    const input = { ...artwork, tagsZh: parseTags(tagsText) };
    const validation = validateArtwork(input);
    if (validation.errors.length) {
      setError(validation.errors.join("；"));
      return;
    }
    try {
      validateImageFiles(files);
      setStatus("正在浏览器本地生成分发包…");
      setError("");
      const blob = await buildDistributionPackage(input, files);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${toSlug(input.titleZh, input.date)}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      setStatus("分发包已下载。发布前请人工检查隐私、版权和文案。");
    } catch (caught) {
      setStatus("");
      setError(caught instanceof Error ? caught.message : "分发包生成失败，请重试");
    }
  };

  return <main className="app-shell">
    <header className="topbar">
      <div><p className="eyebrow">YALO · ARTWORK DISTRIBUTOR</p><h1>作品一键分发</h1></div>
      <p className="privacy-badge">图片仅在本机浏览器处理</p>
    </header>
    <p className="intro">一次整理站酷、涂鸦王国、Behance、ArtStation、DeviantArt 的图片与发布文案。不会登录、上传或代发。</p>
    <div className="workspace">
      <section className="card form-card" aria-labelledby="details-heading">
        <h2 id="details-heading">作品信息</h2>
        <label>作品中文标题 <span aria-hidden="true">*</span><input value={artwork.titleZh} onChange={(event) => setArtwork({ ...artwork, titleZh: event.target.value })} placeholder="例如：月亮和小熊" /></label>
        <label>创作日期 <span aria-hidden="true">*</span><input type="date" value={artwork.date} onChange={(event) => setArtwork({ ...artwork, date: event.target.value })} /></label>
        <label>中文简介 <textarea value={artwork.descriptionZh} onChange={(event) => setArtwork({ ...artwork, descriptionZh: event.target.value })} placeholder="用一两句话记录这件作品的故事。" rows={4} /></label>
        <label>中文标签 <input value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="儿童插画，绘本，水彩" /></label>
        <details><summary>英文内容（可选）</summary><label>英文标题 <input value={artwork.titleEn ?? ""} onChange={(event) => setArtwork({ ...artwork, titleEn: event.target.value })} /></label><label>英文简介 <textarea value={artwork.descriptionEn ?? ""} onChange={(event) => setArtwork({ ...artwork, descriptionEn: event.target.value })} rows={3} /></label></details>
      </section>
      <section className="card upload-card" aria-labelledby="images-heading">
        <h2 id="images-heading">导入作品图片</h2>
        <p className="hint">支持 JPG、PNG、WebP；每次 1–20 张，总计不超过 200 MB。</p>
        <div className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(Array.from(event.dataTransfer.files)); }}>
          <p>把图片拖到这里</p><span>或</span><button type="button" onClick={() => fileInput.current?.click()}>选择图片</button>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => addFiles(Array.from(event.target.files ?? []))} />
        </div>
        {files.length > 0 && <ul className="file-list">{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{String(index + 1).padStart(2, "0")}. {file.name}</span><button type="button" onClick={() => setFiles(files.filter((_, fileIndex) => fileIndex !== index))} aria-label={`删除 ${file.name}`}>删除</button></li>)}</ul>}
        <div className="safety-note"><strong>儿童隐私提示：</strong>请勿在标题、简介或图片中公开真实姓名、学校、住址、联系方式或行程。</div>
        <button className="generate" type="button" onClick={createPackage}>生成五平台分发包</button>
        <p className="live-status" role="status" aria-live="polite">{status}</p>
        {error && <p className="error" role="alert">{error}</p>}
      </section>
    </div>
  </main>;
}
