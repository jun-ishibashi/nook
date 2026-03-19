/**
 * 同一投稿者の連続を軽くほどく（新着順はなるべく維持・§8.1 フィードのミックスの最小版）
 */
export function breakConsecutiveSameAuthor<T extends { user: { id: string } }>(posts: T[]): T[] {
  if (posts.length < 3) return posts;
  const out = [...posts];
  for (let i = 1; i < out.length; i++) {
    if (out[i].user.id === out[i - 1].user.id) {
      const j = out.findIndex((p, k) => k > i && p.user.id !== out[i - 1].user.id);
      if (j !== -1) {
        const t = out[i];
        out[i] = out[j];
        out[j] = t;
      }
    }
  }
  return out;
}
