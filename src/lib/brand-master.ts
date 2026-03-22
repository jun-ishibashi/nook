/**
 * 薄いブランドマスタ（サジェスト・任意 slug のみ。自由入力は常に可）
 * 表記ゆれ・検索用。網羅や百科は狙わない。
 */

export type BrandMasterEntry = {
  /** 内部キー（英小文字・ハイフン） */
  slug: string;
  /** 表示の正（主に日本語） */
  label: string;
  /** 検索・入力マッチ用（小文字化して比較） */
  aliases: string[];
};

const RAW: BrandMasterEntry[] = [
  { slug: "muji", label: "無印良品", aliases: ["無印", "muji", "ムジ", "良品計画"] },
  { slug: "ikea", label: "IKEA", aliases: ["ikea", "イケア", "イーケア"] },
  { slug: "nitori", label: "ニトリ", aliases: ["nitori", "似鳥"] },
  { slug: "francfranc", label: "Francfranc", aliases: ["francfranc", "フランフラン"] },
  { slug: "unico", label: "unico", aliases: ["ウニコ", "UNICO"] },
  { slug: "lowya", label: "LOWYA", aliases: ["lowya", "ロウヤ"] },
  { slug: "shimamura", label: "島忠", aliases: ["島忠", "shimamura", "しまむらホームズ"] },
  { slug: "cainz", label: "カインズ", aliases: ["cainz", "カインズホーム"] },
  { slug: "konan", label: "コーナン", aliases: ["konan", "コーナン商事"] },
  { slug: "dcm", label: "DCM", aliases: ["dcm", "ダイキ", "ホーマック"] },
  { slug: "yamada", label: "ヤマダデンキ", aliases: ["yamada", "ヤマダ電機", "labi", "ラビ"] },
  { slug: "bic-camera", label: "ビックカメラ", aliases: ["bic", "ビック", "biccamera"] },
  { slug: "yodobashi", label: "ヨドバシカメラ", aliases: ["yodobashi", "ヨドバシ"] },
  { slug: "hands", label: "東急ハンズ", aliases: ["hands", "ハンズ", "tokyu hands"] },
  { slug: "loft", label: "ロフト", aliases: ["loft", "ロフト"] },
  { slug: "acty", label: "ACTUS", aliases: ["actus", "アクタス"] },
  { slug: "boconcept", label: "BoConcept", aliases: ["boconcept", "ボーコンセプト"] },
  { slug: "crim", label: "クリム", aliases: ["crim", "krim"] },
  { slug: "idee", label: "IDEE", aliases: ["idee", "イデー"] },
  { slug: "karimoku", label: "カリモク", aliases: ["karimoku", "カリモク家具"] },
  { slug: "hida", label: "飛騨産業", aliases: ["hida", "hidakagu", "飛騨家具"] },
  { slug: "kashiwa", label: "柏木工", aliases: ["kashiwa", "カシワ"] },
  { slug: "maruni", label: "マルニ木工", aliases: ["maruni", "マルニ"] },
  { slug: "journal-standard-furniture", label: "Journal Standard Furniture", aliases: ["jsf", "ジャーナルスタンダード", "ジャーナル スタンダード"] },
  { slug: "today-special", label: "TODAY'S SPECIAL", aliases: ["todays special", "トゥデイズスペシャル"] },
  { slug: "crash-gate", label: "CRASH GATE", aliases: ["crash gate", "クラッシュゲート"] },
  { slug: "air-rhizome", label: "エア・リゾーム インテリア", aliases: ["エアリゾーム", "air rhizome"] },
  { slug: "tansu-no-gen", label: "タンスのゲン", aliases: ["タンスのゲン", "tansu"] },
  { slug: "yamazen", label: "山善", aliases: ["yamazen", "ヤマゼン"] },
  { slug: "herman-miller", label: "Herman Miller", aliases: ["herman miller", "ハーマンミラー"] },
  { slug: "steelcase", label: "Steelcase", aliases: ["steelcase", "スチールケース"] },
  { slug: "okamura", label: "オカムラ", aliases: ["okamura", "岡村製作所"] },
  { slug: "kokuyo", label: "コクヨ", aliases: ["kokuyo", "コクヨインテリア"] },
  { slug: "platz", label: "プラッツ", aliases: ["platz"] },
  { slug: "3coins", label: "3COINS", aliases: ["3coins", "スリーコインズ", "サンコインズ"] },
  { slug: "standard-products", label: "Standard Products", aliases: ["standard products", "スタンダードプロダクツ"] },
  { slug: "salut", label: "salut!", aliases: ["salut", "サリュ"] },
  { slug: "natural-kitchen", label: "ナチュラルキッチン", aliases: ["natural kitchen"] },
  { slug: "dinos", label: "ディノス", aliases: ["dinos", "ディノス"] },
  { slug: "belle-maison", label: "ベルメゾン", aliases: ["belle maison", "千趣会"] },
  { slug: "roomclip-shop", label: "RoomClip Shop", aliases: ["roomclip"] },
  { slug: "amazon", label: "Amazon", aliases: ["amazon", "アマゾン"] },
  { slug: "rakuten", label: "楽天市場", aliases: ["楽天", "rakuten"] },
  { slug: "mercari", label: "メルカリ", aliases: ["mercari", "メルカリshops"] },
  { slug: "second-street", label: "セカンドストリート", aliases: ["2nd street", "セカスト"] },
  { slug: "hard-off", label: "ハードオフ", aliases: ["hard off", "オフハウス"] },
  { slug: "muji-renovation", label: "MUJI INFILL", aliases: ["infill", "muji infill"] },
];

