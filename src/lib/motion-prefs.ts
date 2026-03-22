/** クライアント専用。window 未確定時はアニメーションなし扱い。 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollElementIntoViewNearest(el: Element | null | undefined): void {
  if (!el) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "nearest",
  });
}

/** レイアウト確定後にスクロール（エラー表示直後など） */
export function requestScrollElementIntoViewNearest(
  el: Element | null | undefined
): number {
  if (!el || typeof window === "undefined") return 0;
  return window.requestAnimationFrame(() => {
    scrollElementIntoViewNearest(el);
  });
}
