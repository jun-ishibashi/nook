/**
 * ログイン後に元の画面へ戻すための URL。
 * クライアントでは `usePathname()` の戻り値を渡す。
 */
export function loginCallbackHref(path: string | null | undefined): string {
  const safe = path?.trim() || "/";
  return `/login?callbackUrl=${encodeURIComponent(safe)}`;
}