const SLUG_SET = new Set(RAW.map((e) => e.slug));

/** 全エントリ（読み取り専用） */
export const BRAND_MASTER: readonly BrandMasterEntry[] = RAW;

export function isKnownBrandSlug(slug: string): boolean {
  return SLUG_SET.has(slug.trim());
}

export function findBrandBySlug(slug: string): BrandMasterEntry | undefined {
  const s = slug.trim();
  return RAW.find((e) => e.slug === s);
}

/** 表示用ラベル一覧（サジェスト） */
export function brandMasterLabelsSorted(): string[] {
  return [...new Set(RAW.map((e) => e.label))].sort((a, b) => a.localeCompare(b, "ja"));
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** クエリに部分一致する候補（label 優先、最大件数） */
export function filterBrandSuggestions(query: string, limit = 12): BrandMasterEntry[] {
  const q = norm(query);
  if (!q) return RAW.slice(0, limit);
  const scored: { e: BrandMasterEntry; score: number }[] = [];
  for (const e of RAW) {
    const ln = norm(e.label);
    if (ln.includes(q) || ln === q) {
      scored.push({ e, score: ln === q ? 0 : ln.startsWith(q) ? 1 : 2 });
      continue;
    }
    if (e.aliases.some((a) => norm(a).includes(q) || norm(a) === q)) {
      scored.push({ e, score: 3 });
    }
  }
  scored.sort((a, b) => a.score - b.score || a.e.label.localeCompare(b.e.label, "ja"));
  const seen = new Set<string>();
  const out: BrandMasterEntry[] = [];
  for (const { e } of scored) {
    if (seen.has(e.slug)) continue;
    seen.add(e.slug);
    out.push(e);
    if (out.length >= limit) break;
  }
  return out;
}

/** 自由入力文字列がマスタと一致すれば正規化（完全一致・別名） */
export function matchBrandFromFreeText(brand: string): BrandMasterEntry | undefined {
  const b = norm(brand);
  if (!b) return undefined;
  for (const e of RAW) {
    if (norm(e.label) === b) return e;
    if (e.aliases.some((a) => norm(a) === b)) return e;
  }
  return undefined;
}

/** 検索 q から当たりうる slug（部分一致・ラベル・別名） */
export function brandSlugsMatchingSearch(q: string): string[] {
  const ql = norm(q);
  if (!ql) return [];
  const set = new Set<string>();
  for (const e of RAW) {
    if (norm(e.label).includes(ql) || e.slug.includes(ql)) {
      set.add(e.slug);
      continue;
    }
    if (e.aliases.some((a) => norm(a).includes(ql))) set.add(e.slug);
  }
  return [...set];
}

export type NormalizedBrandFields = { brand: string; brandSlug: string };

/**
 * API 用：クライアントの brand / brandSlug を保存値に正規化
 * - 既知 slug なら label を正として brand を上書き
 * - それ以外は自由文に合わせ、別名完全一致なら slug 付与
 */
export function normalizeBrandForDb(brandRaw: string, brandSlugRaw: unknown): NormalizedBrandFields {
  const brandTrim = typeof brandRaw === "string" ? brandRaw.trim().slice(0, 80) : "";
  const slugTry = typeof brandSlugRaw === "string" ? brandSlugRaw.trim() : "";

  if (slugTry && isKnownBrandSlug(slugTry)) {
    const entry = findBrandBySlug(slugTry)!;
    return { brand: entry.label.slice(0, 80), brandSlug: slugTry };
  }

  const matched = matchBrandFromFreeText(brandTrim);
  if (matched) {
    return { brand: matched.label.slice(0, 80), brandSlug: matched.slug };
  }

  return { brand: brandTrim, brandSlug: "" };
}
