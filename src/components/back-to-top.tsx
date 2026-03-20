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

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed z-50 flex h-11 w-11 items-center justify-center rounded-full border transition duration-150 hover:opacity-90 active:scale-[0.98] animate-fade-in"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        right: "max(1.25rem, env(safe-area-inset-right, 0px))",
        background: "var(--bg-raised)",
        borderColor: "var(--hairline)",
        color: "var(--text-secondary)",
        boxShadow: "var(--home-tile-shadow)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      aria-label="ページの先頭へ戻る"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </button>
  );
}
