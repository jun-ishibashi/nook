/** 家具1点あたりの価格レンジ（ホーム絞り込み・表示ラベル共通） */
export const FURNITURE_ITEM_PRICE_BRACKETS = [
  { label: "すべて", min: null, max: null },
  { label: "〜1万円", min: 0, max: 10000 },
  { label: "1〜5万円", min: 10000, max: 50000 },
  { label: "5〜20万円", min: 50000, max: 200000 },
  { label: "20万円〜", min: 200000, max: null },
] as const;

/** URL の minPrice / maxPrice がどのプリセットに一致するか。一致しなければ短文のフォールバック。 */
export function labelForPriceSearchParams(
  minPrice: string | null | undefined,
  maxPrice: string | null | undefined
): string | null {
  const currentMin = minPrice?.trim() ?? "";
  const currentMax = maxPrice?.trim() ?? "";
  if (!currentMin && !currentMax) return null;

  for (const b of FURNITURE_ITEM_PRICE_BRACKETS) {
    const minOk = b.min === null ? !currentMin : currentMin === String(b.min);
    const maxOk = b.max === null ? !currentMax : currentMax === String(b.max);
    if (minOk && maxOk) {
      return b.label === "すべて" ? null : b.label;
    }
  }

  const parts: string[] = [];
  if (currentMin) {
    const n = Number(currentMin);
    parts.push(Number.isFinite(n) ? `${n.toLocaleString("ja-JP")}円〜` : "");
  }
  if (currentMax) {
    const n = Number(currentMax);
    parts.push(Number.isFinite(n) ? `〜${n.toLocaleString("ja-JP")}円` : "");
  }
  const compact = parts.filter(Boolean).join(" ");
  return compact ? `価格 ${compact}` : "価格帯";
}

export function hasActivePriceParams(
  minPrice: string | null | undefined,
  maxPrice: string | null | undefined
): boolean {
  return Boolean(minPrice?.trim() || maxPrice?.trim());
}
