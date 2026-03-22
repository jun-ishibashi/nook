"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  FURNITURE_LINK_RELATIONS,
  getFurnitureLinkRelationHint,
} from "@/lib/furniture-link-meta";
import BrandCombobox from "./brand-combobox";
import FurniturePhotoPinPicker from "./furniture-photo-pin-picker";
import NookDatePicker from "./nook-date-picker";
import NookSelect from "./nook-select";
import { requestScrollElementIntoViewNearest } from "@/lib/motion-prefs";

export type EditPostInitial = {
  id: string;
  title: string;
  description: string;
  category: string;
  housingType: string;
  layoutType: string;
  roomContextNote: string;
  styleTags: string[];
  mediaCount: number;
  medias: { path: string }[];
  furnitureItems: {
    id: string;
    name: string;
    brand: string;
    brandSlug: string;
    productUrl: string;
    note: string;
    mediaIndex: number;
    pinX: number | null;
    pinY: number | null;
    linkRelation: string;
    linkVerifiedDate: string;
  }[];
};

type FurnitureEntry = {
  brand: string;
  brandSlug: string;
  name: string;
  productUrl: string;
  note: string;
  mediaIndex: number;
  pinX: number | null;
  pinY: number | null;
  linkRelation: string;
  linkVerifiedDate: string;
};

