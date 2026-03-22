"use client";
import { useState, useEffect } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  const scrollTop = () => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollTop}
      className="nook-back-to-top fixed z-50 flex min-h-[var(--touch)] min-w-[var(--touch)] items-center justify-center rounded-full border nook-border-hairline transition duration-150 hover:opacity-90 active:scale-[0.98] animate-fade-in"
      aria-label="ページの先頭へ戻る"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </button>
  );
}
