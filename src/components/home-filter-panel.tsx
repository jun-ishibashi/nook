"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseStyleSlugsFromSearchParams } from "@/lib/feed-styles";
import CategoryFilter from "@/components/category-filter";
import StyleTagFilter from "@/components/style-tag-filter";
import PriceFilter from "@/components/price-filter";

/**
 * 絞り込みなしのときは折りたたみ、条件適用中は常に展開（§5 操作帯の縦を抑える）
 */
export default function HomeFilterPanel() {
  const searchParams = useSearchParams();
  const hasActive = useMemo(() => {
    const cat = searchParams.get("category")?.trim();
    const minP = searchParams.get("minPrice");
    const maxP = searchParams.get("maxPrice");
    const styles = parseStyleSlugsFromSearchParams({
      styles: searchParams.get("styles") ?? undefined,
      style: searchParams.get("style") ?? undefined,
    });
    return Boolean(cat) || Boolean(minP) || Boolean(maxP) || styles.length > 0;
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
        カテゴリ・スタイル・価格帯で絞り込み。
      </p>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="home-filters-heading" className="nook-section-label">
          絞り込み
        </h2>
        {!hasActive ? (
          <button
            type="button"
            className="min-h-9 shrink-0 rounded-md px-1.5 text-[11px] font-medium underline decoration-transparent underline-offset-4 transition hover:decoration-[var(--text-faint)]"
            style={{ color: "var(--text-muted)" }}
            aria-expanded={open}
            aria-controls="home-filters-body"
            aria-label={open ? "フィルターを閉じる" : "フィルターを開く"}
            onClick={() => setExpanded((v) => !v)}
          >
            {open ? "閉じる" : "開く"}
          </button>
        ) : (
          <span className="text-[10px] font-medium tracking-wide" style={{ color: "var(--text-faint)" }}>
            適用中
          </span>
        )}
      </div>
      {!open && !hasActive ? (
        <p className="mt-1.5 text-[10px] leading-snug" style={{ color: "var(--text-faint)" }}>
          タップでカテゴリ・スタイル・価格帯を表示
        </p>
      ) : null}
      {open ? (
        <div id="home-filters-body" className="mt-2.5 flex flex-col gap-5 sm:gap-6">
          <CategoryFilter />
          <StyleTagFilter />
          <PriceFilter />
        </div>
      ) : null}
    </section>
  );
}
