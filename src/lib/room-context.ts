/** 部屋の文脈（任意）— 賃貸感・間取いなどを短く */

export const HOUSING_TYPES = [
  { value: "", label: "未設定" },
  { value: "rental", label: "賃貸" },
  { value: "owned", label: "持ち家" },
  { value: "dorm_share", label: "寮・シェア" },
] as const;

export const LAYOUT_TYPES = [
  { value: "", label: "未設定" },
  { value: "studio", label: "ワンルーム" },
  { value: "1k_1dk", label: "1K / 1DK" },
  { value: "1ldk", label: "1LDK" },
  { value: "2k_2dk", label: "2K / 2DK" },
  { value: "2ldk", label: "2LDK" },
  { value: "3ldk_plus", label: "3LDK〜" },
  { value: "other_layout", label: "その他" },
] as const;

const HOUSING_SET = new Set<string>(
  HOUSING_TYPES.filter((h) => h.value !== "").map((h) => h.value)
);
const LAYOUT_SET = new Set<string>(
  LAYOUT_TYPES.filter((l) => l.value !== "").map((l) => l.value)
);

export function normalizeHousingType(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "";
  return HOUSING_SET.has(raw) ? raw : "";
}

export function normalizeLayoutType(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "";
  return LAYOUT_SET.has(raw) ? raw : "";
}

export function normalizeRoomContextNote(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, 120);
}

export function getHousingLabel(value: string): string {
  return HOUSING_TYPES.find((h) => h.value === value)?.label ?? "";
}

export function getLayoutLabel(value: string): string {
  return LAYOUT_TYPES.find((l) => l.value === value)?.label ?? "";
}
