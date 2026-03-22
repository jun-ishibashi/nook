"use client";

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import ImageUpload from "./image-upload";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/build/image-gallery.css";
import { CATEGORIES } from "@/lib/categories";
import CategoryIcon from "./category-icon";
import {
  getStyleTagLabel,
  STYLE_TAG_PICKER_SLUG_SET,
  STYLE_TAGS_PICKER,
} from "@/lib/style-tags";
import { HOUSING_TYPES, LAYOUT_TYPES } from "@/lib/room-context";
import {
  COPY_FURNITURE_LINK_RELATION,
  COPY_FURNITURE_LINK_VERIFIED,
  COPY_FURNITURE_LINK_VERIFIED_EMPTY,
  COPY_FURNITURE_VERIFIED_AT_PREFIX,
  FURNITURE_LINK_RELATIONS,
  formatFurnitureLinkVerifiedInputJa,
  getFurnitureLinkRelationHint,
  getFurnitureLinkRelationLabel,
} from "@/lib/furniture-link-meta";
import { IMAGE_MOODS, getMoodFilter } from "@/lib/image-mood";
import BrandCombobox from "./brand-combobox";
import FurniturePhotoPinPicker from "./furniture-photo-pin-picker";
import NookDatePicker from "./nook-date-picker";
import NookSelect from "./nook-select";
import { parsePinCoordPair } from "@/lib/furniture-pin-coords";
import {
  renderNookGalleryLeftNav,
  renderNookGalleryRightNav,
} from "./nook-image-gallery-controls";
import { notifyPostModalProgrammaticClose } from "@/lib/nook-modal";
import {
  requestScrollElementIntoViewNearest,
  scrollElementIntoViewNearest,
} from "@/lib/motion-prefs";

