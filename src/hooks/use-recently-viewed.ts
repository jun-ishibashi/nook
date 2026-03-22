"use client";

import { useCallback, useSyncExternalStore } from "react";

export type RecentPost = {
  id: string;
  title: string;
  thumbnail: string | null;
  timestamp: number;
};

const STORAGE_KEY = "nook-recently-viewed-v1";
const MAX_RECENT = 12;

const EMPTY: RecentPost[] = [];
let cached: RecentPost[] = EMPTY;
let version = 0;
const listeners = new Set<() => void>();
let didScheduleHydrationLoad = false;

function loadFromStorage(): RecentPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed as RecentPost[];
  } catch {
    return EMPTY;
  }
}

function bump() {
  version += 1;
  listeners.forEach((l) => l());
}

function attachCrossTabSync() {
  if (typeof window === "undefined") return;
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cached = loadFromStorage();
    bump();
  });
}

let storageListenerAttached = false;

function subscribe(fn: () => void) {
  listeners.add(fn);
  if (typeof window === "undefined") {
    return () => listeners.delete(fn);
  }
  if (!storageListenerAttached) {
    storageListenerAttached = true;
    attachCrossTabSync();
  }
  if (!didScheduleHydrationLoad) {
    didScheduleHydrationLoad = true;
    queueMicrotask(() => {
      cached = loadFromStorage();
      bump();
    });
  }
  return () => {
    listeners.delete(fn);
  };
}

function getServerSnapshot(): RecentPost[] {
  return EMPTY;
}

function getClientSnapshot(): RecentPost[] {
  void version;
  return cached;
}

export function useRecentlyViewed() {
  const recentPosts = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const addPost = useCallback((post: Omit<RecentPost, "timestamp">) => {
    if (typeof window === "undefined") return;
    const prev = loadFromStorage();
    const filtered = prev.filter((p) => p.id !== post.id);
    const next = [{ ...post, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cached = next;
    bump();
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    cached = EMPTY;
    bump();
  }, []);

  return { recentPosts, addPost, clearRecentlyViewed };
}
