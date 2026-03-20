"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FURNITURE_ITEM_PRICE_BRACKETS } from "@/lib/price-brackets";
import { buildHomeHref } from "@/lib/home-href";

export default function PriceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMin = searchParams.get("minPrice");
  const currentMax = searchParams.get("maxPrice");

  function setPrice(min: number | null, max: number | null) {
    router.push(
      buildHomeHref(searchParams, (p) => {
        if (min !== null) p.set("minPrice", min.toString());
        else p.delete("minPrice");
        if (max !== null) p.set("maxPrice", max.toString());
        else p.delete("maxPrice");
      }),
      { scroll: false }
    );
  }

  return (
    <div className="price-filter">
      <p className="nook-overline nook-overline--sentence mb-2">価格帯（家具1点あたり）</p>
      <div className="-mx-1 flex gap-0 overflow-x-auto px-1 pb-0.5 scrollbar-hide" role="radiogroup" aria-label="価格帯で絞り込み">
        {FURNITURE_ITEM_PRICE_BRACKETS.map((b) => {
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
