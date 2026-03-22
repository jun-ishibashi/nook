"use client";

import { CATEGORIES } from "@/lib/categories";
import CategoryIcon from "@/components/category-icon";
import { useHomeFilterDraft } from "@/components/home-filter-draft";

export default function CategoryFilter() {
  const { draft, setCategory, isPending } = useHomeFilterDraft();
  const current = draft.category;

  return (
    <div className="flex flex-col gap-1" aria-busy={isPending}>
      <p className="nook-overline nook-overline--sentence mb-0">カテゴリ</p>
      <div className="flex gap-0 overflow-x-auto scrollbar-hide" role="tablist" aria-label="カテゴリ">
        <button
          type="button"
          role="tab"
          aria-selected={!current}
          onClick={() => setCategory("")}
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
            onClick={() => setCategory(cat.value)}
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
