/** 家具行の購入リンク透明性（任意） */

import { parseLocalISODate } from "@/lib/local-date";

export const COPY_FURNITURE_LINK_RELATION = "この商品ページは？";
export const COPY_FURNITURE_LINK_VERIFIED = "ページを確認した日";
export const COPY_FURNITURE_LINK_VERIFIED_EMPTY = "未入力";
export const COPY_FURNITURE_VERIFIED_AT_PREFIX = "確認した日";

export const FURNITURE_LINK_RELATIONS = [
  { value: "", label: "未設定", hint: "" },
  {
    value: "purchased",
    label: "このページのお店で買った",
    hint: "この商品ページのお店で、実際に買った（注文した）ものです。",
  },
  {
    value: "same_model",
    label: "同じ商品のページ（別の店で買ってもよい）",
    hint: "部屋にあるのと同じ品の公式ページや商品URLです。中古・別店舗で買った場合はこちらが近いです。",
  },
  {
    value: "reference",
    label: "参考（部屋のものと同じとは限らない）",
    hint: "雰囲気やサイズの参考用で、部屋のものと同じとは限りません。",
  },
] as const;

const RELATION_ALLOWED: Set<string> = new Set(
  FURNITURE_LINK_RELATIONS.filter((r) => r.value !== "").map((r) => r.value)
);

export function normalizeFurnitureLinkRelation(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "";
  return RELATION_ALLOWED.has(raw) ? raw : "";
}

export function getFurnitureLinkRelationLabel(value: string): string {
  return FURNITURE_LINK_RELATIONS.find((r) => r.value === value)?.label ?? "";
}

/** フォーム直下の短文説明用 */
export function getFurnitureLinkRelationHint(value: string): string {
  return FURNITURE_LINK_RELATIONS.find((r) => r.value === value)?.hint ?? "";
}

/** クライアントは YYYY-MM-DD。空なら null（未設定） */
export function parseLinkVerifiedDate(raw: unknown): Date | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

export function linkVerifiedAtToDateInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  const x = new Date(d);
  const y = x.getUTCFullYear();
  const mo = String(x.getUTCMonth() + 1).padStart(2, "0");
  const day = String(x.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export function formatLinkVerifiedAtJa(d: Date | null | undefined): string | null {
  if (!d) return null;
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}

/** フォームの YYYY-MM-DD（ローカル日付）を和文に。サマリー表示用 */
export function formatFurnitureLinkVerifiedInputJa(iso: string): string | null {
  const d = parseLocalISODate(iso.trim());
  if (!d) return null;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
