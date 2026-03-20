"use client";

import { useState, useEffect } from "react";

export type RecentPost = {
  id: string;
  title: string;
  thumbnail: string | null;
  timestamp: number;
};

const STORAGE_KEY = "nook-recently-viewed-v1";
const MAX_RECENT = 12;

export function useRecentlyViewed() {
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setRecentPosts(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  function addPost(post: Omit<RecentPost, "timestamp">) {
    setRecentPosts((prev) => {
      const filtered = prev.filter((p) => p.id !== post.id);
      const next = [{ ...post, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { recentPosts, addPost };
}
