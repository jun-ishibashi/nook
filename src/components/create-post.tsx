"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./image-upload";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/build/image-gallery.css";
import { CATEGORIES } from "@/lib/categories";
import CategoryIcon from "./category-icon";

const MODAL_ID = "post_modal";
const STEPS = ["写真・タイトル", "アイテム", "確認"];

type FurnitureEntry = { name: string; productUrl: string };

export default function CreatePost() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [files, setFiles] = useState<File[]>([]);
  const [furniture, setFurniture] = useState<FurnitureEntry[]>([]);
  const [furnitureName, setFurnitureName] = useState("");
  const [furnitureUrl, setFurnitureUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addFurniture() {
    const name = furnitureName.trim();
    const url = furnitureUrl.trim();
    if (!name || !url) { setError("名前とURLを入力してください。"); return; }
    if (!url.startsWith("http")) { setError("URLは https:// で始めてください。"); return; }
    setError("");
    setFurniture((prev) => [...prev, { name, productUrl: url }]);
    setFurnitureName(""); setFurnitureUrl("");
  }

  function removeFurniture(i: number) { setFurniture((prev) => prev.filter((_, idx) => idx !== i)); }
  function removeFile(index: number) { setFiles((prev) => prev.filter((_, i) => i !== index)); }

  function closeModal() {
    const checkbox = document.getElementById(MODAL_ID) as HTMLInputElement | null;
    if (checkbox) checkbox.checked = false;
  }

  async function submit() {
    if (!title.trim() || files.length === 0) { setError("タイトルと写真を追加してください。"); return; }
    setLoading(true); setError("");
    const formData = new FormData();
    formData.set("title", title.trim()); formData.set("description", description.trim()); formData.set("category", category);
    files.forEach((f) => formData.append("images", f));
    formData.set("furniture", JSON.stringify(furniture));
    const res = await fetch("/api/posts", { method: "POST", body: formData });
    setLoading(false);
    if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error ?? "投稿に失敗しました"); return; }
    setStep(0); setTitle(""); setDescription(""); setCategory("other"); setFiles([]); setFurniture([]);
    closeModal(); router.refresh();
  }

  const galleryItems = files.map((f) => ({ original: URL.createObjectURL(f), thumbnail: URL.createObjectURL(f) }));

  const stepBar = (
    <div className="mb-6 flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          {i > 0 && <div className="h-px w-6" style={{ background: i <= step ? "var(--text)" : "var(--border)" }} />}
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
            style={
              i < step
                ? { background: "var(--bg-inverse)", color: "var(--text-inverse)" }
                : i === step
                ? { border: "2px solid var(--text)", color: "var(--text)" }
                : { border: "1px solid var(--border)", color: "var(--text-muted)" }
            }
          >
            {i < step ? (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : i + 1}
          </span>
          <span className="hidden text-xs font-medium sm:inline" style={{ color: i <= step ? "var(--text)" : "var(--text-muted)" }}>{s}</span>
        </div>
      ))}
    </div>
  );

  if (step === 2) {
    return (
      <div>
        {stepBar}
        <h2 id="modal-title" className="mb-4 text-base font-bold" style={{ color: "var(--text)" }}>確認</h2>
        <div className="min-h-[180px] overflow-hidden rounded-2xl" style={{ background: "var(--bg-sunken)" }}><ImageGallery items={galleryItems} showThumbnails={false} /></div>
        <div className="mt-4 rounded-2xl p-4" style={{ background: "var(--bg-sunken)" }}>
          {category !== "other" && <span className="badge mb-2"><CategoryIcon value={category} size={10} />{CATEGORIES.find((c) => c.value === category)?.label}</span>}
          <p className="font-bold" style={{ color: "var(--text)" }}>{title}</p>
          {description && <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{description}</p>}
        </div>
        {furniture.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>アイテム（{furniture.length}）</p>
            <ul className="space-y-1.5" role="list">
              {furniture.map((f, i) => (
                <li key={i} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm" style={{ background: "var(--bg-sunken)" }}>
                  <span className="font-medium" style={{ color: "var(--text)" }}>{f.name}</span>
                  <span className="ml-auto truncate text-[11px] max-w-[180px]" style={{ color: "var(--text-muted)" }}>{f.productUrl}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-6 flex justify-between gap-3">
          <button type="button" onClick={() => setStep(1)} className="btn-secondary text-xs">戻る</button>
          <button type="button" onClick={submit} disabled={loading} className="btn-primary text-xs disabled:opacity-50" aria-busy={loading}>
            {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--text-inverse)", borderTopColor: "transparent" }} />投稿中...</> : "投稿する"}
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div>
        {stepBar}
        <h2 id="modal-title" className="mb-1 text-base font-bold" style={{ color: "var(--text)" }}>アイテムを紐付け</h2>
        <p className="mb-4 text-xs" style={{ color: "var(--text-muted)" }}>家具や雑貨の名前と購入リンクを追加（任意）</p>
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-sunken)" }}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input type="text" value={furnitureName} onChange={(e) => setFurnitureName(e.target.value)} placeholder="アイテム名" className="input-base flex-1 text-xs" aria-label="アイテム名" onKeyDown={(e) => e.key === "Enter" && addFurniture()} />
              <input type="url" value={furnitureUrl} onChange={(e) => setFurnitureUrl(e.target.value)} placeholder="https://..." className="input-base flex-1 text-xs" aria-label="購入URL" onKeyDown={(e) => e.key === "Enter" && addFurniture()} />
              <button type="button" onClick={addFurniture} className="btn-secondary shrink-0 text-xs">追加</button>
            </div>
          </div>
          {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
          {furniture.length > 0 && (
            <ul className="space-y-1.5" role="list">
              {furniture.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm" style={{ background: "var(--bg-sunken)" }}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate" style={{ color: "var(--text)" }}>{f.name}</p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{f.productUrl}</p>
                  </div>
                  <button type="button" onClick={() => removeFurniture(i)} className="shrink-0 rounded-full p-1.5 transition hover:bg-red-50 hover:text-red-500" style={{ color: "var(--text-muted)" }} aria-label={`${f.name} を削除`}>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {furniture.length === 0 && <p className="py-4 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>スキップも可能です</p>}
        </div>
        <div className="mt-6 flex justify-between gap-3">
          <button type="button" onClick={() => setStep(0)} className="btn-secondary text-xs">戻る</button>
          <button type="button" onClick={() => setStep(2)} className="btn-primary text-xs">次へ</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {stepBar}
      <h2 id="modal-title" className="mb-4 text-base font-bold" style={{ color: "var(--text)" }}>新規投稿</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="post-title" className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>タイトル *</label>
          <input id="post-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: リビングの窓際コーナー" className="input-base text-sm" autoComplete="off" maxLength={100} />
          <p className="mt-1 text-right text-[10px]" style={{ color: "var(--text-muted)" }}>{title.length}/100</p>
        </div>
        <div>
          <label htmlFor="post-desc" className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            説明文 <span className="font-normal" style={{ color: "var(--text-muted)" }}>（任意）</span>
          </label>
          <textarea id="post-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="こだわりポイントなど..." className="textarea-base text-sm" rows={3} maxLength={500} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>カテゴリ</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition"
                style={category === cat.value
                  ? { background: "var(--bg-inverse)", color: "var(--text-inverse)" }
                  : { background: "var(--bg-sunken)", color: "var(--text-muted)" }
                }
              >
                <CategoryIcon value={cat.value} size={11} />{cat.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold" style={{ color: "var(--text-secondary)" }}>写真 *</label>
          <ImageUpload files={files} onFiles={setFiles} onRemove={removeFile} />
        </div>
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600" role="alert">{error}</p>}
      <div className="mt-6 flex justify-between gap-3">
        <label htmlFor={MODAL_ID} className="btn-secondary cursor-pointer text-xs">キャンセル</label>
        <button type="button" onClick={() => { if (!title.trim()) { setError("タイトルを入力してください。"); return; } if (files.length === 0) { setError("写真を追加してください。"); return; } setError(""); setStep(1); }} className="btn-primary text-xs">次へ</button>
      </div>
    </div>
  );
}
