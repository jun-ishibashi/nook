/** 本番を検索エンジンに載せないとき `NO_INDEX_SITE=1` など（.env.example 参照） */

export function isSiteNoIndex(): boolean {
  const v = process.env.NO_INDEX_SITE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
