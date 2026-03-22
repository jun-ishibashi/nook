"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProductUrlMeta } from "@/lib/product-url";

export type WishlistRow = {
  id: string;
  name: string;
  productUrl: string;
  note: string;
  sourcePostId: string | null;
  createdAt: string;
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadWishlistCsv(items: WishlistRow[]) {
  if (typeof window === "undefined") return;
  const origin = window.location.origin;
  const header = ["名前", "購入先URL", "メモ", "部屋のURL"];
  const rows = items.map((w) => [
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

export default function DashboardWishlist({ items }: { items: WishlistRow[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function remove(id: string) {
    setRemoving(id);
    try {
      const res = await fetch(`/api/wishlist?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) startTransition(() => router.refresh());
    } finally {
      setRemoving(null);
    }
  }

  if (items.length === 0) return null;

  return (
    <>
      <div className="mb-3">
        <button type="button" onClick={() => downloadWishlistCsv(items)} className="btn-secondary text-xs">
          CSVで保存
        </button>
      </div>
      <ul className="space-y-2" role="list">
      {items.map((w) => {
        const urlMeta = getProductUrlMeta(w.productUrl);
        return (
        <li
          key={w.id}
          className="flex flex-col gap-2 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: "var(--bg-sunken)", border: "1px solid var(--hairline)" }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {w.name}
            </p>
            {w.note ? (
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {w.note}
              </p>
            ) : null}
            <p className="mt-1 truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
              {w.productUrl}
            </p>
            {urlMeta && !urlMeta.isSecure ? (
              <p className="mt-0.5 text-[9px] leading-snug" style={{ color: "var(--text-faint)" }}>
                http の接続です。入力はご注意ください。
              </p>
            ) : null}
            {w.sourcePostId && (
              <Link
                href={`/post/${w.sourcePostId}`}
                className="mt-2 inline-block text-[11px] font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--text-muted)" }}
              >
                元の部屋を見る
              </Link>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href={w.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs"
            >
              購入先を開く
            </a>
            <button
              type="button"
              onClick={() => remove(w.id)}
              disabled={removing === w.id}
              className="btn-secondary text-xs disabled:opacity-50"
              aria-label={`${w.name} を欲しいから外す`}
            >
              {removing === w.id ? "…" : "外す"}
            </button>
          </div>
        </li>
        );
      })}
    </ul>
    </>
  );
}
