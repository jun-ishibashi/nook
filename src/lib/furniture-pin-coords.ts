/** 家具の写真上ポイント（0〜1 正規化）。WEAR 系タグ付けと同じ考え方 */

export function clampPinUnit(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

/** API・フォームから受け取った値を null または [0,1] に */
export function parsePinCoordPair(
  pinX: unknown,
  pinY: unknown
): { pinX: number | null; pinY: number | null } {
  const x =
    typeof pinX === "number" && Number.isFinite(pinX) ? clampPinUnit(pinX) : null;
  const y =
    typeof pinY === "number" && Number.isFinite(pinY) ? clampPinUnit(pinY) : null;
  if (x === null || y === null) return { pinX: null, pinY: null };
  return { pinX: x, pinY: y };
}
