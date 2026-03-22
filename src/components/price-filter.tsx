"use client";

import { FURNITURE_ITEM_PRICE_BRACKETS } from "@/lib/price-brackets";
import { useHomeFilterDraft } from "@/components/home-filter-draft";

export default function PriceFilter() {
  const { draft, setPriceBracket, isPending } = useHomeFilterDraft();

  const currentMin = draft.minPrice;
  const currentMax = draft.maxPrice;

  return (
    <div className="price-filter" aria-busy={isPending}>
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
          const minMatch = b.min === null ? !currentMin : currentMin === String(b.min);
          const maxMatch = b.max === null ? !currentMax : currentMax === String(b.max);
          const active = minMatch && maxMatch;

          return (
            <button
              key={b.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPriceBracket(b.min, b.max)}
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
