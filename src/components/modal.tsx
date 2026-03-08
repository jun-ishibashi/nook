"use client";

import { useEffect, useCallback } from "react";

export default function Modal({ id, children }: { id: string; children: React.ReactNode }) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    const checkbox = document.getElementById(id) as HTMLInputElement | null;
    if (checkbox?.checked) checkbox.checked = false;
  }, [id]);

  useEffect(() => {
    const checkbox = document.getElementById(id) as HTMLInputElement | null;
    if (!checkbox) return;
    const observer = new MutationObserver(() => {
      if (checkbox.checked) {
        document.body.classList.add("modal-open");
        document.addEventListener("keydown", handleEscape);
      } else {
        document.body.classList.remove("modal-open");
        document.removeEventListener("keydown", handleEscape);
      }
    });
    observer.observe(checkbox, { attributes: true, attributeFilter: ["checked"] });
    if (checkbox.checked) {
      document.body.classList.add("modal-open");
      document.addEventListener("keydown", handleEscape);
    }
    return () => { observer.disconnect(); document.body.classList.remove("modal-open"); document.removeEventListener("keydown", handleEscape); };
  }, [id, handleEscape]);

  return (
    <div className="contents">
      <input type="checkbox" id={id} className="peer sr-only" aria-hidden />
      <div className="fixed inset-0 z-50 hidden items-end justify-center sm:items-center sm:p-4 peer-checked:flex">
        <label htmlFor={id} className="absolute inset-0 z-0 cursor-pointer backdrop-blur-sm" style={{ background: "rgba(44,40,37,0.4)" }} aria-label="モーダルを閉じる" />
        <div
          className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-3xl p-6 shadow-2xl animate-fade-in sm:rounded-3xl"
          style={{ background: "var(--bg-raised)" }}
          role="dialog" aria-modal="true" aria-labelledby="modal-title"
        >
          <label
            htmlFor={id}
            className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition"
            style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}
            aria-label="閉じる"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </label>
          {children}
        </div>
      </div>
    </div>
  );
}
