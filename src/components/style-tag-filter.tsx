"use client";

import { useMemo } from "react";
import { STYLE_TAGS_PICKER } from "@/lib/style-tags";
import { useHomeFilterDraft } from "@/components/home-filter-draft";

export default function StyleTagFilter() {
  const { draft, toggleStyle, clearStyles, isPending } = useHomeFilterDraft();

  const selected = useMemo(() => new Set(draft.styleSlugs), [draft.styleSlugs]);

  return (
    <div className="flex flex-col gap-1" aria-busy={isPending}>
      <p id="style-filter-hint" className="sr-only">
        スタイルを複数選ぶと、選んだタグがすべて付いた部屋だけが表示されます。続けて選んでも、少し待てばまとめて絞り込みます。
      </p>
      <p className="nook-overline nook-overline--sentence mb-0">スタイル</p>
      <p className="nook-fg-faint mb-1 nook-caption-sm">複数選ぶと、すべてに合う部屋だけ</p>
      <div
        className="flex gap-0 overflow-x-auto scrollbar-hide"
        role="group"
        aria-label="スタイル"
        aria-describedby="style-filter-hint"
      >
        <button
          type="button"
          aria-pressed={selected.size === 0}
          onClick={() => clearStyles()}
          className="filter-chip"
        >
          すべて
        </button>
        {STYLE_TAGS_PICKER.map((t) => {
          const on = selected.has(t.slug);
          return (
            <button
              key={t.slug}
              type="button"
              aria-pressed={on}
              onClick={() => toggleStyle(t.slug)}
              className="filter-chip"
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
