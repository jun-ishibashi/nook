"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import CategoryIcon from "./category-icon";
import { STYLE_TAGS } from "@/lib/style-tags";
import { HOUSING_TYPES, LAYOUT_TYPES } from "@/lib/room-context";

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
  furnitureItems: { id: string; name: string; productUrl: string; note: string; mediaIndex: number }[];
};

type FurnitureEntry = { name: string; productUrl: string; note: string; mediaIndex: number };

export default function EditPostForm({ initial }: { initial: EditPostInitial }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [selectedStyleTags, setSelectedStyleTags] = useState<string[]>(initial.styleTags);
  const [housingType, setHousingType] = useState(initial.housingType);
  const [layoutType, setLayoutType] = useState(initial.layoutType);
  const [roomContextNote, setRoomContextNote] = useState(initial.roomContextNote);
  const [furniture, setFurniture] = useState<FurnitureEntry[]>(
    initial.furnitureItems.map((f) => ({
      name: f.name,
      productUrl: f.productUrl,
      note: f.note ?? "",
      mediaIndex: f.mediaIndex ?? 0,
    }))
  );
  const [furnitureName, setFurnitureName] = useState("");
  const [furnitureUrl, setFurnitureUrl] = useState("");
  const [furnitureNote, setFurnitureNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        name,
        productUrl: url,
        note: furnitureNote.trim().slice(0, 500),
        mediaIndex: 0,
      },
    ]);
    setFurnitureName("");
    setFurnitureUrl("");
    setFurnitureNote("");
  }

  function removeFurniture(i: number) {
    setFurniture((prev) => prev.filter((_, idx) => idx !== i));
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
          name: f.name,
          productUrl: f.productUrl,
          note: f.note || undefined,
          mediaIndex: Math.min(
            Math.max(0, f.mediaIndex),
            Math.max(0, initial.mediaCount - 1)
          ),
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
    router.push(`/post/${initial.id}`);
    router.refresh();
  }

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
          className="input-base text-sm"
          maxLength={100}
          autoComplete="off"
        />
        <p className="mt-1 text-right text-[10px]" style={{ color: "var(--text-muted)" }}>
          {title.length}/100
        </p>
      </div>
      <div>
        <label htmlFor="edit-desc" className="nook-overline nook-overline--sentence mb-1.5 block">
          キャプション<span style={{ color: "var(--text-faint)" }}>（任意）</span>
        </label>
        <textarea
          id="edit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="こだわり・賃貸の条件など、短くて大丈夫です"
          className="textarea-base text-sm"
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
        <p id="edit-style-hint" className="sr-only">
          タップで複数選べます。同じタグをもう一度押すと外れます。
        </p>
        <div
          className="-mx-1 flex gap-0 overflow-x-auto px-1 pb-0.5 scrollbar-hide"
          role="group"
          aria-label="スタイル"
          aria-describedby="edit-style-hint"
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
        <span className="nook-overline nook-overline--sentence mb-2 block">部屋の文脈（任意）</span>
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
                <option key={h.value || "h-unset"} value={h.value}>{h.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
            間取いの目安
            <select
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value)}
              className="input-base text-xs"
              aria-label="間取い"
            >
              {LAYOUT_TYPES.map((l) => (
                <option key={l.value || "l-unset"} value={l.value}>{l.label}</option>
              ))}
            </select>
          </label>
        </div>
        <label htmlFor="edit-room-note" className="mt-3 block text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
          ひとこと（角部屋・築年など）
        </label>
        <input
          id="edit-room-note"
          type="text"
          value={roomContextNote}
          onChange={(e) => setRoomContextNote(e.target.value.slice(0, 120))}
          placeholder="例: 角部屋・築15年"
          className="input-base mt-1 text-xs"
          maxLength={120}
          autoComplete="off"
        />
      </div>

      <div className="border-t pt-6" style={{ borderColor: "var(--hairline)" }}>
        <p className="nook-section-label mb-1">家具・雑貨</p>
        <p className="mb-1 text-sm font-semibold tracking-tight" style={{ color: "var(--text)" }}>
          リンクの編集
        </p>
        {furniture.length === 0 ? (
          <p className="mb-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
            未登録（任意）
          </p>
        ) : null}
        <div
          className="rounded-[var(--radius-card)] border p-4"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-sunken)" }}
        >
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={furnitureName}
              onChange={(e) => setFurnitureName(e.target.value)}
              placeholder="例: デスクライト"
              className="input-base text-xs"
              aria-label="家具・雑貨の名前"
            />
            <input
              type="url"
              value={furnitureUrl}
              onChange={(e) => setFurnitureUrl(e.target.value)}
              placeholder="https://..."
              className="input-base text-xs"
              aria-label="商品ページのURL"
            />
            {furnitureUrl.trim() && /^http:\/\//i.test(furnitureUrl.trim()) ? (
              <p className="text-[9px] leading-snug" style={{ color: "var(--text-faint)" }}>
                可能なら https のリンクを推奨します。
              </p>
            ) : null}
            <input
              type="text"
              value={furnitureNote}
              onChange={(e) => setFurnitureNote(e.target.value)}
              placeholder="メモ（サイズ・色・店舗名など／任意）"
              className="input-base text-xs"
              maxLength={500}
              aria-label="メモ"
            />
            <button type="button" onClick={addFurniture} className="btn-secondary text-xs">
              追加
            </button>
          </div>
        </div>
        {furniture.length > 0 && (
          <ul className="mt-3 space-y-1.5" role="list">
            {furniture.map((f, i) => (
              <li
                key={`${f.productUrl}-${i}`}
                className="flex flex-col gap-2 rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm"
                style={{ borderColor: "var(--hairline)", background: "var(--bg-raised)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate" style={{ color: "var(--text)" }}>
                      {f.name}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                      {f.productUrl}
                    </p>
                    {f.note ? (
                      <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {f.note}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFurniture(i)}
                    className="shrink-0 rounded-full p-1.5 transition hover:opacity-100"
                    style={{ color: "var(--text-muted)" }}
                    aria-label={`${f.name} を削除`}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {initial.mediaCount > 1 && (
                  <label className="flex items-center gap-2 text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                    写っている写真
                    <select
                      value={f.mediaIndex}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setFurniture((prev) =>
                          prev.map((row, idx) =>
                            idx === i ? { ...row, mediaIndex: v } : row
                          )
                        );
                      }}
                      className="input-base max-w-[8rem] text-[10px]"
                      aria-label={`${f.name} が写っている写真`}
                    >
                      {Array.from({ length: initial.mediaCount }, (_, fi) => (
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
      </div>

      {error ? <p className="nook-form-error" role="alert">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="btn-primary text-xs disabled:opacity-50">
          {loading ? "保存中…" : "保存する"}
        </button>
        <Link href={`/post/${initial.id}`} className="btn-secondary text-xs">
          部屋に戻る
        </Link>
      </div>
    </form>
  );
}
