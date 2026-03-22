"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FURNITURE_ITEM_PRICE_BRACKETS } from "@/lib/price-brackets";
import { buildHomeHref } from "@/lib/home-href";

export default function PriceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentMin = searchParams.get("minPrice");
  const currentMax = searchParams.get("maxPrice");

  function setPrice(min: number | null, max: number | null) {
    startTransition(() => {
      router.push(
        buildHomeHref(searchParams, (p) => {
          if (min !== null) p.set("minPrice", min.toString());
          else p.delete("minPrice");
          if (max !== null) p.set("maxPrice", max.toString());
          else p.delete("maxPrice");
        }),
        { scroll: false }
      );
    });
  }

  return (
    <div className={`price-filter ${isPending ? "pointer-events-none opacity-60" : ""}`} aria-busy={isPending}>
      <p className="nook-overline nook-overline--sentence mb-2">価格帯（家具・雑貨1件あたり）</p>
      <p id="price-filter-help" className="sr-only">
        家具・雑貨1件の参考価格の範囲を選ぶと、該当する部屋に絞り込みます。
      </p>
      <div
        className="-mx-1 flex gap-0 overflow-x-auto px-1 pb-0.5 scrollbar-hide"
        role="radiogroup"
        aria-label="価格帯で絞り込み"
        aria-describedby="price-filter-help"
      >
        {FURNITURE_ITEM_PRICE_BRACKETS.map((b) => {
          const minMatch = b.min === null ? !currentMin : currentMin === b.min.toString();
          const maxMatch = b.max === null ? !currentMax : currentMax === b.max.toString();
          const active = minMatch && maxMatch;

          return (
            <button
              key={b.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPrice(b.min, b.max)}
              className="filter-chip shrink-0 active:scale-[0.99] sm:active:scale-100"
            >
              {b.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
