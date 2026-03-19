"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";

export default function NavbarClient({
  postModalId,
  followFeedNewCount = 0,
}: {
  postModalId: string;
  followFeedNewCount?: number;
}) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <nav
      className="sticky top-0 z-40 backdrop-blur-lg"
      style={{ background: "var(--nav-surface)", borderBottom: "1px solid var(--hairline)" }}
      aria-label="メインナビゲーション"
    >
      <div className="nook-page flex h-14 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-base font-semibold tracking-tight transition hover:opacity-70"
          style={{ color: "var(--text)" }}
        >
          <Logo size={20} />
          NOOK
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          {session && followFeedNewCount > 0 && (
            <Link
              href="/?feed=following"
              className="inline-flex min-h-9 items-center gap-1.5 px-1 text-[11px] font-medium transition hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
              title="フォロー中の新着"
              aria-label={`フォロー中の新着 ${followFeedNewCount > 99 ? "99件以上" : `${followFeedNewCount}件`}`}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--signal-soft)" }} aria-hidden />
              <span className="max-[380px]:sr-only" style={{ color: "var(--text-secondary)" }}>
                新着
              </span>
              <span className="tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {followFeedNewCount > 99 ? "99+" : followFeedNewCount}
              </span>
            </Link>
          )}
          {session && (
            <label
              htmlFor={postModalId}
              className="inline-flex min-h-9 cursor-pointer items-center gap-1 px-2 text-[11px] font-medium underline decoration-transparent underline-offset-4 transition hover:decoration-[var(--text-faint)] active:scale-[0.98]"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="sr-only">写真を</span>載せる
            </label>
          )}
          {status === "loading" ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--bg-sunken)" }}>
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--text-muted)" }} />
            </span>
          ) : session ? (
            <div className="relative" ref={ref}>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label="メニュー"
                className="flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition hover:opacity-90"
                style={{
                  background: "var(--bg-raised)",
                  borderColor: "var(--hairline)",
                  color: "var(--text-secondary)",
                }}
              >
                {session.user?.name?.[0] ?? "?"}
              </button>
              {open && (
                <ul
                  className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-[var(--radius-card)] py-1 shadow-[var(--home-tile-shadow)] animate-fade-in"
                  style={{ background: "var(--bg-raised)", border: "1px solid var(--hairline)" }}
                  role="menu"
                >
                  <li className="px-4 py-3" style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {session.user?.name}
                    </p>
                    <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {session.user?.email}
                    </p>
                  </li>
                  <li role="none">
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-3 text-sm transition"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={() => setOpen(false)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-sunken)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      マイページ
                    </Link>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-sunken)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      ログアウト
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 shrink-0 items-center justify-center px-3 text-[11px] font-medium underline decoration-transparent underline-offset-4 transition hover:decoration-[var(--text-faint)]"
              style={{ color: "var(--text-secondary)" }}
            >
              ログイン
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          {!session && status !== "loading" && (
            <Link
              href="/login"
              className="inline-flex h-9 shrink-0 items-center justify-center px-3 text-[11px] font-medium underline decoration-transparent underline-offset-4 transition hover:decoration-[var(--text-faint)]"
              style={{ color: "var(--text-secondary)" }}
            >
              ログイン
            </Link>
          )}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full transition"
          style={{ color: "var(--text)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="メニュー"
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          )}
        </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="px-4 pb-5 pt-3 sm:hidden animate-fade-in" style={{ borderTop: "1px solid var(--hairline)", background: "var(--bg)" }}>
          {session ? (
            <>
              <div className="mb-3 pb-3" style={{ borderBottom: "1px solid var(--hairline)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {session.user?.name}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {session.user?.email}
                </p>
                {followFeedNewCount > 0 && (
                  <Link
                    href="/?feed=following"
                    className="mt-2 inline-flex items-center gap-2 text-[11px] font-medium"
                    style={{ color: "var(--text-muted)" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--signal-soft)" }} aria-hidden />
                    フォロー新着
                    <span className="tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {followFeedNewCount > 99 ? "99+" : followFeedNewCount}
                    </span>
                  </Link>
                )}
              </div>
              <label htmlFor={postModalId} className="flex w-full min-h-11 cursor-pointer items-center rounded-md px-3 py-2.5 text-sm font-medium transition hover:bg-[var(--bg-sunken)]" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}><span className="sr-only">写真を</span>載せる</label>
              <Link href="/dashboard" className="flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium transition hover:bg-[var(--bg-sunken)]" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}>マイページ</Link>
              <button type="button" className="flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--bg-sunken)]" style={{ color: "var(--text-secondary)" }} onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}>ログアウト</button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-primary mt-1 w-full justify-center py-3 text-xs"
              onClick={() => setMobileOpen(false)}
            >
              ログインして写真を載せる
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
