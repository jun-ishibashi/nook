/** ムード / スタイルタグ（若年層・賃貸・コンクリ寄りの世界観用。ビジョンのキーワードと対応） */
export const STYLE_TAGS = [
  { slug: "concrete", label: "コンクリ" },
  { slug: "minimal", label: "ミニマル" },
  { slug: "monotone", label: "モノトーン" },
  { slug: "shio", label: "塩系" },
  { slug: "gray_tone", label: "グレー階調" },
  { slug: "compact", label: "コンパクト" },
  { slug: "industrial", label: "インダストリアル" },
  { slug: "korean", label: "韓国インテ" },
  { slug: "rental", label: "賃貸" },
  { slug: "diy", label: "DIY" },
  { slug: "plants", label: "観葉植物" },
  { slug: "coffee", label: "コーヒー" },
  { slug: "desk", label: "デスク" },
  { slug: "ambient_light", label: "間接照明" },
  { slug: "incense", label: "お香・アロマ" },
  { slug: "gadget", label: "ガジェット・家電" },
  { slug: "oneroom", label: "ワンルーム" },
  /** §6 語彙：一人暮らし・男の部屋の想像の軸・予算の入り口など */
  { slug: "solo_living", label: "一人暮らし" },
  { slug: "minimalist", label: "ミニマリスト" },
  { slug: "high_sense", label: "ハイセンス" },
  { slug: "mindful", label: "丁寧な暮らし" },
  { slug: "kodawari", label: "こだわり" },
  { slug: "fashion", label: "ファッション感" },
  { slug: "budget_retail", label: "ニトリ・IKEA" },
  { slug: "tidying", label: "掃除・整頓" },
  { slug: "warm", label: "ウォーム" },
  { slug: "cool", label: "クール" },
] as const;

export type StyleTagSlug = (typeof STYLE_TAGS)[number]["slug"];

const SLUG_SET = new Set<string>(STYLE_TAGS.map((t) => t.slug));

export function isValidStyleTagSlug(s: string): s is StyleTagSlug {
  return SLUG_SET.has(s);
}

export function normalizeStyleTagSlugs(input: unknown): StyleTagSlug[] {
  if (!Array.isArray(input)) return [];
  const out: StyleTagSlug[] = [];
  const seen = new Set<string>();
  for (const x of input) {
    if (typeof x !== "string" || !isValidStyleTagSlug(x) || seen.has(x)) continue;
    seen.add(x);
    out.push(x);
    if (out.length >= 8) break;
  }
  return out;
}

export function getStyleTagLabel(slug: string): string {
  return STYLE_TAGS.find((t) => t.slug === slug)?.label ?? slug;
}
