/**
 * 写真の空気感（ムード・プリセット）の定義。
 * ブラウザの CSS filter を組み合わせて「NOOK らしい」質感を実現します。
 */

export const IMAGE_MOODS = [
  {
    value: "",
    label: "Normal",
    description: "そのままの質感",
    filter: "none",
  },
  {
    value: "concrete",
    label: "Concrete",
    description: "無機質でクールな質感",
    filter: "brightness(1.05) contrast(1.1) saturate(0.8) hue-rotate(-5deg)",
  },
  {
    value: "ambient",
    label: "Ambient",
    description: "温かみのある柔らかな光",
    filter: "brightness(1.0) contrast(0.95) saturate(1.1) sepia(0.15) hue-rotate(-10deg)",
  },
  {
    value: "industrial",
    label: "Industrial",
    description: "重厚で深みのあるトーン",
    filter: "brightness(0.9) contrast(1.2) saturate(0.7) hue-rotate(5deg)",
  },
] as const;

export type ImageMoodValue = (typeof IMAGE_MOODS)[number]["value"];

export function getMoodFilter(value: string | null | undefined): string {
  if (!value) return "none";
  return IMAGE_MOODS.find((m) => m.value === value)?.filter ?? "none";
}

export function getMoodLabel(value: string | null | undefined): string {
  if (!value) return "Normal";
  return IMAGE_MOODS.find((m) => m.value === value)?.label ?? "Normal";
}
