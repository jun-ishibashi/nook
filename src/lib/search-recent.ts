const STORAGE_KEY = "nook-recent-searches";
const MAX = 5;

/** 同一タブで `saveRecentSearch` 後に購読者へ伝える（キー名と別にする） */
const RECENT_SEARCHES_UPDATED = "nook-recent-searches-updated";

/** `useSyncExternalStore` 用（同一タブの更新も拾う） */
export function subscribeRecentSearches(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onStoreChange();
  };
  const onCustom = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(RECENT_SEARCHES_UPDATED, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RECENT_SEARCHES_UPDATED, onCustom);
  };
}

export function getRecentSearchesSnapshot(): string {
  return JSON.stringify(getRecentSearches());
}

export function getRecentSearchesServerSnapshot(): string {
  return "[]";
}

/** キーワード検索が成功したあとに呼ぶ（クライアントのみ） */
export function saveRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed || typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let list: string[] = [];
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        list = parsed.filter((x): x is string => typeof x === "string");
      }
    }
    list = [trimmed, ...list.filter((x) => x !== trimmed)].slice(0, MAX);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(RECENT_SEARCHES_UPDATED));
  } catch {
    /* ignore */
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, MAX);
  } catch {
    return [];
  }
}
