"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      if (query.trim()) {
        router.push(`/?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.push("/");
      }
    });
  }

  function handleClear() {
    setQuery("");
    startTransition(() => router.push("/"));
  }

  return (
    <form onSubmit={handleSearch} className="relative" role="search">
      <svg
        width="16" height="16" viewBox="0 0 18 18" fill="none"
        className="absolute left-3.5 top-1/2 -translate-y-1/2"
        style={{ color: "var(--text-muted)" }}
        aria-hidden
      >
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="キーワードで検索"
        className="input-base pl-10 pr-8 text-[13px]"
        aria-label="投稿を検索"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition"
          style={{ background: "var(--text-faint)", color: "var(--bg-raised)" }}
          aria-label="クリア"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </form>
  );
}
