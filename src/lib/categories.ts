export const CATEGORIES = [
  { value: "living", label: "リビング" },
  { value: "bedroom", label: "寝室" },
  { value: "kitchen", label: "キッチン" },
  { value: "dining", label: "ダイニング" },
  { value: "study", label: "書斎" },
  { value: "oneroom", label: "ワンルーム" },
  { value: "bathroom", label: "バスルーム" },
  { value: "entrance", label: "玄関・廊下" },
  { value: "balcony", label: "ベランダ" },
  { value: "other", label: "その他" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "その他";
}
