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
import {
  FURNITURE_LINK_RELATIONS,
  getFurnitureLinkRelationLabel,
} from "@/lib/furniture-link-meta";
import { IMAGE_MOODS, getMoodFilter } from "@/lib/image-mood";

const MODAL_ID = "post_modal";
const STEPS = ["写真", "家具・雑貨", "確認"];
const DRAFT_STORAGE_KEY = "nook-create-post-draft-v1";

function PostModalDesc({ children }: { children: React.ReactNode }) {
  return (
    <p id="post-modal-desc" className="nook-fg-muted mb-4 max-w-md text-[12px] leading-relaxed">
      {children}
    </p>
  );
}

type FurnitureEntry = {
  name: string;
  productUrl: string;
  note: string;
  price: number | null;
  mediaIndex: number;
  linkRelation: string;
  linkVerifiedDate: string;
};

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
        linkRelation: typeof r.linkRelation === "string" ? r.linkRelation : "",
        linkVerifiedDate: typeof r.linkVerifiedDate === "string" ? r.linkVerifiedDate : "",
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
  const [furnitureLinkRelation, setFurnitureLinkRelation] = useState("");
  const [furnitureLinkVerifiedDate, setFurnitureLinkVerifiedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStyleTags, setSelectedStyleTags] = useState<string[]>([]);
  const [housingType, setHousingType] = useState("");
  const [layoutType, setLayoutType] = useState("");
  const [roomContextNote, setRoomContextNote] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
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
        linkRelation: furnitureLinkRelation,
        linkVerifiedDate: furnitureLinkVerifiedDate.trim(),
      },
    ]);
    setFurnitureName("");
    setFurnitureUrl("");
    setFurnitureNote("");
    setFurniturePrice("");
    setFurnitureLinkRelation("");
    setFurnitureLinkVerifiedDate("");
  }

  function removeFurniture(i: number) {
    setFurniture((prev) => prev.filter((_, idx) => idx !== i));
  }
  function setFurnitureMediaIndex(i: number, mediaIndex: number) {
    setFurniture((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, mediaIndex } : f))
    );
  }
  function updateFurnitureTrust(
    i: number,
    patch: Partial<Pick<FurnitureEntry, "linkRelation" | "linkVerifiedDate">>
  ) {
    setFurniture((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f))
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
          linkRelation: f.linkRelation || undefined,
          linkVerifiedDate: f.linkVerifiedDate.trim() || null,
        }))
      )
    );
    formData.set("styleTags", JSON.stringify(selectedStyleTags));
    formData.set("housingType", housingType);
    formData.set("layoutType", layoutType);
    formData.set("roomContextNote", roomContextNote.trim().slice(0, 120));
    formData.set("mood", selectedMood);
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
    setSelectedMood("");
    closeModal();
    if (typeof data.id === "string" && data.id) {
      router.push(`/post/${data.id}?new=1`);
    }
    router.refresh();
  }

  const galleryItems = files.map((f) => ({ original: URL.createObjectURL(f), thumbnail: URL.createObjectURL(f) }));

  const stepProgressPct = Math.round(((step + 1) / STEPS.length) * 100);

  const stepBar = (
    <nav className="create-post-stepper mb-4 border-b pb-3 nook-border-hairline sm:mb-5 sm:pb-3.5" aria-label="投稿の手順">
      <div
        className="mb-3"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stepProgressPct}
        aria-valuetext={`手順 ${step + 1} / ${STEPS.length}：${STEPS[step] ?? ""}`}
        aria-label="投稿の手順の進捗"
      >
        <div className="nook-create-post-progress">
          <div className="nook-create-post-progress-fill" style={{ width: `${stepProgressPct}%` }} />
        </div>
      </div>
      <ol className="flex list-none flex-wrap items-center justify-center gap-x-2 gap-y-1.5 p-0 sm:gap-x-2.5">
        {STEPS.flatMap((label, i) => {
          const done = step > i;
          const active = i === step;
          const pending = i > step;
          const connector =
            i > 0 ? (
              <li key={`step-conn-${i}`} className="flex list-none items-center" aria-hidden>
                <span
                  className={`block h-0.5 w-4 shrink-0 rounded-full sm:w-5 ${done || active ? "nook-create-step-connector--on" : "nook-create-step-connector"}`}
                />
              </li>
            ) : null;
          const stepItem = (
            <li
              key={label}
              className={`flex list-none items-center gap-1.5 ${pending ? "opacity-[0.4]" : ""}`}
              aria-label={`手順 ${i + 1}: ${label}`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold tabular-nums ${
                  done ? "nook-create-step-badge-done" : active ? "nook-create-step-badge-active" : "nook-create-step-badge-pending"
                }`}
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
                className={`max-w-[5.5rem] truncate text-[9px] font-medium leading-tight sm:max-w-none sm:text-[10px] ${done || active ? "nook-fg" : "nook-fg-muted"}`}
              >
                {label}
              </span>
            </li>
          );
          return connector ? [connector, stepItem] : [stepItem];
        })}
      </ol>
    </nav>
  );

  const draftBanner =
    draftOffer && step === 0 ? (
      <div
        className="nook-stat-tile mb-4 flex flex-col gap-2.5 rounded-[var(--radius-card)] border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
        role="status"
      >
        <p className="nook-fg-secondary text-[11px] leading-relaxed">
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
        <h2 id="modal-title" className="nook-fg mb-1 text-base font-semibold tracking-tight">
          送信前の確認
        </h2>
        <PostModalDesc>問題なければ載せてください。</PostModalDesc>
        <div className="min-h-[168px] overflow-hidden rounded-[var(--radius-card)] border nook-border-hairline nook-bg-sunken">
          <div style={{ filter: getMoodFilter(selectedMood) }}>
            <ImageGallery items={galleryItems} showThumbnails={false} />
          </div>
        </div>
        <div className="mt-4 rounded-[var(--radius-card)] border nook-border-hairline nook-bg-raised p-4">
          {category !== "other" && (
            <span className="badge mb-2">
              <CategoryIcon value={category} size={10} />
              {CATEGORIES.find((c) => c.value === category)?.label}
            </span>
          )}
          {(housingType || layoutType || roomContextNote.trim()) && (
            <p className="nook-fg-muted mb-2 text-[11px]">
              {[
                housingType ? HOUSING_TYPES.find((h) => h.value === housingType)?.label : null,
                layoutType ? LAYOUT_TYPES.find((l) => l.value === layoutType)?.label : null,
                roomContextNote.trim() || null,
              ]
                .filter(Boolean)
                .join("・")}
            </p>
          )}
          <p className="nook-fg font-semibold">
            {title}
          </p>
          {description ? (
            <p className="nook-fg-secondary mt-1 text-sm leading-relaxed">
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
                  className="flex flex-col gap-0.5 rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm nook-border-hairline nook-bg-sunken"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="nook-fg font-medium">
                      {f.name}
                    </span>
                    <span className="nook-fg-muted min-w-0 flex-1 truncate text-[11px]">
                      {f.productUrl}
                    </span>
                    {f.price !== null && (
                      <span className="nook-fg-secondary text-[11px] font-bold">
                        ¥{f.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {f.note ? (
                    <p className="nook-fg-secondary text-[11px] leading-relaxed">
                      {f.note}
                    </p>
                  ) : null}
                  {(f.linkRelation || f.linkVerifiedDate) && (
                    <p className="nook-fg-faint text-[10px] leading-relaxed">
                      {f.linkRelation ? getFurnitureLinkRelationLabel(f.linkRelation) : null}
                      {f.linkRelation && f.linkVerifiedDate ? "・" : null}
                      {f.linkVerifiedDate ? `リンク確認 ${f.linkVerifiedDate}` : null}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {error ? <p className="nook-form-error mt-3" role="alert">{error}</p> : null}
        <div className="mt-6 flex justify-between gap-3 border-t pt-4 nook-border-hairline">
          <button type="button" onClick={() => setStep(1)} className="btn-secondary text-xs">
            戻る
          </button>
          <button type="button" onClick={submit} disabled={loading} className="btn-primary text-xs disabled:opacity-50" aria-busy={loading}>
            {loading ? (
              <>
                <span className="nook-spinner-btn-inverse" aria-hidden />
                送信中…
              </>
            ) : (
              "写真を載せる"
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
        <h2 id="modal-title" className="nook-fg mb-1 text-base font-semibold tracking-tight">
          家具・雑貨のリンク（任意）
        </h2>
        <PostModalDesc>
          購入先のURLを添えると、見た人が家具・雑貨をあとから探しやすくなります。なくても進められます。あとから編集で足せます。
        </PostModalDesc>
        <div className="space-y-3">
          <div className="rounded-[var(--radius-card)] border p-4 nook-border-hairline nook-bg-sunken">
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
                <p className="nook-fg-faint text-[10px] leading-snug">
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
              <div className="mt-1 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:flex-wrap nook-border-hairline">
                <label className="nook-fg-muted flex min-w-0 flex-1 flex-col gap-0.5 text-[10px] font-semibold sm:max-w-[12rem]">
                  リンクについて
                  <span className="nook-fg-faint">（次に追加する行・任意）</span>
                  <select
                    value={furnitureLinkRelation}
                    onChange={(e) => setFurnitureLinkRelation(e.target.value)}
                    className="input-base text-[10px]"
                    aria-label="商品ページリンクの位置づけ"
                  >
                    {FURNITURE_LINK_RELATIONS.map((r) => (
                      <option key={r.value || "rel-unset"} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="nook-fg-muted flex min-w-0 flex-1 flex-col gap-0.5 text-[10px] font-semibold sm:max-w-[12rem]">
                  リンク確認日
                  <span className="nook-fg-faint">（任意）</span>
                  <input
                    type="date"
                    value={furnitureLinkVerifiedDate}
                    onChange={(e) => setFurnitureLinkVerifiedDate(e.target.value)}
                    className="input-base text-[10px]"
                    aria-label="リンクを確認した日"
                  />
                </label>
              </div>
            </div>
          </div>
          {error ? <p className="nook-form-error mt-0 text-xs" role="alert">{error}</p> : null}
          {furniture.length > 0 && (
            <ul className="space-y-2" role="list">
              {furniture.map((f, i) => (
                <li
                  key={i}
                  className="nook-furniture-row flex flex-col gap-2 rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="nook-fg truncate font-medium">
                        {f.name}
                      </p>
                      <p className="nook-fg-muted truncate text-[11px]">
                        {f.productUrl}
                      </p>
                      {f.note ? (
                        <p className="nook-fg-secondary mt-1 text-[11px] leading-relaxed">
                          {f.note}
                        </p>
                      ) : null}
                      {f.price !== null && (
                        <p className="nook-fg mt-1 text-[11px] font-bold">
                          ¥{f.price.toLocaleString()}
                        </p>
                      )}
                      {(f.linkRelation || f.linkVerifiedDate) && (
                        <p className="nook-fg-faint mt-1 text-[10px] leading-relaxed">
                          {f.linkRelation ? getFurnitureLinkRelationLabel(f.linkRelation) : null}
                          {f.linkRelation && f.linkVerifiedDate ? "・" : null}
                          {f.linkVerifiedDate ? `リンク確認 ${f.linkVerifiedDate}` : null}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFurniture(i)}
                      className="nook-fg-muted shrink-0 rounded-full p-1.5 transition hover:opacity-90"
                      aria-label={`${f.name} を削除`}
                    >
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  {files.length > 1 && (
                    <label className="nook-fg-muted flex flex-wrap items-center gap-2 text-[10px] font-semibold">
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <label className="nook-fg-muted flex min-w-0 flex-1 flex-col gap-0.5 text-[10px] font-semibold sm:max-w-[12rem]">
                      リンクについて<span className="nook-fg-faint">（任意）</span>
                      <select
                        value={f.linkRelation}
                        onChange={(e) => updateFurnitureTrust(i, { linkRelation: e.target.value })}
                        className="input-base text-[10px]"
                        aria-label={`${f.name} のリンクの位置づけ`}
                      >
                        {FURNITURE_LINK_RELATIONS.map((r) => (
                          <option key={`${i}-${r.value || "unset"}`} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="nook-fg-muted flex min-w-0 flex-1 flex-col gap-0.5 text-[10px] font-semibold sm:max-w-[12rem]">
                      リンク確認日<span className="nook-fg-faint">（任意）</span>
                      <input
                        type="date"
                        value={f.linkVerifiedDate}
                        onChange={(e) => updateFurnitureTrust(i, { linkVerifiedDate: e.target.value })}
                        className="input-base text-[10px]"
                        aria-label={`${f.name} のリンクを確認した日`}
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {furniture.length === 0 ? (
            <div className="space-y-2 rounded-[var(--radius-sm)] border border-dashed px-3 py-6 text-center nook-border-hairline">
              <p className="nook-fg-muted text-[11px]">
                スキップして次へ
              </p>
              <p className="nook-fg-faint text-[10px] leading-relaxed">
                購入先のリンクを足すと、あとから見返しやすくなります。
              </p>
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex justify-between gap-3 border-t pt-4 nook-border-hairline">
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
      <p className="nook-section-label mb-1">部屋を投稿</p>
      <h2 id="modal-title" className="nook-fg mb-1 text-base font-semibold tracking-tight">
        写真を載せる
      </h2>
      <PostModalDesc>
        タイトルと写真があれば十分です。家具のリンクやムードは、あとからでも足せます。
      </PostModalDesc>
      <div className="space-y-5">
        <div>
          <span className="nook-overline nook-overline--sentence mb-1.5 block">写真（必須）</span>
          <ImageUpload files={files} onFiles={setFiles} onRemove={removeFile} mood={selectedMood} />
          {files.length > 0 && (
            <div className="mt-4">
              <span className="nook-overline nook-overline--sentence mb-2 block">
                空気感（Mood）
                <span className="nook-fg-faint ml-1 opacity-70">
                  — 写真の質感を整える
                </span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setSelectedMood(m.value)}
                    className={`group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all active:scale-[0.97] ${
                      selectedMood === m.value ? "nook-mood-chip--selected" : "nook-mood-chip"
                    }`}
                    title={m.description}
                  >
                    <div className="nook-mood-swatch-frame h-10 w-14 overflow-hidden rounded-md">
                      <div className="nook-mood-swatch-checker h-full w-full" style={{ filter: m.filter }}>
                        <div className="flex h-full w-full items-center justify-center bg-black/5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="nook-fg-faint">
                            <path
                              d="M12 21a9 9 0 100-18 9 9 0 000 18z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M12 7v10M7 12h10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold tracking-wider ${selectedMood === m.value ? "nook-fg" : "nook-fg-muted"}`}
                    >
                      {m.label.toUpperCase()}
                    </span>
                    {selectedMood === m.value && (
                      <div className="nook-mood-check-badge nook-bg-raised nook-fg absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full shadow-sm">
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          <p className="nook-fg-muted mt-1 text-right text-[10px]">
            {title.length}/100
          </p>
        </div>
        <div>
          <label htmlFor="post-desc" className="nook-overline nook-overline--sentence mb-1.5 block">
            キャプション<span className="nook-fg-faint">（任意）</span>
          </label>
          <textarea
            id="post-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="こだわり・住まいの条件など、短くて大丈夫です"
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
            スタイル<span className="nook-fg-faint">（任意・最大8）</span>
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
        <div className="nook-room-context-panel rounded-[var(--radius-card)] border p-4">
          <p className="nook-overline nook-overline--sentence mb-2">部屋の文脈（任意）</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="nook-fg-muted flex flex-1 flex-col gap-1 text-[10px] font-semibold">
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
            <label className="nook-fg-muted flex flex-1 flex-col gap-1 text-[10px] font-semibold">
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
          <label htmlFor="room-context-note" className="nook-fg-muted mt-3 block text-[10px] font-semibold">
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
      <div className="mt-6 flex justify-between gap-3 border-t pt-4 nook-border-hairline">
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
