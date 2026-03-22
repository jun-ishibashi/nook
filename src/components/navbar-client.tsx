"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";

const ACCOUNT_MENU_ID = "navbar-account-menu";
const MOBILE_PANEL_ID = "navbar-mobile-panel";

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
      className="glass-surface sticky top-0 z-40"
      aria-label="メインナビゲーション"
    >
      <div className="nook-page flex h-14 items-center justify-between">
        <Link
          href="/"
          className="hover-glow nook-fg flex min-h-[var(--touch)] items-center gap-1.5 rounded-md px-2 py-1 text-base font-semibold tracking-tight transition hover:opacity-70 sm:min-h-0"
        >
          <Logo size={20} />
          NOOK
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          {session && followFeedNewCount > 0 && (
            <Link
              href="/?feed=following"
              className="nook-fg-muted inline-flex min-h-[var(--touch)] items-center gap-1.5 px-1 text-[11px] font-medium transition hover:opacity-80 sm:min-h-9"
              title="フォロー中の新着"
              aria-label={`フォロー中の新着 ${followFeedNewCount > 99 ? "99件以上" : `${followFeedNewCount}件`}`}
            >
              <span className="nook-signal-dot h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
              <span className="nook-fg-secondary max-[380px]:sr-only">新着</span>
              <span className="nook-fg-secondary tabular-nums">
                {followFeedNewCount > 99 ? "99+" : followFeedNewCount}
              </span>
            </Link>
          )}
          {session && (
            <label
              htmlFor={postModalId}
              className="nook-fg-secondary inline-flex min-h-[var(--touch)] cursor-pointer items-center gap-1 px-2 text-[11px] font-medium underline decoration-transparent underline-offset-4 transition hover:decoration-[var(--text-faint)] active:scale-[0.98] sm:min-h-9"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              写真を載せる
            </label>
          )}
          {status === "loading" ? (
            <span className="nook-bg-sunken flex h-10 w-10 items-center justify-center rounded-full sm:h-9 sm:w-9">
              <span className="nook-skeleton-pulse h-2 w-2 rounded-full" />
            </span>
          ) : session ? (
            <div className="relative" ref={ref}>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-haspopup="menu"
                {...(open ? { "aria-controls": ACCOUNT_MENU_ID } : {})}
                aria-label={`${session.user?.name ?? "アカウント"}のメニュー`}
                className="nook-nav-avatar-trigger flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition hover:opacity-90 sm:h-9 sm:w-9"
              >
                <span aria-hidden>{session.user?.name?.[0] ?? "?"}</span>
              </button>
              {open && (
                <ul
                  id={ACCOUNT_MENU_ID}
                  className="nook-menu-surface absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--home-tile-shadow)] animate-fade-in"
                  role="menu"
                >
                  <li className="nook-menu-header-row px-4 py-3.5">
                    <p className="nook-fg truncate text-sm font-bold">{session.user?.name}</p>
                    <p className="nook-fg-muted truncate text-[10px] uppercase tracking-wider">
                      {session.user?.email}
                    </p>
                  </li>
                  <li role="none">
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="nook-menu-item"
                      onClick={() => setOpen(false)}
                    >
                      マイページ
                    </Link>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="nook-menu-item w-full"
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
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
              className="nook-fg-secondary inline-flex min-h-[var(--touch)] shrink-0 items-center justify-center px-3 text-[11px] font-medium underline decoration-transparent underline-offset-4 transition hover:decoration-[var(--text-faint)] sm:min-h-9"
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
              className="nook-fg-secondary inline-flex min-h-[var(--touch)] shrink-0 items-center justify-center px-3 text-[11px] font-medium underline decoration-transparent underline-offset-4 transition hover:decoration-[var(--text-faint)]"
            >
              ログイン
            </Link>
          )}
          <button
            type="button"
            className="nook-fg flex h-10 w-10 items-center justify-center rounded-md transition sm:h-9 sm:w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            {...(mobileOpen ? { "aria-controls": MOBILE_PANEL_ID } : {})}
            aria-label={mobileOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id={MOBILE_PANEL_ID}
          className="nook-mobile-nav-sheet px-4 pb-5 pt-3 sm:hidden animate-fade-in"
          role="region"
          aria-label="モバイルメニュー"
        >
          {session ? (
            <>
              <div className="nook-mobile-nav-divider mb-3 pb-3">
                <p className="nook-fg text-sm font-semibold">{session.user?.name}</p>
                <p className="nook-fg-muted text-[11px]">{session.user?.email}</p>
                {followFeedNewCount > 0 && (
                  <Link
                    href="/?feed=following"
                    className="nook-fg-muted mt-2 inline-flex min-h-11 items-center gap-2 text-[11px] font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="nook-signal-dot h-1.5 w-1.5 rounded-full" aria-hidden />
                    フォロー新着
                    <span className="nook-fg-secondary tabular-nums">
                      {followFeedNewCount > 99 ? "99+" : followFeedNewCount}
                    </span>
                  </Link>
                )}
              </div>
              <label
                htmlFor={postModalId}
                className="nook-mobile-nav-row cursor-pointer"
                onClick={() => setMobileOpen(false)}
              >
                写真を載せる
              </label>
              <Link href="/dashboard" className="nook-mobile-nav-row" onClick={() => setMobileOpen(false)}>
                マイページ
              </Link>
              <button
                type="button"
                className="nook-mobile-nav-row"
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                ログアウト
              </button>
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
