/** フィード・一覧用の相対時刻（短文・§4）。カレンダー日で「昨日」などを出し、スキャンしやすくする */

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function formatFeedRelativeTime(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const t = date.getTime();
  if (Number.isNaN(t)) return "";

  const now = new Date();
  const nowMs = now.getTime();
  const diffMs = nowMs - t;
  if (diffMs < 0) {
    return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  }

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const calendarDayDiff = Math.round((startOfLocalDay(now) - startOfLocalDay(date)) / 86400000);

  if (diffMins < 1) return "たった今";

  if (calendarDayDiff === 0) {
    if (diffMins < 60) return `${diffMins}分`;
    return `${diffHours}時間`;
  }
  if (calendarDayDiff === 1) return "昨日";
  if (calendarDayDiff === 2) return "一昨日";
  if (calendarDayDiff < 7) return `${calendarDayDiff}日前`;
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}