/** 1枚目の差し替え時にプレビューを再マウントし、blob URL と Strict Mode を安全に揃える */
function firstPhotoPreviewKey(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

const MODAL_ID = "post_modal";
const STEPS = ["写真", "家具・雑貨", "確認"];
const DRAFT_STORAGE_KEY = "nook-create-post-draft-v1";

/** 1枚目の大プレビュー。blob は親の Map（confirmPreviewUrlByFileRef）と ImageUpload と共有し、二重 URL / 早すぎる revoke を避ける */
function MoodLargePreview({ src, mood }: { src: string; mood: string }) {
  return (
    <figure className="mb-3 overflow-hidden rounded-[var(--radius-card)] border nook-border-hairline nook-bg-sunken shadow-[var(--home-tile-shadow)]">
      <div
        className="flex min-h-[min(28dvh,200px)] max-h-[min(52dvh,380px)] w-full min-w-0 items-center justify-center bg-black/20 px-1 py-2 sm:py-3"
        aria-live="polite"
      >
        <img
          src={src}
          alt="選択中の空気感のプレビュー（1枚目の写真）"
          className="max-h-full max-w-full w-auto object-contain transition-[filter] duration-300 ease-out"
          style={{ filter: getMoodFilter(mood) }}
        />
      </div>
      <figcaption className="nook-fg-muted border-t nook-border-hairline px-3 py-2 text-[10px] leading-relaxed">
        1枚目の見え方の例です。
      </figcaption>
    </figure>
  );
}

function PostModalDesc({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Description
      id="post-modal-desc"
      className="nook-fg-muted mb-4 max-w-md text-[12px] leading-relaxed"
    >
      {children}
    </Dialog.Description>
  );
}

type FurnitureEntry = {
  brand: string;
  brandSlug: string;
  name: string;
  productUrl: string;
  note: string;
  price: number | null;
  mediaIndex: number;
  pinX: number | null;
  pinY: number | null;
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
      const pins = parsePinCoordPair(r.pinX, r.pinY);
      furniture.push({
        brand: typeof r.brand === "string" ? r.brand : "",
        brandSlug: typeof r.brandSlug === "string" ? r.brandSlug : "",
        name: r.name,
        productUrl: r.productUrl,
        note: typeof r.note === "string" ? r.note : "",
        price: typeof r.price === "number" && Number.isFinite(r.price) ? Math.max(0, Math.floor(r.price)) : null,
        mediaIndex: typeof r.mediaIndex === "number" && Number.isFinite(r.mediaIndex) ? Math.max(0, Math.floor(r.mediaIndex)) : 0,
        pinX: pins.pinX,
        pinY: pins.pinY,
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
  const [furnitureBrand, setFurnitureBrand] = useState("");
  const [furnitureBrandSlug, setFurnitureBrandSlug] = useState("");
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
  /** 下書き復元直後：写真は localStorage に載せられないため再選択を促す */
  const [photoRedoAfterDraft, setPhotoRedoAfterDraft] = useState(false);
  const furnitureUrlInputRef = useRef<HTMLInputElement>(null);
  const furnitureAddAnchorRef = useRef<HTMLDivElement>(null);
  const errorBannerRef = useRef<HTMLParagraphElement | null>(null);
  /** 確認ステップのギャラリー用 blob URL。`files` の配列が毎回新しくなっても同じ File なら URL を使い回し、revoke による画像のリンク切れを防ぐ */
  const confirmPreviewUrlByFileRef = useRef<Map<File, string>>(new Map());

  const selectedMoodMeta = useMemo(
    () => IMAGE_MOODS.find((m) => m.value === selectedMood) ?? IMAGE_MOODS[0],
    [selectedMood]
  );

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

  const [confirmGalleryItems, setConfirmGalleryItems] = useState<
    { original: string; thumbnail: string }[]
  >([]);

  useLayoutEffect(() => {
    const map = confirmPreviewUrlByFileRef.current;
    const keep = new Set(files);
    for (const [file, url] of [...map.entries()]) {
      if (!keep.has(file)) {
        URL.revokeObjectURL(url);
        map.delete(file);
      }
    }
    setConfirmGalleryItems(
      files.map((f) => {
        let u = map.get(f);
        if (!u) {
          u = URL.createObjectURL(f);
          map.set(f, u);
        }
        return { original: u, thumbnail: u };
      })
    );
  }, [files]);

  useEffect(() => {
    const map = confirmPreviewUrlByFileRef.current;
    return () => {
      for (const url of map.values()) {
        URL.revokeObjectURL(url);
      }
      map.clear();
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    const id = requestScrollElementIntoViewNearest(errorBannerRef.current);
    return () => {
      if (id !== 0) window.cancelAnimationFrame(id);
    };
  }, [error]);

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
    setPhotoRedoAfterDraft(true);
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
        brand: furnitureBrand.trim().slice(0, 80),
        brandSlug: furnitureBrandSlug.trim(),
        name,
        productUrl: url,
        note: furnitureNote.trim().slice(0, 500),
        price: furniturePrice.trim() ? parseInt(furniturePrice.trim(), 10) : null,
        mediaIndex: 0,
        pinX: null,
        pinY: null,
        linkRelation: furnitureLinkRelation,
        linkVerifiedDate: furnitureLinkVerifiedDate.trim(),
      },
    ]);
    setFurnitureName("");
    setFurnitureBrand("");
    setFurnitureBrandSlug("");
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
      prev.map((f, idx) =>
        idx === i ? { ...f, mediaIndex, pinX: null, pinY: null } : f
      )
    );
  }
  function patchFurniture(i: number, patch: Partial<FurnitureEntry>) {
    setFurniture((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f))
    );
  }
  function handleImageFiles(next: File[]) {
    setFiles(next);
    if (next.length > 0) setPhotoRedoAfterDraft(false);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function hasPendingFurnitureInput() {
    return (
      furnitureName.trim().length > 0 ||
      furnitureUrl.trim().length > 0 ||
      furnitureBrand.trim().length > 0 ||
      furnitureBrandSlug.trim().length > 0 ||
      furnitureNote.trim().length > 0 ||
      furniturePrice.trim().length > 0 ||
      furnitureLinkVerifiedDate.trim().length > 0
    );
  }

  function goFurnitureStepNext() {
    if (hasPendingFurnitureInput()) {
      setError(
        "入力中の行があります。「リストに追加」で確定するか、使わない内容は空にしてから次へ進んでください。"
      );
      scrollElementIntoViewNearest(furnitureAddAnchorRef.current);
      return;
    }
    setError("");
    setStep(2);
  }

  function closeModal() {
    const checkbox = document.getElementById(MODAL_ID) as HTMLInputElement | null;
    if (checkbox) checkbox.checked = false;
    notifyPostModalProgrammaticClose();
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
          brand: f.brand.trim() || undefined,
          brandSlug: f.brandSlug.trim() || undefined,
          name: f.name,
          productUrl: f.productUrl,
          note: f.note,
          price: f.price,
          mediaIndex: Math.min(
            Math.max(0, f.mediaIndex),
            Math.max(0, files.length - 1)
          ),
          pinX: f.pinX,
          pinY: f.pinY,
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
    setFurnitureName("");
    setFurnitureBrand("");
    setFurnitureBrandSlug("");
    setFurnitureUrl("");
    setFurnitureNote("");
    setFurniturePrice("");
    setFurnitureLinkRelation("");
    setFurnitureLinkVerifiedDate("");
    setSelectedStyleTags([]);
    setHousingType("");
    setLayoutType("");
    setRoomContextNote("");
    setSelectedMood("");
    closeModal();
    if (typeof data.id === "string" && data.id) {
      const postId = data.id;
      toast.success("載せました", {
        duration: 4500,
        action: {
          label: "編集",
          onClick: () => router.push(`/post/${postId}/edit`),
        },
      });
      router.push(`/post/${postId}`);
    }
    router.refresh();
  }

  const stepProgressPct = Math.round(((step + 1) / STEPS.length) * 100);

  const stepBar = (
    <nav className="create-post-stepper mb-4 border-b pb-3 nook-border-hairline sm:mb-5 sm:pb-3.5" aria-label="載せる手順">
      <div
        className="mb-3"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stepProgressPct}
        aria-valuetext={`手順 ${step + 1} / ${STEPS.length}：${STEPS[step] ?? ""}`}
        aria-label="載せる手順の進捗"
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
          下書きがあります（写真は含まれません）。
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={applyDraft} className="btn-primary text-sm sm:text-xs">
            復元する
          </button>
          <button type="button" onClick={discardDraft} className="btn-secondary text-sm sm:text-xs">
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
        <div className="nook-ig-gallery-shell min-h-[220px] overflow-hidden rounded-[var(--radius-card)] border nook-border-hairline nook-bg-sunken sm:min-h-[260px]">
          <div style={{ filter: getMoodFilter(selectedMood) }}>
            <ImageGallery
              additionalClass="nook-post-modal-gallery"
              items={confirmGalleryItems}
              showThumbnails={false}
              showPlayButton={false}
              showFullscreenButton={false}
              showNav={confirmGalleryItems.length > 1}
              showBullets={false}
              renderLeftNav={renderNookGalleryLeftNav}
              renderRightNav={renderNookGalleryRightNav}
            />
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
                    {f.brand.trim() ? (
                      <span className="nook-fg-muted text-[11px]">{f.brand.trim()}</span>
                    ) : null}
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
                      {f.linkVerifiedDate
                        ? `${COPY_FURNITURE_VERIFIED_AT_PREFIX} ${
                            formatFurnitureLinkVerifiedInputJa(f.linkVerifiedDate) ??
                            f.linkVerifiedDate
                          }`
                        : null}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {error ? (
          <p ref={errorBannerRef} className="nook-form-error mt-3" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-between gap-3 border-t pt-4 nook-border-hairline">
          <button type="button" onClick={() => setStep(1)} className="btn-secondary text-sm sm:text-xs">
            戻る
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="btn-primary text-sm sm:text-xs disabled:opacity-50"
            aria-busy={loading}
          >
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
    const addRelationHint = getFurnitureLinkRelationHint(furnitureLinkRelation);
    return (
      <div className="create-post-flow animate-fade-in">
        {stepBar}
        <p className="nook-section-label mb-1">家具・雑貨</p>
        <h2 id="modal-title" className="nook-fg mb-1 text-base font-semibold tracking-tight">
          家具・雑貨のリンク（任意）
        </h2>
        <PostModalDesc>
          商品ページのURLを添えると、見た人が家具・雑貨をあとから辿りやすくなります。なくても進められます。あとから編集で足せます。
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
                  className="input-base flex-1 text-base sm:text-xs"
                  aria-label="家具・雑貨の名前"
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    furnitureUrlInputRef.current?.focus();
                  }}
                />
                <input
                  ref={furnitureUrlInputRef}
                  type="url"
                  value={furnitureUrl}
                  onChange={(e) => setFurnitureUrl(e.target.value)}
                  placeholder="https://…"
                  className="input-base flex-1 text-base sm:text-xs"
                  aria-label="商品ページのURL"
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    addFurniture();
                  }}
                />
              </div>
              <BrandCombobox
                idSuffix="add"
                brand={furnitureBrand}
                brandSlug={furnitureBrandSlug}
                onChange={({ brand: b, brandSlug: s }) => {
                  setFurnitureBrand(b);
                  setFurnitureBrandSlug(s);
                }}
                inputClassName="input-base text-base sm:text-xs"
              />
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
                className="input-base text-base sm:text-xs"
                maxLength={500}
                aria-label="メモ"
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              <input
                type="number"
                value={furniturePrice}
                onChange={(e) => setFurniturePrice(e.target.value)}
                placeholder="価格（概算・任意）"
                className="input-base text-base sm:text-xs"
                aria-label="価格"
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              <div ref={furnitureAddAnchorRef} className="pt-1">
                <button type="button" onClick={addFurniture} className="btn-primary w-full text-sm sm:text-xs">
                  リストに追加
                </button>
              </div>
              <div className="mt-1 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:flex-wrap nook-border-hairline">
                <label className="nook-fg-muted flex min-w-0 flex-1 flex-col gap-0.5 text-[10px] font-semibold sm:max-w-[12rem]">
                  {COPY_FURNITURE_LINK_RELATION}
                  <NookSelect
                    value={furnitureLinkRelation}
                    onChange={setFurnitureLinkRelation}
                    options={FURNITURE_LINK_RELATIONS.map((r) => ({
                      value: r.value,
                      label: r.label,
                    }))}
                    className="text-base sm:text-[10px]"
                    aria-label={COPY_FURNITURE_LINK_RELATION}
                  />
                </label>
                <label className="nook-fg-muted flex min-w-0 flex-1 flex-col gap-0.5 text-[10px] font-semibold sm:max-w-[12rem]">
                  {COPY_FURNITURE_LINK_VERIFIED}
                  <NookDatePicker
                    value={furnitureLinkVerifiedDate}
                    onChange={setFurnitureLinkVerifiedDate}
                    className="text-base sm:text-[10px]"
                    emptyLabel={COPY_FURNITURE_LINK_VERIFIED_EMPTY}
                    aria-label={COPY_FURNITURE_LINK_VERIFIED}
                  />
                </label>
              </div>
              {addRelationHint ? (
                <p className="nook-fg-faint mt-2 text-[10px] leading-relaxed">{addRelationHint}</p>
              ) : null}
            </div>
          </div>
          {error ? (
            <p ref={errorBannerRef} className="nook-form-error mt-0 text-xs" role="alert">
              {error}
            </p>
          ) : null}
          {furniture.length > 0 && (
            <ul className="space-y-2" role="list">
              {furniture.map((f, i) => {
                const rowRelationHint = getFurnitureLinkRelationHint(f.linkRelation);
                return (
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
                          {f.linkVerifiedDate
                            ? `${COPY_FURNITURE_VERIFIED_AT_PREFIX} ${
                                formatFurnitureLinkVerifiedInputJa(f.linkVerifiedDate) ??
                                f.linkVerifiedDate
                              }`
                            : null}
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
                  <div className="nook-fg-muted text-[10px] font-semibold">
                    ブランド・店名<span className="nook-fg-faint">（任意）</span>
                    <BrandCombobox
                      idSuffix={`row-${i}`}
                      brand={f.brand}
                      brandSlug={f.brandSlug}
                      onChange={(next) => patchFurniture(i, next)}
                      inputClassName="input-base mt-0.5 text-base sm:text-[10px]"
                      aria-label={`${f.name} のブランドまたは店名`}
                    />
                  </div>
                  {files.length > 1 && (
                    <label className="nook-fg-muted flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                      写っている写真
                      <NookSelect
                        value={String(f.mediaIndex)}
                        onChange={(v) => setFurnitureMediaIndex(i, Number(v))}
                        options={files.map((_, fi) => ({
                          value: String(fi),
                          label: `写真 ${fi + 1}`,
                        }))}
                        className="max-w-[8rem] text-base sm:text-[10px]"
                        aria-label={`${f.name} が写っている写真`}
                      />
                    </label>
                  )}
                  {files.length > 0 &&
                  files[f.mediaIndex] &&
                  confirmGalleryItems[f.mediaIndex]?.original ? (
                    <FurniturePhotoPinPicker
                      imageSrc={confirmGalleryItems[f.mediaIndex]!.original}
                      pinX={f.pinX}
                      pinY={f.pinY}
                      onChange={(next) => patchFurniture(i, next)}
                    />
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <label className="nook-fg-muted flex min-w-0 flex-1 flex-col gap-0.5 text-[10px] font-semibold sm:max-w-[12rem]">
                      {COPY_FURNITURE_LINK_RELATION}
                      <NookSelect
                        value={f.linkRelation}
                        onChange={(v) => patchFurniture(i, { linkRelation: v })}
                        options={FURNITURE_LINK_RELATIONS.map((r) => ({
                          value: r.value,
                          label: r.label,
                        }))}
                        className="text-base sm:text-[10px]"
                        aria-label={`${f.name}：${COPY_FURNITURE_LINK_RELATION}`}
                      />
                    </label>
                    <label className="nook-fg-muted flex min-w-0 flex-1 flex-col gap-0.5 text-[10px] font-semibold sm:max-w-[12rem]">
                      {COPY_FURNITURE_LINK_VERIFIED}
                      <NookDatePicker
                        value={f.linkVerifiedDate}
                        onChange={(v) => patchFurniture(i, { linkVerifiedDate: v })}
                        className="text-base sm:text-[10px]"
                        emptyLabel={COPY_FURNITURE_LINK_VERIFIED_EMPTY}
                        aria-label={`${f.name}：${COPY_FURNITURE_LINK_VERIFIED}`}
                      />
                    </label>
                  </div>
                  {rowRelationHint ? (
                    <p className="nook-fg-faint text-[10px] leading-relaxed">{rowRelationHint}</p>
                  ) : null}
                </li>
                );
              })}
            </ul>
          )}
          {furniture.length === 0 ? (
            <div className="rounded-[var(--radius-sm)] border border-dashed px-3 py-6 text-center nook-border-hairline">
              <p className="nook-fg-muted text-[11px]">スキップして次へ</p>
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex justify-between gap-3 border-t pt-4 nook-border-hairline">
          <button type="button" onClick={() => setStep(0)} className="btn-secondary text-sm sm:text-xs">
            戻る
          </button>
          <button type="button" onClick={goFurnitureStepNext} className="btn-primary text-sm sm:text-xs">
            次へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-flow animate-fade-in">
      {draftBanner}
      {photoRedoAfterDraft && files.length === 0 ? (
        <div
          className="mb-4 rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-500/[0.12] px-3 py-2.5"
          role="status"
        >
          <p className="nook-fg-secondary text-[11px] leading-relaxed">
            写真をもう一度選んでください。
          </p>
        </div>
      ) : null}
      {stepBar}
      <p className="nook-section-label mb-1">載せる</p>
      <h2 id="modal-title" className="nook-fg mb-1 text-base font-semibold tracking-tight">
        写真を載せる
      </h2>
      <PostModalDesc>
        タイトルと写真があれば十分です。家具のリンクやムードは、あとからでも足せます。
      </PostModalDesc>
      <div className="space-y-5">
        <div>
          <span className="nook-overline nook-overline--sentence mb-1.5 block">写真（必須）</span>
          <ImageUpload files={files} onFiles={handleImageFiles} onRemove={removeFile} mood={selectedMood} />
          {files.length > 0 &&
            confirmGalleryItems.length === files.length &&
            confirmGalleryItems[0] && (
            <div className="mt-4">
              <span className="nook-overline nook-overline--sentence mb-2 block">空気感</span>
              <MoodLargePreview
                key={firstPhotoPreviewKey(files[0])}
                src={confirmGalleryItems[0].original}
                mood={selectedMood}
              />
              <p className="nook-fg-secondary mb-3 text-[12px] leading-snug">
                <span className="nook-fg font-semibold">{selectedMoodMeta.label}</span>
                {selectedMoodMeta.description ? (
                  <span className="nook-fg-muted"> — {selectedMoodMeta.description}</span>
                ) : null}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 sm:gap-2.5">
                {IMAGE_MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setSelectedMood(m.value)}
                    className={`group relative flex min-w-[5.25rem] flex-col items-center gap-2 rounded-xl border px-2.5 py-2.5 transition-all active:scale-[0.98] sm:min-w-[5.75rem] ${
                      selectedMood === m.value ? "nook-mood-chip--selected" : "nook-mood-chip"
                    }`}
                    title={m.description}
                  >
                    <div className="nook-mood-swatch-frame h-[3.25rem] w-[4.5rem] overflow-hidden rounded-lg sm:h-16 sm:w-[5.25rem]">
                      <div className="nook-mood-swatch-checker h-full w-full" style={{ filter: m.filter }}>
                        <div className="flex h-full w-full items-center justify-center bg-black/5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="nook-fg-faint opacity-80">
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
                      className={`text-[10px] font-bold tracking-wider sm:text-[11px] ${selectedMood === m.value ? "nook-fg" : "nook-fg-muted"}`}
                    >
                      {m.label.toUpperCase()}
                    </span>
                    {selectedMood === m.value && (
                      <div className="nook-mood-check-badge nook-bg-raised nook-fg absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full shadow-sm">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
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
            className="nook-input-line text-base sm:text-sm"
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
            className="textarea-base text-base sm:text-sm"
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
                className="filter-chip flex shrink-0 items-center gap-1"
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
            {STYLE_TAGS_PICKER.map((t) => {
              const on = selectedStyleTags.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleStyleTag(t.slug)}
                  className="filter-chip shrink-0"
                >
                  {t.label}
                </button>
              );
            })}
            {selectedStyleTags
              .filter((slug) => !STYLE_TAG_PICKER_SLUG_SET.has(slug))
              .map((slug) => (
                <button
                  key={slug}
                  type="button"
                  aria-pressed
                  onClick={() => toggleStyleTag(slug)}
                  className="filter-chip shrink-0"
                >
                  {getStyleTagLabel(slug)}
                </button>
              ))}
          </div>
        </div>
        <div className="nook-room-context-panel rounded-[var(--radius-card)] border p-4">
          <p className="nook-overline nook-overline--sentence mb-2">部屋の文脈（任意）</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="nook-fg-muted flex flex-1 flex-col gap-1 text-[10px] font-semibold">
              住まい
              <NookSelect
                value={housingType}
                onChange={setHousingType}
                options={HOUSING_TYPES.map((h) => ({
                  value: h.value,
                  label: h.label,
                }))}
                className="text-base sm:text-xs"
                aria-label="住まいの種類"
              />
            </label>
            <label className="nook-fg-muted flex flex-1 flex-col gap-1 text-[10px] font-semibold">
              間取りの目安
              <NookSelect
                value={layoutType}
                onChange={setLayoutType}
                options={LAYOUT_TYPES.map((l) => ({
                  value: l.value,
                  label: l.label,
                }))}
                className="text-base sm:text-xs"
                aria-label="間取り"
              />
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
            className="input-base mt-1 text-base sm:text-xs"
            maxLength={120}
            autoComplete="off"
          />
        </div>
      </div>
      {error ? (
        <p ref={errorBannerRef} className="nook-form-error mt-4" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex justify-between gap-3 border-t pt-4 nook-border-hairline">
        <label htmlFor={MODAL_ID} className="btn-secondary cursor-pointer text-sm sm:text-xs">
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
          className="btn-primary text-sm sm:text-xs"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
