import type { ReadonlyURLSearchParams } from "next/navigation";

/** ホーム（`/`）へ遷移する `href`。既存の query をコピーして `mutator` で書き換える。 */
export function buildHomeHref(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  mutator: (params: URLSearchParams) => void
): string {
  const params = new URLSearchParams(searchParams.toString());
  mutator(params);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}