export default function EditPostForm({ initial }: { initial: EditPostInitial }) {
  const router = useRouter();
  const errorBannerRef = useRef<HTMLParagraphElement | null>(null);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [selectedStyleTags, setSelectedStyleTags] = useState<string[]>(initial.styleTags);
  const [housingType, setHousingType] = useState(initial.housingType);
  const [layoutType, setLayoutType] = useState(initial.layoutType);
  const [roomContextNote, setRoomContextNote] = useState(initial.roomContextNote);
  const [furniture, setFurniture] = useState<FurnitureEntry[]>(
    initial.furnitureItems.map((f) => ({
      brand: f.brand ?? "",
      brandSlug: f.brandSlug ?? "",
      name: f.name,
      productUrl: f.productUrl,
      note: f.note ?? "",
      mediaIndex: f.mediaIndex ?? 0,
      pinX: f.pinX ?? null,
      pinY: f.pinY ?? null,
      linkRelation: f.linkRelation ?? "",
      linkVerifiedDate: f.linkVerifiedDate ?? "",
    }))
  );
  const [furnitureName, setFurnitureName] = useState("");
  const [furnitureBrand, setFurnitureBrand] = useState("");
  const [furnitureBrandSlug, setFurnitureBrandSlug] = useState("");
  const [furnitureUrl, setFurnitureUrl] = useState("");
  const [furnitureNote, setFurnitureNote] = useState("");
  const [furnitureLinkRelation, setFurnitureLinkRelation] = useState("");
  const [furnitureLinkVerifiedDate, setFurnitureLinkVerifiedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!error) return;
    const id = requestScrollElementIntoViewNearest(errorBannerRef.current);
    return () => {
      if (id !== 0) window.cancelAnimationFrame(id);
    };
  }, [error]);

  function addFurniture() {
    const name = furnitureName.trim();
    const url = furnitureUrl.trim();
    if (!name || !url) {
      setError("名前と商品ページのURLを入力してください。");
      return;
    }
    if (!url.startsWith("http")) {
      setError("リンクは https:// から入力してください。");
      return;
    }
    setError("");
    setFurniture((prev) => [
      ...prev,
      {
        brand: furnitureBrand.trim().slice(0, 80),
        brandSlug: furnitureBrandSlug.trim(),
        name,
        productUrl: url,
        note: furnitureNote.trim().slice(0, 500),
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
    setFurnitureLinkRelation("");
    setFurnitureLinkVerifiedDate("");
  }

  function removeFurniture(i: number) {
    setFurniture((prev) => prev.filter((_, idx) => idx !== i));
  }

  function patchFurniture(i: number, patch: Partial<FurnitureEntry>) {
    setFurniture((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f))
    );
  }

  function toggleStyleTag(slug: string) {
    setSelectedStyleTags((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 8) return prev;
      return [...prev, slug];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルを入力してください。");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/posts/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        category,
        housingType,
        layoutType,
        roomContextNote,
        furniture: furniture.map((f) => ({
          brand: f.brand.trim() || undefined,
          brandSlug: f.brandSlug.trim() || undefined,
          name: f.name,
          productUrl: f.productUrl,
          note: f.note || undefined,
          mediaIndex: Math.min(
            Math.max(0, f.mediaIndex),
            Math.max(0, initial.mediaCount - 1)
          ),
          pinX: f.pinX,
          pinY: f.pinY,
          linkRelation: f.linkRelation || undefined,
          linkVerifiedDate: f.linkVerifiedDate.trim() || null,
        })),
        styleTags: selectedStyleTags,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "更新できませんでした。もう一度お試しください。");
      return;
    }
    toast.success("更新しました");
    router.push(`/post/${initial.id}`);
    router.refresh();
  }

  const addFurnitureRelationHint = getFurnitureLinkRelationHint(furnitureLinkRelation);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="edit-title" className="nook-overline nook-overline--sentence mb-1.5 block">
          タイトル（必須）
        </label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: リビングの窓際コーナー"
          className="input-base text-base sm:text-sm"
          maxLength={100}
          autoComplete="off"
        />
        <p className="nook-fg-muted mt-1 text-right text-[10px]">
          {title.length}/100
        </p>
      </div>
      <div>
        <label htmlFor="edit-desc" className="nook-overline nook-overline--sentence mb-1.5 block">
          キャプション<span className="nook-fg-faint">（任意）</span>
        </label>
        <textarea
          id="edit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="こだわり・住まいの条件など、短くて大丈夫です"
          className="textarea-base text-base sm:text-sm"
          rows={4}
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
        <p id="edit-style-hint" className="sr-only">
          タップで複数選べます。同じタグをもう一度押すと外れます。
        </p>
        <div
          className="-mx-1 flex gap-0 overflow-x-auto px-1 pb-0.5 scrollbar-hide"
          role="group"
          aria-label="スタイル"
          aria-describedby="edit-style-hint"
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
        <span className="nook-overline nook-overline--sentence mb-2 block">部屋の文脈（任意）</span>
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
        <label htmlFor="edit-room-note" className="nook-fg-muted mt-3 block text-[10px] font-semibold">
          ひとこと（角部屋・築年など）
        </label>
        <input
          id="edit-room-note"
          type="text"
          value={roomContextNote}
          onChange={(e) => setRoomContextNote(e.target.value.slice(0, 120))}
          placeholder="例: 角部屋・築15年"
          className="input-base mt-1 text-base sm:text-xs"
          maxLength={120}
          autoComplete="off"
        />
      </div>

      <div className="border-t pt-6 nook-border-hairline">
        <p className="nook-section-label mb-1">家具・雑貨</p>
        <p className="nook-fg mb-1 text-sm font-semibold tracking-tight">リンクの編集</p>
        {furniture.length === 0 ? (
          <p className="nook-fg-muted mb-3 text-[11px]">
            未登録（任意）
          </p>
        ) : null}
        <div className="nook-bg-sunken rounded-[var(--radius-card)] border p-4 nook-border-hairline">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={furnitureName}
              onChange={(e) => setFurnitureName(e.target.value)}
              placeholder="例: デスクライト"
              className="input-base text-base sm:text-xs"
              aria-label="家具・雑貨の名前"
            />
            <BrandCombobox
              idSuffix="edit-add"
              brand={furnitureBrand}
              brandSlug={furnitureBrandSlug}
              onChange={({ brand: b, brandSlug: s }) => {
                setFurnitureBrand(b);
                setFurnitureBrandSlug(s);
              }}
              inputClassName="input-base text-base sm:text-xs"
            />
            <input
              type="url"
              value={furnitureUrl}
              onChange={(e) => setFurnitureUrl(e.target.value)}
              placeholder="https://..."
              className="input-base text-base sm:text-xs"
              aria-label="商品ページのURL"
            />
            {furnitureUrl.trim() && /^http:\/\//i.test(furnitureUrl.trim()) ? (
              <p className="nook-fg-faint text-[9px] leading-snug">
                可能なら https のリンクを推奨します。
              </p>
            ) : null}
            <input
              type="text"
              value={furnitureNote}
              onChange={(e) => setFurnitureNote(e.target.value)}
              placeholder="メモ（サイズ・色・店舗名など／任意）"
              className="input-base text-base sm:text-xs"
              maxLength={500}
              aria-label="メモ"
            />
            <div className="mt-1 flex flex-col gap-2 border-t pt-3 nook-border-hairline sm:flex-row sm:flex-wrap">
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
            {addFurnitureRelationHint ? (
              <p className="nook-fg-faint text-[10px] leading-relaxed">{addFurnitureRelationHint}</p>
            ) : null}
            <button type="button" onClick={addFurniture} className="btn-secondary text-sm sm:text-xs">
              追加
            </button>
          </div>
        </div>
        {furniture.length > 0 && (
          <ul className="mt-3 space-y-1.5" role="list">
            {furniture.map((f, i) => {
              const rowRelationHint = getFurnitureLinkRelationHint(f.linkRelation);
              return (
              <li
                key={`${f.productUrl}-${i}`}
                className="nook-furniture-row flex flex-col gap-2 rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="nook-fg truncate font-medium">{f.name}</p>
                    <div className="nook-fg-muted mt-1 text-[10px] font-semibold">
                      ブランド・店名（任意）
                      <BrandCombobox
                        idSuffix={`edit-row-${i}`}
                        brand={f.brand}
                        brandSlug={f.brandSlug}
                        onChange={(next) => patchFurniture(i, next)}
                        inputClassName="input-base mt-0.5 text-base sm:text-[10px]"
                        placeholder="例: IKEA"
                        aria-label={`${f.name} のブランドまたは店名`}
                      />
                    </div>
                    <p className="nook-fg-muted truncate text-[11px]">{f.productUrl}</p>
                    {f.note ? (
                      <p className="nook-fg-secondary mt-1 text-[11px] leading-relaxed">
                        {f.note}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFurniture(i)}
                    className="nook-fg-muted shrink-0 rounded-full p-1.5 transition hover:opacity-100"
                    aria-label={`${f.name} を削除`}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {initial.mediaCount > 1 && (
                  <label className="nook-fg-muted flex items-center gap-2 text-[10px] font-semibold">
                    写っている写真
                    <NookSelect
                      value={String(f.mediaIndex)}
                      onChange={(v) => {
                        const n = Number(v);
                        setFurniture((prev) =>
                          prev.map((row, idx) =>
                            idx === i
                              ? { ...row, mediaIndex: n, pinX: null, pinY: null }
                              : row
                          )
                        );
                      }}
                      options={Array.from({ length: initial.mediaCount }, (_, fi) => ({
                        value: String(fi),
                        label: `写真 ${fi + 1}`,
                      }))}
                      className="max-w-[8rem] text-base sm:text-[10px]"
                      aria-label={`${f.name} が写っている写真`}
                    />
                  </label>
                )}
                {initial.medias[f.mediaIndex]?.path ? (
                  <FurniturePhotoPinPicker
                    imageSrc={initial.medias[f.mediaIndex]!.path}
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
      </div>

      {error ? (
        <p ref={errorBannerRef} className="nook-form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="btn-primary text-sm sm:text-xs disabled:opacity-50">
          {loading ? "更新中…" : "更新する"}
        </button>
        <Link href={`/post/${initial.id}`} className="btn-secondary text-sm sm:text-xs">
          部屋に戻る
        </Link>
      </div>
    </form>
  );
}
