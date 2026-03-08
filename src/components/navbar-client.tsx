"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Logo from "./logo";

export default function NavbarClient({ postModalId }: { postModalId: string }) {
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
      style={{ background: "rgba(247,246,244,0.9)", borderBottom: "1px solid var(--border)" }}
      aria-label="メインナビゲーション"
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight transition hover:opacity-70"
          style={{ color: "var(--text)" }}
        >
          <Logo size={20} />
          NOOK
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          {session && (
            <label htmlFor={postModalId} className="btn-primary cursor-pointer text-xs">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              投稿する
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
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition hover:opacity-80"
                style={{ background: "var(--bg-inverse)", color: "var(--text-inverse)" }}
              >
                {session.user?.name?.[0] ?? "?"}
              </button>
              {open && (
                <ul
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-1 shadow-lg animate-fade-in"
                  style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
                  role="menu"
                >
                  <li className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{session.user?.name}</p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{session.user?.email}</p>
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
            <Link href="/login" className="btn-primary text-xs">ログイン</Link>
          )}
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full transition sm:hidden"
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

      {mobileOpen && (
        <div className="px-4 pb-5 pt-3 sm:hidden animate-fade-in" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-raised)" }}>
          {session ? (
            <>
              <div className="mb-3 pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{session.user?.name}</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{session.user?.email}</p>
              </div>
              <label htmlFor={postModalId} className="flex w-full cursor-pointer items-center rounded-xl px-3 py-3 text-sm font-medium transition" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}>投稿する</label>
              <Link href="/dashboard" className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium transition" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}>マイページ</Link>
              <button type="button" className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium transition" style={{ color: "var(--text-secondary)" }} onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}>ログアウト</button>
            </>
          ) : (
            <Link href="/login" className="btn-primary mt-1 w-full justify-center text-xs" onClick={() => setMobileOpen(false)}>ログイン</Link>
          )}
        </div>
      )}
    </nav>
  );
}
