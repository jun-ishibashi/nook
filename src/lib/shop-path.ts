/** 同じショップ（ドメイン）の投稿一覧へ */
export function shopExploreHref(displayHost: string): string {
  return `/shop/${encodeURIComponent(displayHost)}`;
}

/**
 * `[host]` 動的ルートの生文字列をデコードし、安全ならホスト名を返す。
 * 不正・デコード失敗時は null。
 */
export function parseShopHostFromRouteParam(raw: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  return isSafeShopHostParam(decoded) ? decoded : null;
}

/** ルートパラメータから復元したホストが安全か（パストラバーサル等を弾く） */
export function isSafeShopHostParam(host: string): boolean {
  const h = host.trim().toLowerCase();
  if (h.length < 3 || h.length > 200) return false;
  if (h.includes("/") || h.includes("\\") || h.includes("..") || h.includes("@")) return false;
  return /^[a-z0-9][a-z0-9.-]*[a-z0-9]$|^[a-z0-9]$/.test(h);
}
