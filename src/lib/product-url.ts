/**
 * 家具アイテムの商品ページ URL を表示・検証用に正規化（信頼表示・別タブ導線用）
 */
export type ProductUrlMeta = {
  /** 表示用（www. は省略可） */
  displayHost: string;
  /** 実際に開く href */
  href: string;
  /** https か（http のとき弱い注意表示用） */
  isSecure: boolean;
};

/** DB 用：表示ホストと同一の正規化（www. 除去・小文字） */
export function getProductUrlHost(raw: string): string | null {
  return getProductUrlMeta(raw)?.displayHost ?? null;
}

export function getProductUrlMeta(raw: string): ProductUrlMeta | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    if (!host) return null;
    const displayHost = host.startsWith("www.") ? host.slice(4) : host;
    const isSecure = u.protocol === "https:";
    return { displayHost, href: u.href, isSecure };
  } catch {
    return null;
  }
}
