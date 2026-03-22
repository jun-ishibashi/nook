"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { parseStyleSlugsFromSearchParams } from "@/lib/feed-styles";

const DEBOUNCE_MS = 300;

export type HomeFilterDraft = {
  category: string;
  styleSlugs: string[];
  minPrice: string | null;
  maxPrice: string | null;
};

function readDraft(sp: ReadonlyURLSearchParams): HomeFilterDraft {
  return {
    category: sp.get("category")?.trim() ?? "",
    styleSlugs: parseStyleSlugsFromSearchParams({
      styles: sp.get("styles") ?? undefined,
      style: sp.get("style") ?? undefined,
    }),
    minPrice: sp.get("minPrice"),
    maxPrice: sp.get("maxPrice"),
  };
}

function applyDraft(params: URLSearchParams, d: HomeFilterDraft) {
  if (d.category) params.set("category", d.category);
  else params.delete("category");

  params.delete("style");
  const sorted = [...new Set(d.styleSlugs)].filter(Boolean).sort();
  if (sorted.length > 0) params.set("styles", sorted.join(","));
  else params.delete("styles");

  if (d.minPrice) params.set("minPrice", d.minPrice);
  else params.delete("minPrice");
  if (d.maxPrice) params.set("maxPrice", d.maxPrice);
  else params.delete("maxPrice");
}

type Ctx = {
  draft: HomeFilterDraft;
  setCategory: (value: string) => void;
  toggleStyle: (slug: string) => void;
  clearStyles: () => void;
  setPriceBracket: (min: number | null, max: number | null) => void;
  /** パネルを閉じる直前など、保留中の変更をすぐ URL に反映する */
  flushNow: () => void;
  isPending: boolean;
};

const HomeFilterDraftContext = createContext<Ctx | null>(null);

export function useHomeFilterDraft() {
  const ctx = useContext(HomeFilterDraftContext);
  if (!ctx) throw new Error("useHomeFilterDraft must be used within HomeFilterDraftProvider");
  return ctx;
}

/**
 * カテゴリ・スタイル・価格の変更をローカルに溜め、短いデバウンスで 1 回の router.replace にまとめる。
 * 親で `key={searchParams.toString()}` を付け、URL が外から変わったときは状態をリセットする。
 */
export function HomeFilterDraftProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<HomeFilterDraft>(() => readDraft(searchParams));
  const [isPending, startTransition] = useTransition();

  const draftRef = useRef(draft);
  const spRef = useRef(searchParams);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    draftRef.current = draft;
    spRef.current = searchParams;
  }, [draft, searchParams]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const pushDraft = useCallback(() => {
    const p = new URLSearchParams(spRef.current.toString());
    applyDraft(p, draftRef.current);
    const qs = p.toString();
    startTransition(() => {
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    });
  }, [router, startTransition]);

  const schedulePush = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      pushDraft();
    }, DEBOUNCE_MS);
  }, [pushDraft]);

  const flushNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pushDraft();
  }, [pushDraft]);

  const setCategory = useCallback(
    (value: string) => {
      const next = { ...draftRef.current, category: value };
      draftRef.current = next;
      setDraft(next);
      schedulePush();
    },
    [schedulePush]
  );

  const toggleStyle = useCallback(
    (slug: string) => {
      const d = draftRef.current;
      const nextSet = new Set(d.styleSlugs);
      if (nextSet.has(slug)) nextSet.delete(slug);
      else nextSet.add(slug);
      const next = { ...d, styleSlugs: [...nextSet].sort() };
      draftRef.current = next;
      setDraft(next);
      schedulePush();
    },
    [schedulePush]
  );

  const clearStyles = useCallback(() => {
    const next = { ...draftRef.current, styleSlugs: [] };
    draftRef.current = next;
    setDraft(next);
    schedulePush();
  }, [schedulePush]);

  const setPriceBracket = useCallback(
    (min: number | null, max: number | null) => {
      const next = {
        ...draftRef.current,
        minPrice: min === null ? null : String(min),
        maxPrice: max === null ? null : String(max),
      };
      draftRef.current = next;
      setDraft(next);
      schedulePush();
    },
    [schedulePush]
  );

  const value = useMemo(
    () => ({
      draft,
      setCategory,
      toggleStyle,
      clearStyles,
      setPriceBracket,
      flushNow,
      isPending,
    }),
    [draft, setCategory, toggleStyle, clearStyles, setPriceBracket, flushNow, isPending]
  );

  return <HomeFilterDraftContext.Provider value={value}>{children}</HomeFilterDraftContext.Provider>;
}
