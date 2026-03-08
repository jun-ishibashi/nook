"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import CategoryIcon from "./category-icon";

const TONES: Record<string, { bg: string; icon: string }> = {
  living:   { bg: "#eee9e2", icon: "#8a7e72" },
  bedroom:  { bg: "#e8e5ec", icon: "#7d7588" },
  kitchen:  { bg: "#ece5e2", icon: "#8a736e" },
  dining:   { bg: "#ebe8df", icon: "#857e6e" },
  study:    { bg: "#e3e8e2", icon: "#6e7d68" },
  oneroom:  { bg: "#e2e6ea", icon: "#6e7a84" },
  bathroom: { bg: "#e2eaeb", icon: "#6e8486" },
  entrance: { bg: "#e8e6e3", icon: "#7d7a74" },
  balcony:  { bg: "#e6e9e2", icon: "#7a836e" },
};

const displayCategories = CATEGORIES.filter((c) => c.value !== "other");

export default function CategoryShowcase() {
  return (
    <div className="mb-6">
      <div className="mb-3">
        <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>カテゴリから探す</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {displayCategories.map((cat) => {
          const tone = TONES[cat.value] ?? { bg: "var(--bg-sunken)", icon: "var(--text-muted)" };
          return (
            <Link
              key={cat.value}
              href={`/?category=${cat.value}`}
              className="group flex flex-col items-center gap-2 rounded-2xl px-3 py-4 transition hover:shadow-md active:scale-[0.97]"
              style={{ background: tone.bg }}
            >
              <div className="transition group-hover:scale-110" style={{ color: tone.icon }}>
                <CategoryIcon value={cat.value} size={28} />
              </div>
              <span className="text-[11px] font-bold" style={{ color: "var(--text-secondary)" }}>{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
