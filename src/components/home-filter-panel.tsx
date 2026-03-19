"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseStyleSlugsFromSearchParams } from "@/lib/feed-styles";
import CategoryFilter from "@/components/category-filter";
import StyleTagFilter from "@/components/style-tag-filter";

/**
 * 絞り込みなしのときは折りたたみ、条件適用中は常に展開（§5 操作帯の縦を抑える）
 */
export default function HomeFilterPanel() {
  const searchParams = useSearchParams();
  const hasActive = useMemo(() => {
    const cat = searchParams.get("category")?.trim();
    const styles = parseStyleSlugsFromSearchParams({
      styles: searchParams.get("styles") ?? undefined,
      style: searchParams.get("style") ?? undefined,
    });
    return Boolean(cat) || styles.length > 0;
  }, [searchParams]);

  const [expanded, setExpanded] = useState(false);
  const open = hasActive || expanded;

  return (
    <section
      className="home-filter-panel mb-6 border-t pt-5 sm:mb-7 sm:pt-6"
      style={{ borderColor: "var(--hairline)" }}
      aria-labelledby="home-filters-heading"
      aria-describedby="home-filters-help"
    >
      <p id="home-filters-help" className="sr-only">
        カテゴリ・スタイルで絞り込み。スタイルを複数選ぶと、すべてに合う部屋だけが表示されます。
      </p>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="home-filters-heading" className="nook-section-label">
          カテゴリ・スタイル
        </h2>
        {!hasActive ? (
          <button
            type="button"
            className="min-h-9 shrink-0 px-1 text-[11px] font-medium underline decoration-transparent underline-offset-4 transition hover:decoration-[var(--text-faint)]"
            style={{ color: "var(--text-muted)" }}
            aria-expanded={open}
            aria-controls="home-filters-body"
            onClick={() => setExpanded((v) => !v)}
          >
            {open ? "閉じる" : "表示"}
          </button>
        ) : (
          <span className="text-[10px] font-medium tracking-wide" style={{ color: "var(--text-faint)" }}>
            適用中
          </span>
        )}
      </div>
      {open ? (
        <div id="home-filters-body" className="mt-2.5 flex flex-col gap-3 sm:gap-3.5">
          <CategoryFilter />
          <StyleTagFilter />
        </div>
      ) : null}
    </section>
  );
}
