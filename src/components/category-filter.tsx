"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { CATEGORIES } from "@/lib/categories";
import { buildHomeHref } from "@/lib/home-href";
import CategoryIcon from "@/components/category-icon";

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "";
  const [isPending, startTransition] = useTransition();

  function select(value: string) {
    startTransition(() => {
      router.push(
        buildHomeHref(searchParams, (p) => {
          if (value) p.set("category", value);
          else p.delete("category");
        })
      );
    });
  }

  return (
    <div className={`flex flex-col gap-1 ${isPending ? "opacity-60" : ""}`} aria-busy={isPending}>
      <p className="nook-overline nook-overline--sentence mb-0">カテゴリ</p>
      <div className="flex gap-0 overflow-x-auto scrollbar-hide" role="tablist" aria-label="カテゴリ">
      <button
        type="button"
        role="tab"
        aria-selected={!current}
        onClick={() => select("")}
        className="filter-chip"
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
          className="filter-chip flex items-center gap-1"
        >
          <CategoryIcon value={cat.value} size={12} />
          {cat.label}
        </button>
      ))}
      </div>
    </div>
  );
}
