"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import { buildHomeHref } from "@/lib/home-href";
import { parseStyleSlugsFromSearchParams } from "@/lib/feed-styles";
import { getCategoryLabel } from "@/lib/categories";
import { getStyleTagLabel } from "@/lib/style-tags";
import { hasActivePriceParams, labelForPriceSearchParams } from "@/lib/price-brackets";
import {
  getRecentSearchesServerSnapshot,
  getRecentSearchesSnapshot,
  saveRecentSearch,
  subscribeRecentSearches,
} from "@/lib/search-recent";

function ClearFiltersButton({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function clear() {
    startTransition(() => {
      router.push(
        buildHomeHref(searchParams, (p) => {
          p.delete("q");
          p.delete("category");
          p.delete("styles");
          p.delete("style");
          p.delete("feed");
          p.delete("minPrice");
          p.delete("maxPrice");
        })
      );
    });
  }

  return (
    <button
      type="button"
      onClick={clear}
      disabled={isPending}
      aria-busy={isPending}
      className={
        compact
          ? "home-sticky-search-clear shrink-0"
          : "home-top-search-clear shrink-0"
      }
    >
      {compact ? "すべてクリア" : "条件をすべてクリア"}
    </button>
  );
}

/** 適用中の条件（スティッキー内は横スクロールで縦を抑える §5.1） */
function ActiveFilterChips() {
  const searchParams = useSearchParams();

  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const following = searchParams.get("feed")?.trim() === "following";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const styles = parseStyleSlugsFromSearchParams({
    styles: searchParams.get("styles") ?? undefined,
    style: searchParams.get("style") ?? undefined,
  });

  const chips: { key: string; label: string; clearHref: string; ariaRemove: string }[] = [];

  if (q) {
    const short = q.length > 18 ? `${q.slice(0, 18)}…` : q;
    chips.push({
      key: "q",
      label: `「${short}」`,
      clearHref: buildHomeHref(searchParams, (p) => p.delete("q")),
      ariaRemove: `キーワード「${short}」を外す`,
    });
  }
  if (category) {
    const lab = getCategoryLabel(category);
    chips.push({
      key: "cat",
      label: lab,
      clearHref: buildHomeHref(searchParams, (p) => p.delete("category")),
      ariaRemove: `カテゴリ「${lab}」を外す`,
    });
  }
  for (const slug of styles) {
    const lab = getStyleTagLabel(slug);
    chips.push({
      key: `st-${slug}`,
      label: lab,
      clearHref: buildHomeHref(searchParams, (p) => {
        p.delete("style");
        const next = styles.filter((s) => s !== slug);
        if (next.length === 0) p.delete("styles");
        else p.set("styles", next.join(","));
      }),
      ariaRemove: `スタイル「${lab}」を外す`,
    });
  }
  const priceLab = labelForPriceSearchParams(minPrice, maxPrice);
  if (priceLab) {
    chips.push({
      key: "price",
      label: priceLab,
      clearHref: buildHomeHref(searchParams, (p) => {
        p.delete("minPrice");
        p.delete("maxPrice");
      }),
      ariaRemove: `価格帯「${priceLab}」を外す`,
    });
  }
  if (following) {
    chips.push({
      key: "feed",
      label: "フォロー中",
      clearHref: buildHomeHref(searchParams, (p) => p.delete("feed")),
      ariaRemove: "フォロー中の一覧をやめる",
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="home-active-chips-scroll mt-2">
      <ul className="home-active-chips-scroll__track" aria-label="いまの条件">
        {chips.map((c) => (
          <li key={c.key} className="shrink-0">
            <Link
              href={c.clearHref}
              scroll={false}
              className="nook-active-filter-chip inline-flex max-w-[11rem] items-center gap-1 px-2.5 py-1 transition active:scale-[0.98] sm:max-w-[14rem]"
              aria-label={c.ariaRemove}
            >
              <span className="min-w-0 truncate">{c.label}</span>
              <span className="shrink-0 text-[13px] leading-none opacity-45" aria-hidden>
                ×
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeywordSearch({ urlQuery, helpId }: { urlQuery: string; helpId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(urlQuery);
  const [isPending, startTransition] = useTransition();

  function applyQuery(trimmed: string) {
    startTransition(() => {
      router.push(
        buildHomeHref(searchParams, (p) => {
          if (trimmed) p.set("q", trimmed);
          else p.delete("q");
        })
      );
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    const hadQ = Boolean(searchParams.get("q")?.trim());
    if (!trimmed && !hadQ) return;
    if (trimmed) saveRecentSearch(trimmed);
    applyQuery(trimmed);
  }

  function handleClearInput() {
    setQuery("");
    startTransition(() => {
      router.push(buildHomeHref(searchParams, (p) => p.delete("q")));
    });
  }

  const hasQueryText = query.trim().length > 0;

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      aria-labelledby="home-search-label"
      aria-busy={isPending}
      className="min-w-0 flex-1"
    >
      <div
        className={`search-field w-full sm:min-h-[2.5rem] ${isPending ? "search-field--pending" : ""}`}
      >
        <span className="search-field__icon pl-0.5" aria-hidden>
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" style={{ color: "var(--text-muted)" }}>
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ムード・部屋のキーワード…"
          className="input-feed"
          aria-label="キーワードで部屋を探す"
          aria-describedby={helpId}
          disabled={isPending}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {hasQueryText ? (
          <button
            type="button"
            onClick={handleClearInput}
            className="search-clear-btn"
            style={{ color: "var(--text-muted)" }}
            aria-label="入力をクリア"
          >
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
        <button type="submit" disabled={isPending} className="search-submit disabled:opacity-40" aria-label="検索">
          <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </form>
  );
}

/**
 * スティッキー外：最近のキーワードのみ（固定帯の縦を食わない §5.1）
 */
export function HomeRecentSearchRow() {
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q")?.trim() ?? "";
  const recentJson = useSyncExternalStore(
    subscribeRecentSearches,
    getRecentSearchesSnapshot,
    getRecentSearchesServerSnapshot
  );
  let recent: string[] = [];
  try {
    const parsed = JSON.parse(recentJson) as unknown;
    if (Array.isArray(parsed)) {
      recent = parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    }
  } catch {
    recent = [];
  }

  if (urlQ || recent.length === 0) return null;

  return (
    <section className="home-recent-search-row" aria-label="最近のキーワード">
      <p className="home-recent-search-row__label">最近</p>
      <div className="home-recent-search-row__scroll nook-hscroll-mask" role="list">
        {recent.map((r) => (
          <Link
            key={r}
            href={buildHomeHref(searchParams, (p) => p.set("q", r.trim()))}
            scroll={false}
            role="listitem"
            className="home-recent-pill shrink-0 active:scale-[0.98]"
          >
            {r}
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * 操作層：検索＋条件チップのみ。線と文字を基調、縦を最小に（product-vision §5.1）
 */
export default function HomeTopSearch() {
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const following = searchParams.get("feed")?.trim() === "following";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const styles = parseStyleSlugsFromSearchParams({
    styles: searchParams.get("styles") ?? undefined,
    style: searchParams.get("style") ?? undefined,
  });
  const hasFilter = Boolean(
    urlQ.trim() ||
      category ||
      styles.length > 0 ||
      following ||
      hasActivePriceParams(minPrice, maxPrice)
  );

  return (
    <section className="home-sticky-search" aria-label="さがす">
      <p id="home-search-help" className="sr-only">
        部屋のタイトル・説明・スタイルタグで検索できます。Enter または「検索」で確定します。
      </p>
      <p id="home-search-label" className="sr-only">
        キーワードで部屋を探す
      </p>
      <div className="flex items-start gap-2 sm:items-center sm:gap-3">
        <KeywordSearch key={urlQ} urlQuery={urlQ} helpId="home-search-help" />
        {hasFilter ? <ClearFiltersButton compact /> : null}
      </div>
      <ActiveFilterChips />
    </section>
  );
}
