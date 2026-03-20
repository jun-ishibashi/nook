"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./image-upload";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/build/image-gallery.css";
import { CATEGORIES } from "@/lib/categories";
import CategoryIcon from "./category-icon";
import { STYLE_TAGS } from "@/lib/style-tags";
import { HOUSING_TYPES, LAYOUT_TYPES } from "@/lib/room-context";

const MODAL_ID = "post_modal";
const STEPS = ["写真", "家具・雑貨", "確認"];
const DRAFT_STORAGE_KEY = "nook-create-post-draft-v1";

function PostModalDesc({ children }: { children: React.ReactNode }) {
  return (
    <p id="post-modal-desc" className="mb-4 max-w-md text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  );
}

type FurnitureEntry = { name: string; productUrl: string; note: string; price: number | null; mediaIndex: number };

type DraftPayload = {
  v: 1;
  step: number;
  title: string;
  description: string;
  category: string;
  furniture: FurnitureEntry[];
  selectedStyleTags: string[];
  housingType: string;
  layoutType: string;
  roomContextNote: string;
};

function parseDraft(raw: unknown): DraftPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== 1) return null;
  const furniture: FurnitureEntry[] = [];
  if (Array.isArray(o.furniture)) {
    for (const row of o.furniture) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      if (typeof r.name !== "string" || typeof r.productUrl !== "string") continue;
      furniture.push({
        name: r.name,
        productUrl: r.productUrl,
        note: typeof r.note === "string" ? r.note : "",
        price: typeof r.price === "number" && Number.isFinite(r.price) ? Math.max(0, Math.floor(r.price)) : null,
        mediaIndex: typeof r.mediaIndex === "number" && Number.isFinite(r.mediaIndex) ? Math.max(0, Math.floor(r.mediaIndex)) : 0,
      });
    }
  }
  const tags = Array.isArray(o.selectedStyleTags)
    ? o.selectedStyleTags.filter((x): x is string => typeof x === "string")
    : [];
  return {
    v: 1,
    step: typeof o.step === "number" && o.step >= 0 && o.step <= 2 ? o.step : 0,
    title: typeof o.title === "string" ? o.title : "",
    description: typeof o.description === "string" ? o.description : "",
    category: typeof o.category === "string" ? o.category : "other",
    furniture,
    selectedStyleTags: tags.slice(0, 8),
    housingType: typeof o.housingType === "string" ? o.housingType : "",
    layoutType: typeof o.layoutType === "string" ? o.layoutType : "",
    roomContextNote: typeof o.roomContextNote === "string" ? o.roomContextNote : "",
  };
}

