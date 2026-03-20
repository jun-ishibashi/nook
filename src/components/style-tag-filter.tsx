"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import { STYLE_TAGS } from "@/lib/style-tags";
import { parseStyleSlugsFromSearchParams } from "@/lib/feed-styles";
import { buildHomeHref } from "@/lib/home-href";

export default function StyleTagFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchKey = searchParams.toString();

  const selected = useMemo(() => {
    const params = new URLSearchParams(searchKey);
    return new Set(
      parseStyleSlugsFromSearchParams({
        styles: params.get("styles") ?? undefined,
        style: params.get("style") ?? undefined,
      })
    );
  }, [searchKey]);

  function applySlugs(slugs: string[]) {
    startTransition(() => {
      router.push(
        buildHomeHref(searchParams, (p) => {
          p.delete("style");
          const sorted = [...new Set(slugs)].filter(Boolean).sort();
          if (sorted.length === 0) p.delete("styles");
          else p.set("styles", sorted.join(","));
        })
      );
    });
  }

  function toggle(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    applySlugs([...next]);
  }

  function clearAll() {
    applySlugs([]);
  }

  return (
    <div className="flex flex-col gap-1" aria-busy={isPending}>
      <p id="style-filter-hint" className="sr-only">
        スタイルを複数選ぶと、選んだタグがすべて付いた部屋だけが表示されます。
      </p>
      <p className="nook-overline nook-overline--sentence mb-0">スタイル</p>
      <p className="mb-1 text-[10px] leading-snug" style={{ color: "var(--text-faint)" }}>
        複数選ぶと、すべてに合う部屋だけ
      </p>
      <div
        className={`flex gap-0 overflow-x-auto scrollbar-hide ${isPending ? "opacity-60" : ""}`}
        role="group"
        aria-label="スタイル"
        aria-describedby="style-filter-hint"
      >
        <button
          type="button"
          aria-pressed={selected.size === 0}
          onClick={() => clearAll()}
          className="filter-chip text-[11px]"
        >
          すべて
        </button>
        {STYLE_TAGS.map((t) => {
          const on = selected.has(t.slug);
          return (
            <button
              key={t.slug}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(t.slug)}
              className="filter-chip text-[11px]"
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
