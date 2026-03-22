"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseStyleSlugsFromSearchParams } from "@/lib/feed-styles";
import CategoryFilter from "@/components/category-filter";
import StyleTagFilter from "@/components/style-tag-filter";
import PriceFilter from "@/components/price-filter";
import { HomeFilterDraftProvider, useHomeFilterDraft } from "@/components/home-filter-draft";

export default function HomeFilterPanel() {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  return (
    <HomeFilterDraftProvider key={searchKey}>
      <HomeFilterPanelInner />
    </HomeFilterDraftProvider>
  );
}

function HomeFilterPanelInner() {
  const searchParams = useSearchParams();
  const { flushNow } = useHomeFilterDraft();

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
  const filtersOpen = hasActive || expanded;
  const showCollapsedHint = !hasActive && !expanded;
  const showFilterBody = filtersOpen;

  return (
    <section
      className="home-filter-panel"
      aria-labelledby="home-filters-heading"
      aria-describedby="home-filters-help"
    >
      <p id="home-filters-help" className="sr-only">
        カテゴリ・スタイル・予算の条件で、部屋の一覧を絞り込めます。スタイルは続けて選んでも、少し待てばまとめて反映されます。
      </p>
      <div className="home-filter-panel__bar">
        <h2 id="home-filters-heading" className="home-filter-panel__title">
          ムードを絞る
        </h2>
        {!hasActive ? (
          <button
            type="button"
            className="home-filter-panel__toggle"
            aria-expanded={filtersOpen}
            aria-controls="home-filters-body"
            aria-label={filtersOpen ? "絞り込みを閉じる" : "ムードで絞る"}
            onClick={() => {
              setExpanded((v) => {
                const next = !v;
                if (v && !next) flushNow();
                return next;
              });
            }}
          >
            <span>{filtersOpen ? "閉じる" : "開く"}</span>
            <svg
              className="home-filter-panel__chevron"
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <span className="home-filter-panel__badge" aria-live="polite">
            適用中
          </span>
        )}
      </div>
      {showCollapsedHint ? (
        <p className="home-filter-panel__collapsed-hint nook-fg-muted mt-1.5 text-[11px] leading-snug sm:mt-2">
          カテゴリ・スタイル・予算で、好みのムードに近づけられます。続けて選んでもまとめて反映されます。
        </p>
      ) : null}
      {showFilterBody ? (
        <div id="home-filters-body" className="home-filter-sheet mt-3 sm:mt-3.5">
          <CategoryFilter />
          <StyleTagFilter />
          <PriceFilter />
        </div>
      ) : null}
    </section>
  );
}