export default function CreatePost() {
  const router = useRouter();
  const skipNextSave = useRef(false);
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [files, setFiles] = useState<File[]>([]);
  const [furniture, setFurniture] = useState<FurnitureEntry[]>([]);
  const [furnitureName, setFurnitureName] = useState("");
  const [furnitureUrl, setFurnitureUrl] = useState("");
  const [furnitureNote, setFurnitureNote] = useState("");
  const [furniturePrice, setFurniturePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStyleTags, setSelectedStyleTags] = useState<string[]>([]);
  const [housingType, setHousingType] = useState("");
  const [layoutType, setLayoutType] = useState("");
  const [roomContextNote, setRoomContextNote] = useState("");
  const [draftOffer, setDraftOffer] = useState<DraftPayload | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const d = parseDraft(JSON.parse(raw));
      if (!d) return;
      const meaningful =
        d.title.trim() ||
        d.description.trim() ||
        d.roomContextNote.trim() ||
        d.furniture.length > 0 ||
        d.selectedStyleTags.length > 0 ||
        d.housingType ||
        d.layoutType ||
        d.category !== "other" ||
        d.step > 0;
      if (!meaningful) return;
      queueMicrotask(() => setDraftOffer(d));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const t = setTimeout(() => {
      try {
        const hasContent =
          title.trim() ||
          description.trim() ||
          furniture.length > 0 ||
          selectedStyleTags.length > 0 ||
          housingType ||
          layoutType ||
          roomContextNote.trim() ||
          category !== "other";
        if (!hasContent && step === 0) return;
        const payload: DraftPayload = {
          v: 1,
          step,
          title,
          description,
          category,
          furniture,
          selectedStyleTags,
          housingType,
          layoutType,
          roomContextNote,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        /* quota / private mode */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [title, description, category, furniture, selectedStyleTags, housingType, layoutType, roomContextNote, step]);

  function applyDraft() {
    if (!draftOffer) return;
    const d = draftOffer;
    skipNextSave.current = true;
    setStep(d.step);
    setTitle(d.title);
    setDescription(d.description);
    setCategory(d.category);
    setFurniture(d.furniture);
    setSelectedStyleTags(d.selectedStyleTags);
    setHousingType(d.housingType);
    setLayoutType(d.layoutType);
    setRoomContextNote(d.roomContextNote);
    setDraftOffer(null);
    setError("");
  }

  function discardDraft() {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setDraftOffer(null);
  }

  function toggleStyleTag(slug: string) {
    setSelectedStyleTags((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 8) return prev;
      return [...prev, slug];
    });
  }

  function addFurniture() {
    const name = furnitureName.trim();
    const url = furnitureUrl.trim();
    if (!name || !url) { setError("名前と商品ページのURLを入力してください。"); return; }
    if (!url.startsWith("http")) { setError("リンクは https:// から入力してください。"); return; }
    setError("");
    setFurniture((prev) => [
      ...prev,
      {
        name,
        productUrl: url,
        note: furnitureNote.trim().slice(0, 500),
        price: furniturePrice.trim() ? parseInt(furniturePrice.trim(), 10) : null,
        mediaIndex: 0,
      },
    ]);
    setFurnitureName("");
    setFurnitureUrl("");
    setFurnitureNote("");
    setFurniturePrice("");
  }

  function removeFurniture(i: number) {
    setFurniture((prev) => prev.filter((_, idx) => idx !== i));
  }
  function setFurnitureMediaIndex(i: number, mediaIndex: number) {
    setFurniture((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, mediaIndex } : f))
    );
  }
  function removeFile(index: number) { setFiles((prev) => prev.filter((_, i) => i !== index)); }

  function closeModal() {
    const checkbox = document.getElementById(MODAL_ID) as HTMLInputElement | null;
    if (checkbox) checkbox.checked = false;
  }

  async function submit() {
    if (!title.trim() || files.length === 0) { setError("タイトルと写真を入力してください。"); return; }
    setLoading(true); setError("");
    const formData = new FormData();
    formData.set("title", title.trim()); formData.set("description", description.trim()); formData.set("category", category);
    files.forEach((f) => formData.append("images", f));
    formData.set(
      "furniture",
      JSON.stringify(
        furniture.map((f) => ({
          name: f.name,
          productUrl: f.productUrl,
          note: f.note,
          price: f.price,
          mediaIndex: Math.min(
            Math.max(0, f.mediaIndex),
            Math.max(0, files.length - 1)
          ),
        }))
      )
    );
    formData.set("styleTags", JSON.stringify(selectedStyleTags));
    formData.set("housingType", housingType);
    formData.set("layoutType", layoutType);
    formData.set("roomContextNote", roomContextNote.trim().slice(0, 120));
    const res = await fetch("/api/posts", { method: "POST", body: formData });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "載せられませんでした。もう一度お試しください。");
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setStep(0);
    setTitle("");
    setDescription("");
    setCategory("other");
    setFiles([]);
    setFurniture([]);
    setFurnitureNote("");
    setSelectedStyleTags([]);
    setHousingType("");
    setLayoutType("");
    setRoomContextNote("");
    closeModal();
    if (typeof data.id === "string" && data.id) {
      router.push(`/post/${data.id}?new=1`);
    }
    router.refresh();
  }

  const galleryItems = files.map((f) => ({ original: URL.createObjectURL(f), thumbnail: URL.createObjectURL(f) }));

  const stepBar = (
    <nav className="create-post-stepper mb-5 border-b pb-3.5" style={{ borderColor: "var(--hairline)" }} aria-label="載せる手順">
      <ol className="flex list-none items-stretch gap-0 p-0">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          const pending = i > step;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center">
              {i > 0 ? (
                <span
                  className="mx-1 h-px min-w-[4px] flex-1 sm:mx-1.5"
                  style={{ background: done || active ? "var(--text-faint)" : "var(--hairline)" }}
                  aria-hidden
                />
              ) : null}
              <div
                className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:justify-start ${pending ? "opacity-[0.4]" : ""}`}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold tabular-nums"
                  style={
                    done
                      ? { background: "var(--bg-sunken)", color: "var(--text-secondary)", border: "1px solid var(--hairline)" }
                      : active
                        ? { background: "var(--text)", color: "var(--text-inverse)", border: "1px solid var(--text)" }
                        : { border: "1px solid var(--hairline)", color: "var(--text-muted)", background: "transparent" }
                  }
                  aria-current={active ? "step" : undefined}
                >
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className="hidden truncate text-[10px] font-medium sm:inline"
                  style={{ color: done || active ? "var(--text)" : "var(--text-muted)" }}
                >
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  const draftBanner =
    draftOffer && step === 0 ? (
      <div
        className="mb-4 flex flex-col gap-2.5 rounded-[var(--radius-card)] border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--bg-sunken) 65%, var(--bg-raised))" }}
        role="status"
      >
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          下書きがあります（端末のみ）。
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={applyDraft} className="btn-primary text-xs">
            復元する
          </button>
          <button type="button" onClick={discardDraft} className="btn-secondary text-xs">
            捨てる
          </button>
        </div>
      </div>
    ) : null;

  if (step === 2) {
    return (
      <div className="create-post-flow animate-fade-in">
        {stepBar}
        <p className="nook-section-label mb-1">確認</p>
        <h2 id="modal-title" className="mb-1 text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>
          送信前の確認
        </h2>
        <PostModalDesc>問題なければ載せてください。</PostModalDesc>
        <div
          className="min-h-[168px] overflow-hidden rounded-[var(--radius-card)] border"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-sunken)" }}
        >
          <ImageGallery items={galleryItems} showThumbnails={false} />
        </div>
        <div
          className="mt-4 rounded-[var(--radius-card)] border p-4"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-raised)" }}
        >
          {category !== "other" && (
            <span className="badge mb-2">
              <CategoryIcon value={category} size={10} />
              {CATEGORIES.find((c) => c.value === category)?.label}
            </span>
          )}
          {(housingType || layoutType || roomContextNote.trim()) && (
            <p className="mb-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
              {[
                housingType ? HOUSING_TYPES.find((h) => h.value === housingType)?.label : null,
                layoutType ? LAYOUT_TYPES.find((l) => l.value === layoutType)?.label : null,
                roomContextNote.trim() || null,
              ]
                .filter(Boolean)
                .join("・")}
            </p>
          )}
          <p className="font-semibold" style={{ color: "var(--text)" }}>
            {title}
          </p>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          ) : null}
        </div>
        {furniture.length > 0 && (
          <div className="mt-4">
            <p className="nook-overline nook-overline--sentence mb-2">家具・雑貨（{furniture.length}）</p>
            <ul className="space-y-2" role="list">
              {furniture.map((f, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-0.5 rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm"
                  style={{ borderColor: "var(--hairline)", background: "var(--bg-sunken)" }}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-medium" style={{ color: "var(--text)" }}>
                      {f.name}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {f.productUrl}
                    </span>
                    {f.price !== null && (
                      <span className="text-[11px] font-bold" style={{ color: "var(--text-secondary)" }}>
                        ¥{f.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {f.note ? (
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {f.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
        {error ? <p className="nook-form-error mt-3" role="alert">{error}</p> : null}
        <div className="mt-6 flex justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--hairline)" }}>
          <button type="button" onClick={() => setStep(1)} className="btn-secondary text-xs">
            戻る
          </button>
          <button type="button" onClick={submit} disabled={loading} className="btn-primary text-xs disabled:opacity-50" aria-busy={loading}>
            {loading ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: "var(--text-inverse)", borderTopColor: "transparent" }}
                />
                送信中…
              </>
            ) : (
              "載せる"
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="create-post-flow animate-fade-in">
        {stepBar}
        <p className="nook-section-label mb-1">家具・雑貨</p>
        <h2 id="modal-title" className="mb-1 text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>
          家具・雑貨のリンク（任意）
        </h2>
        <PostModalDesc>商品ページのURLがあると、みんながショップまでたどれます。なくても進められます。あとから編集で足せます。</PostModalDesc>
        <div className="space-y-3">
          <div
            className="rounded-[var(--radius-card)] border p-4"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-sunken)" }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <input
                  type="text"
                  value={furnitureName}
                  onChange={(e) => setFurnitureName(e.target.value)}
                  placeholder="例: デスクライト"
                  className="input-base flex-1 text-xs"
                  aria-label="家具・雑貨の名前"
                  onKeyDown={(e) => e.key === "Enter" && addFurniture()}
                />
                <input
                  type="url"
                  value={furnitureUrl}
                  onChange={(e) => setFurnitureUrl(e.target.value)}
                  placeholder="https://…"
                  className="input-base flex-1 text-xs"
                  aria-label="商品ページのURL"
                  onKeyDown={(e) => e.key === "Enter" && addFurniture()}
                />
                <button type="button" onClick={addFurniture} className="btn-secondary shrink-0 text-xs sm:self-start">
                  追加
                </button>
              </div>
              {furnitureUrl.trim() && /^http:\/\//i.test(furnitureUrl.trim()) ? (
                <p className="text-[10px] leading-snug" style={{ color: "var(--text-faint)" }}>
                  可能なら https:// から入れてください。
                </p>
              ) : null}
              <input
                type="text"
                value={furnitureNote}
                onChange={(e) => setFurnitureNote(e.target.value)}
                placeholder="メモ（色・サイズなど／任意）"
                className="input-base text-xs"
                maxLength={500}
                aria-label="メモ"
              />
              <input
                type="number"
                value={furniturePrice}
                onChange={(e) => setFurniturePrice(e.target.value)}
                placeholder="価格（概算・任意）"
                className="input-base text-xs"
                aria-label="価格"
                onKeyDown={(e) => e.key === "Enter" && addFurniture()}
              />
            </div>
          </div>
          {error ? <p className="nook-form-error mt-0 text-xs" role="alert">{error}</p> : null}
          {furniture.length > 0 && (
            <ul className="space-y-2" role="list">
              {furniture.map((f, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-2 rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm"
                  style={{ borderColor: "var(--hairline)", background: "var(--bg-raised)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium" style={{ color: "var(--text)" }}>
                        {f.name}
                      </p>
                      <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {f.productUrl}
                      </p>
                      {f.note ? (
                        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {f.note}
                        </p>
                      ) : null}
                      {f.price !== null && (
                        <p className="mt-1 text-[11px] font-bold" style={{ color: "var(--text)" }}>
                          ¥{f.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFurniture(i)}
                      className="shrink-0 rounded-full p-1.5 transition hover:opacity-90"
                      style={{ color: "var(--text-muted)" }}
                      aria-label={`${f.name} を削除`}
                    >
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  {files.length > 1 && (
                    <label className="flex flex-wrap items-center gap-2 text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                      写っている写真
                      <select
                        value={f.mediaIndex}
                        onChange={(e) => setFurnitureMediaIndex(i, Number(e.target.value))}
                        className="input-base max-w-[8rem] text-[10px]"
                        aria-label={`${f.name} が写っている写真`}
                      >
                        {files.map((_, fi) => (
                          <option key={fi} value={fi}>
                            写真 {fi + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </li>
              ))}
            </ul>
          )}
          {furniture.length === 0 ? (
            <div className="space-y-2 rounded-[var(--radius-sm)] border border-dashed px-3 py-6 text-center" style={{ borderColor: "var(--hairline)" }}>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                スキップして次へ
              </p>
              <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
                リンクを足すと、気になった人が商品ページまでたどれます。
              </p>
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--hairline)" }}>
          <button type="button" onClick={() => setStep(0)} className="btn-secondary text-xs">
            戻る
          </button>
          <button type="button" onClick={() => setStep(2)} className="btn-primary text-xs">
            次へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-flow animate-fade-in">
      {draftBanner}
      {stepBar}
      <p className="nook-section-label mb-1">載せる</p>
      <h2 id="modal-title" className="mb-1 text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>
        写真を載せる
      </h2>
      <PostModalDesc>写真とタイトルがあれば大丈夫です。</PostModalDesc>
      <div className="space-y-5">
        <div>
          <span className="nook-overline nook-overline--sentence mb-1.5 block">写真（必須）</span>
          <ImageUpload files={files} onFiles={setFiles} onRemove={removeFile} />
        </div>
        <div className="nook-hairline-top pt-1">
          <label htmlFor="post-title" className="nook-overline nook-overline--sentence mb-1.5 block">
            タイトル（必須）
          </label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: リビングの窓際・夜の灯り"
            className="nook-input-line text-sm"
            autoComplete="off"
            maxLength={100}
          />
          <p className="mt-1 text-right text-[10px]" style={{ color: "var(--text-muted)" }}>
            {title.length}/100
          </p>
        </div>
        <div>
          <label htmlFor="post-desc" className="nook-overline nook-overline--sentence mb-1.5 block">
            キャプション<span style={{ color: "var(--text-faint)" }}>（任意）</span>
          </label>
          <textarea
            id="post-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="こだわり・賃貸の条件など、短くて大丈夫です"
            className="textarea-base text-sm"
            rows={3}
            maxLength={500}
          />
        </div>
        <div>
          <span className="nook-overline nook-overline--sentence mb-1.5 block">カテゴリ</span>
          <div className="-mx-1 flex gap-0 overflow-x-auto px-1 pb-0.5 scrollbar-hide" role="tablist" aria-label="カテゴリ">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                role="tab"
                aria-selected={category === cat.value}
                onClick={() => setCategory(cat.value)}
                className="filter-chip flex shrink-0 items-center gap-1 text-[11px]"
              >
                <CategoryIcon value={cat.value} size={11} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="nook-overline nook-overline--sentence mb-1.5 block">
            スタイル<span style={{ color: "var(--text-faint)" }}>（任意・最大8）</span>
          </span>
          <p id="create-style-hint" className="sr-only">
            タップで複数選べます。同じタグをもう一度押すと外れます。
          </p>
          <div
            className="-mx-1 flex gap-0 overflow-x-auto px-1 pb-0.5 scrollbar-hide"
            role="group"
            aria-label="スタイル"
            aria-describedby="create-style-hint"
          >
            {STYLE_TAGS.map((t) => {
              const on = selectedStyleTags.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleStyleTag(t.slug)}
                  className="filter-chip shrink-0 text-[11px]"
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        <div
          className="rounded-[var(--radius-card)] border p-4"
          style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--bg-sunken) 40%, var(--bg-raised))" }}
        >
          <p className="nook-overline nook-overline--sentence mb-2">部屋の文脈（任意）</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
              住まい
              <select
                value={housingType}
                onChange={(e) => setHousingType(e.target.value)}
                className="input-base text-xs"
                aria-label="住まいの種類"
              >
                {HOUSING_TYPES.map((h) => (
                  <option key={h.value || "unset"} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
              間取りの目安
              <select
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value)}
                className="input-base text-xs"
                aria-label="間取り"
              >
                {LAYOUT_TYPES.map((l) => (
                  <option key={l.value || "unset-layout"} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label htmlFor="room-context-note" className="mt-3 block text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
            ひとこと（角部屋・築年など）
          </label>
          <input
            id="room-context-note"
            type="text"
            value={roomContextNote}
            onChange={(e) => setRoomContextNote(e.target.value.slice(0, 120))}
            placeholder="例: 角部屋・築15年"
            className="input-base mt-1 text-xs"
            maxLength={120}
            autoComplete="off"
          />
        </div>
      </div>
      {error ? <p className="nook-form-error mt-4" role="alert">{error}</p> : null}
      <div className="mt-6 flex justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--hairline)" }}>
        <label htmlFor={MODAL_ID} className="btn-secondary cursor-pointer text-xs">
          閉じる
        </label>
        <button
          type="button"
          onClick={() => {
            if (!title.trim()) {
              setError("タイトルを入力してください。");
              return;
            }
            if (files.length === 0) {
              setError("写真を1枚以上選んでください。");
              return;
            }
            setError("");
            setStep(1);
          }}
          className="btn-primary text-xs"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
