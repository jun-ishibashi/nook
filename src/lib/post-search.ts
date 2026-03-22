import { brandSlugsMatchingSearch } from "@/lib/brand-master";
import { CATEGORIES } from "@/lib/categories";
import { HOUSING_TYPES, LAYOUT_TYPES } from "@/lib/room-context";
import { STYLE_TAGS, STYLE_TAG_SEARCH_ALIASES } from "@/lib/style-tags";

/**
 * ホーム検索用: タイトル・説明・部屋の文脈メモに加え、
 * カテゴリ名/value・スタイルタグ・住まい種別・間取いラベル/value の部分一致でヒットさせる
 */
export function postSearchOrConditions(q: string): Record<string, unknown>[] {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const ql = trimmed.toLowerCase();
  const categoryMatches = CATEGORIES.filter(
    (c) => c.label.toLowerCase().includes(ql) || c.value.toLowerCase().includes(ql)
  ).map((c) => c.value);
  const styleSlugSet = new Set(
    STYLE_TAGS.filter(
      (t) => t.label.toLowerCase().includes(ql) || t.slug.toLowerCase().includes(ql)
    ).map((t) => t.slug)
  );
  for (const { alias, slug } of STYLE_TAG_SEARCH_ALIASES) {
    const al = alias.toLowerCase();
    const exact = ql === al;
    const sub =
      ql.length >= 2 && al.length >= 2 && (al.includes(ql) || ql.includes(al));
    if (exact || sub) {
      styleSlugSet.add(slug);
    }
  }
  const styleMatches = [...styleSlugSet];

  const housingMatches = HOUSING_TYPES.filter(
    (h) =>
      h.value !== "" &&
      (h.label.toLowerCase().includes(ql) || h.value.toLowerCase().includes(ql))
  ).map((h) => h.value);
  const layoutMatches = LAYOUT_TYPES.filter(
    (l) =>
      l.value !== "" &&
      (l.label.toLowerCase().includes(ql) || l.value.toLowerCase().includes(ql))
  ).map((l) => l.value);

  const or: Record<string, unknown>[] = [
    { title: { contains: trimmed } },
    { description: { contains: trimmed } },
    { roomContextNote: { contains: trimmed } },
  ];
  if (categoryMatches.length > 0) {
    or.push({ category: { in: categoryMatches } });
  }
  if (styleMatches.length > 0) {
    or.push({ styleTags: { some: { tagSlug: { in: styleMatches } } } });
  }
  if (housingMatches.length > 0) {
    or.push({ housingType: { in: housingMatches } });
  }
  if (layoutMatches.length > 0) {
    or.push({ layoutType: { in: layoutMatches } });
  }

  const brandSlugs = brandSlugsMatchingSearch(trimmed);
  if (brandSlugs.length > 0) {
    or.push({
      furnitureItems: { some: { brandSlug: { in: brandSlugs } } },
    });
  }
  or.push({
    furnitureItems: {
      some: { brand: { contains: trimmed, mode: "insensitive" } },
    },
  });

  return or;
}
