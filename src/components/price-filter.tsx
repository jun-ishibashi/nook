"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PRICE_BRACKETS = [
  { label: "すべて", min: null, max: null },
  { label: "〜1万円", min: 0, max: 10000 },
  { label: "1〜5万円", min: 10000, max: 50000 },
  { label: "5〜20万円", min: 50000, max: 200000 },
  { label: "20万円〜", min: 200000, max: null },
];

export default function PriceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMin = searchParams.get("minPrice");
  const currentMax = searchParams.get("maxPrice");

  function setPrice(min: number | null, max: number | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (min !== null) params.set("minPrice", min.toString());
    else params.delete("minPrice");
    if (max !== null) params.set("maxPrice", max.toString());
    else params.delete("maxPrice");
    
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="price-filter">
      <p className="nook-overline nook-overline--sentence mb-2">価格帯（家具1点あたり）</p>
      <div className="-mx-1 flex gap-0 overflow-x-auto px-1 pb-0.5 scrollbar-hide" role="radiogroup" aria-label="価格帯で絞り込み">
        {PRICE_BRACKETS.map((b) => {
          const active = 
            (b.min === null ? !currentMin : currentMin === b.min.toString()) &&
            (b.max === null ? !currentMax : currentMax === b.max.toString());
          
          return (
            <button
              key={b.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPrice(b.min, b.max)}
              className="filter-chip shrink-0 text-[11px]"
            >
              {b.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
