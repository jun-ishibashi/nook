import { isValidStyleTagSlug } from "@/lib/style-tags";

/** URL の `styles`（カンマ区切り）とレガシー `style` を正規化（最大8・AND 用） */
export function parseStyleSlugsFromSearchParams(
  params: { styles?: string; style?: string }
): string[] {
  const raw = params.styles?.trim();
  if (raw) {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const part of raw.split(",")) {
      const s = part.trim();
      if (!s || !isValidStyleTagSlug(s) || seen.has(s)) continue;
      seen.add(s);
      out.push(s);
      if (out.length >= 8) break;
    }
    return out;
  }
  const one = params.style?.trim();
  if (one && isValidStyleTagSlug(one)) return [one];
  return [];
}
