"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" ? "light" : "dark";
}

/** ダークモード中 = 月（夜）／ライト中 = 太陽（昼）— タップで反対側に切り替え */
function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // インライン script で先に data-theme が付くため、マウント時に DOM と揃える
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM の data-theme と React 状態を同期
    setTheme(readTheme());
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("nook-theme", next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--bg-sunken)] ${className}`}
      style={{
        background: "transparent",
        color: "var(--text-muted)",
      }}
      aria-label={theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      title={theme === "dark" ? "ライトモード" : "ダークモード"}
    >
      {theme === "dark" ? <IconMoon /> : <IconSun />}
    </button>
  );
}
