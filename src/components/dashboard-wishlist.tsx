"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProductUrlMeta } from "@/lib/product-url";
import NookSelect from "./nook-select";

export type WishlistRow = {
  id: string;
  name: string;
  productUrl: string;
  note: string;
  sourcePostId: string | null;
  buyRank: number;
  createdAt: string;
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const BUY_RANK_OPTIONS = [
  { value: "0", label: "未設定" },
  ...Array.from({ length: 20 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  })),
];

function downloadWishlistCsv(items: WishlistRow[]) {
  if (typeof window === "undefined") return;
  const origin = window.location.origin;
  const header = ["買う順", "名前", "商品ページURL", "メモ", "部屋のURL"];
  const rows = items.map((w) => [
    w.buyRank === 0 ? "" : String(w.buyRank),
    w.name,
    w.productUrl,
    w.note,
    w.sourcePostId ? `${origin}/post/${w.sourcePostId}` : "",
  ]);
  const lines = [header, ...rows].map((cols) => cols.map(escapeCsvCell).join(","));
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nook-wishlist-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function hostKey(productUrl: string): string {
  return getProductUrlMeta(productUrl)?.displayHost ?? "その他";
}

export default function DashboardWishlist({ items }: { items: WishlistRow[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);
  const [storeMode, setStoreMode] = useState(false);
  const [groupByShop, setGroupByShop] = useState(false);
  const [, startTransition] = useTransition();

  const grouped = useMemo(() => {
    if (!groupByShop) return null;
    const map = new Map<string, WishlistRow[]>();
    for (const w of items) {
      const k = hostKey(w.productUrl);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(w);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "ja"));
  }, [items, groupByShop]);

  async function remove(id: string) {
    setRemoving(id);
    try {
      const res = await fetch(`/api/wishlist?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) startTransition(() => router.refresh());
    } finally {
      setRemoving(null);
    }
  }

  async function updateBuyRank(id: string, buyRank: number) {
    const res = await fetch("/api/wishlist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, buyRank }),
    });
    if (res.ok) startTransition(() => router.refresh());
  }

  if (items.length === 0) return null;

  function renderRow(w: WishlistRow) {
    const urlMeta = getProductUrlMeta(w.productUrl);
    return (
      <li
        key={w.id}
        className="nook-furniture-row flex flex-col gap-2 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1">
          <p className="nook-fg text-sm font-semibold">{w.name}</p>
          {w.note ? (
            <p className="nook-fg-secondary mt-0.5 text-xs leading-relaxed">{w.note}</p>
          ) : null}
          <p className="nook-fg-muted mt-1 truncate text-xs sm:text-[11px]">{w.productUrl}</p>
          {urlMeta && !urlMeta.isSecure ? (
            <p className="nook-fg-faint mt-0.5 text-xs leading-snug sm:text-[9px]">
              http の接続です。入力はご注意ください。
            </p>
          ) : null}
          {w.sourcePostId && (
            <Link
              href={`/post/${w.sourcePostId}`}
              className="nook-fg-muted mt-2 inline-flex min-h-[var(--touch)] items-center text-xs font-medium underline-offset-2 transition active:opacity-80 hover:underline sm:min-h-0 sm:text-[11px]"
            >
              元の部屋を見る
            </Link>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <label className="nook-fg-muted flex items-center gap-2 nook-caption-sm font-semibold sm:flex-col sm:items-end">
            <span className="whitespace-nowrap">買う順</span>
            <NookSelect
              className="max-w-[5.5rem] text-base sm:text-[10px]"
              value={String(w.buyRank)}
              onChange={(v) => updateBuyRank(w.id, Number(v))}
              options={BUY_RANK_OPTIONS}
              aria-label={`${w.name} の買う順（小さい数字が先）`}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <a
              href={w.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm sm:text-xs"
            >
              商品ページを開く
            </a>
            <button
              type="button"
              onClick={() => remove(w.id)}
              disabled={removing === w.id}
              aria-busy={removing === w.id}
              className="btn-secondary text-sm sm:text-xs disabled:opacity-50"
              aria-label={`${w.name} を欲しいから外す`}
            >
              {removing === w.id ? "…" : "外す"}
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div
      className={
        storeMode
          ? "rounded-[var(--radius-card)] border border-white/15 bg-black/25 p-3 brightness-110 contrast-[1.02] sm:p-4"
          : ""
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => downloadWishlistCsv(items)}
          className="btn-secondary text-sm active:scale-[0.99] sm:text-xs sm:active:scale-100"
        >
          CSVで保存
        </button>
        <button
          type="button"
          onClick={() => setGroupByShop((v) => !v)}
          className={`text-sm active:scale-[0.99] sm:text-xs sm:active:scale-100 ${groupByShop ? "btn-primary" : "btn-secondary"}`}
        >
          店ごとに表示
        </button>
        <button
          type="button"
          onClick={() => setStoreMode((v) => !v)}
          className={`text-sm active:scale-[0.99] sm:text-xs sm:active:scale-100 ${storeMode ? "btn-primary" : "btn-secondary"}`}
        >
          店舗モード
        </button>
      </div>
      {storeMode ? (
        <p className="nook-fg-faint mb-3 nook-caption-sm">
          明るさを上げて文字を大きくします。店内や屋外で見るとき向けです。
        </p>
      ) : null}

      {groupByShop && grouped ? (
        <div className="space-y-6">
          {grouped.map(([host, rows]) => (
            <section key={host} aria-labelledby={`wishlist-host-${host}`}>
              <h3
                id={`wishlist-host-${host}`}
                className={`nook-section-label mb-2 ${storeMode ? "!text-[11px]" : ""}`}
              >
                {host}
              </h3>
              <ul className={`space-y-2 ${storeMode ? "text-[15px]" : ""}`} role="list">
                {rows.map((w) => renderRow(w))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className={`space-y-2 ${storeMode ? "text-[15px]" : ""}`} role="list">
          {items.map((w) => renderRow(w))}
        </ul>
      )}
    </div>
  );
}
