/**
 * スタイルタグ（[`docs/product-vision.md`](../../docs/product-vision.md) のコンセプト語彙と整合）。
 * 並びは「住まい→素材→暮らし→感性→エリア」の読みやすさ優先。
 * **slug は既存投稿と URL の正** — リネームは DB マイグレまたは互換レイヤが必要。
 */
export const STYLE_TAGS = [
  // —— 住まい・スケール（6.2 生活・スケール）
  { slug: "rental", label: "賃貸" },
  { slug: "oneroom", label: "ワンルーム" },
  { slug: "solo_living", label: "一人暮らし" },
  { slug: "compact", label: "コンパクト" },
  { slug: "minimalist", label: "ミニマリスト" },
  { slug: "minimal_volume", label: "物量すくなめ" },
  { slug: "minimal", label: "ミニマル" },

  // —— 素材・トーン（6.2 素材・トーン／6.3 コンクリート感＝ムード）
  { slug: "concrete", label: "コンクリ" },
  { slug: "mukishitsu", label: "無機質" },
  { slug: "gray_tone", label: "グレー階調" },
  { slug: "monotone", label: "モノトーン" },
  { slug: "shio", label: "塩系" },
  { slug: "industrial", label: "インダストリアル" },
  { slug: "warm", label: "ウォーム" },
  { slug: "cool", label: "クール" },

  // —— 生活のレイヤー（6.2 生活のレイヤー／モノ・知識感）
  { slug: "coffee", label: "コーヒー" },
  { slug: "plants", label: "観葉植物" },
  { slug: "desk", label: "デスク" },
  { slug: "ambient_light", label: "間接照明" },
  { slug: "incense", label: "お香・アロマ" },
  { slug: "reading", label: "読書" },
  { slug: "tidying", label: "掃除・整頓" },
  { slug: "gadget", label: "ガジェット・家電" },

  // —— 予算・手入れ（6.2 予算・入手。ブランド名タグは付けない — 6.1 注釈と同型）
  { slug: "budget_retail", label: "ニトリ・IKEA" },
  { slug: "budget_mix", label: "予算ミックス" },
  { slug: "diy", label: "DIY" },

  // —— 感性・価値観（6.2 感性・価値観）
  { slug: "high_sense", label: "ハイセンス" },
  { slug: "kodawari", label: "こだわり" },
  { slug: "mindful", label: "丁寧に生きる" },
  { slug: "kakkoii", label: "かっこいい" },
  { slug: "otokorashii", label: "男らしい" },

  // —— ファッション連動（6.2。モテ部屋＝俗称タグ）
  { slug: "fashion", label: "ファッション感" },
  { slug: "furugi", label: "古着" },
  { slug: "mens_stylish", label: "おしゃれ男子" },
  { slug: "mote_room", label: "モテ部屋" },

  // —— ライフ・属性参照（6.2。利用条件ラベルではない）
  { slug: "tokyo_student", label: "都内大学生" },
  { slug: "salaryman", label: "サラリーマン" },

  // —— エリア・ストリート（6.2。想起・活動圏のイメージ）
  { slug: "ikejiri", label: "池尻大橋" },
  { slug: "nakameguro", label: "中目黒" },
  { slug: "daikanyama", label: "代官山" },
  { slug: "shibuya", label: "渋谷" },
  { slug: "harajuku", label: "原宿" },
  { slug: "omotesando", label: "表参道" },
  { slug: "aoyama", label: "青山" },
  { slug: "yoyogi", label: "代々木" },
  { slug: "ura_harajuku", label: "裏原宿" },
  { slug: "ura_shibuya", label: "裏渋谷" },
  { slug: "sangenjaya", label: "三軒茶屋" },
  { slug: "shimokitazawa", label: "下北沢" },

  // —— 世界観の補助（6.2 表外だが若年層ニーズ。百科化しない）
  { slug: "korean", label: "韓国インテ" },
] as const;

export type StyleTagSlug = (typeof STYLE_TAGS)[number]["slug"];

/**
 * ラベル／部分一致で拾えない検索語（略称・英字・表記ゆれ）→ slug。
 * 照合は `post-search` で **完全一致** または **クエリ長 ≥ 2** のときのみ（1 文字誤爆防止）。
 */
export const STYLE_TAG_SEARCH_ALIASES: readonly { alias: string; slug: StyleTagSlug }[] = [
  { alias: "三茶", slug: "sangenjaya" },
  { alias: "観葉", slug: "plants" },
  { alias: "打ちっ放し", slug: "concrete" },
  { alias: "打ちっぱなし", slug: "concrete" },
  { alias: "コンクリート", slug: "concrete" },
  { alias: "韓イン", slug: "korean" },
  { alias: "ひとり暮らし", slug: "solo_living" },
  { alias: "ニトリ", slug: "budget_retail" },
  { alias: "ikea", slug: "budget_retail" },
  { alias: "イケア", slug: "budget_retail" },
  { alias: "物量少なめ", slug: "minimal_volume" },
  { alias: "物量すくなめ", slug: "minimal_volume" },
  { alias: "高低ミックス", slug: "budget_mix" },
  { alias: "高め安め", slug: "budget_mix" },
];

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
