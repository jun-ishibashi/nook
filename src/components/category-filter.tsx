"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { CATEGORIES } from "@/lib/categories";
import CategoryIcon from "@/components/category-icon";

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "";
  const [isPending, startTransition] = useTransition();

  function select(value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) { params.set("category", value); } else { params.delete("category"); }
      params.delete("q");
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <div
      className={`flex gap-1.5 overflow-x-auto scrollbar-hide ${isPending ? "opacity-60" : ""}`}
      role="tablist"
      aria-label="カテゴリ"
    >
      <button
        type="button"
        role="tab"
        aria-selected={!current}
        onClick={() => select("")}
        className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition"
        style={
          !current
            ? { background: "var(--bg-inverse)", color: "var(--text-inverse)" }
            : { background: "var(--bg-sunken)", color: "var(--text-muted)" }
        }
      >
        すべて
      </button>
      {CATEGORIES.filter((c) => c.value !== "other").map((cat) => (
        <button
          key={cat.value}
          type="button"
          role="tab"
          aria-selected={current === cat.value}
          onClick={() => select(cat.value)}
          className="flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition"
          style={
            current === cat.value
              ? { background: "var(--bg-inverse)", color: "var(--text-inverse)" }
              : { background: "var(--bg-sunken)", color: "var(--text-muted)" }
          }
        >
          <CategoryIcon value={cat.value} size={12} />
          {cat.label}
        </button>
      ))}
    </div>
  );
}
