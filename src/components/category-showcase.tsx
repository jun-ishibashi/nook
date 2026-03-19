import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import CategoryIcon from "./category-icon";

const displayCategories = CATEGORIES.filter((c) => c.value !== "other");

/** §6 モノトーン・コンクリムード：カテゴリは色面より線と余白で揃える */
export default function CategoryShowcase() {
  return (
    <div className="mb-7 sm:mb-8">
      <p className="nook-section-label mb-2">カテゴリからさがす</p>
      <div
        className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border sm:grid-cols-3"
        style={{ borderColor: "var(--hairline)", background: "var(--hairline)" }}
        role="navigation"
        aria-label="カテゴリで部屋をさがす"
      >
        {displayCategories.map((cat) => (
          <Link
            key={cat.value}
            href={`/?category=${cat.value}`}
            scroll={false}
            className="category-showcase-tile group flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 px-2 py-3 transition active:scale-[0.98] sm:min-h-[4.75rem]"
            style={{ background: "var(--bg-raised)" }}
          >
            <span className="transition group-hover:opacity-90" style={{ color: "var(--text-muted)" }}>
              <CategoryIcon value={cat.value} size={22} />
            </span>
            <span className="text-center text-[10px] font-medium leading-tight" style={{ color: "var(--text-secondary)" }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
