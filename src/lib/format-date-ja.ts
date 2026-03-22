/** 画面表示用の和暦風ロケール日付（サーバー/クライアント共通） */

export function formatLongDateJa(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

export function formatYearMonthJa(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
}
