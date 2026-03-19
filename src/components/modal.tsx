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
        <label
          htmlFor={id}
          className="nook-post-modal-backdrop absolute inset-0 z-0 cursor-pointer backdrop-blur-[3px]"
          aria-label="モーダルを閉じる"
        />
        <div
          className="nook-post-modal-panel relative z-10 max-h-[90dvh] w-full max-w-lg overflow-auto rounded-t-[var(--radius-card)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 animate-fade-in sm:rounded-[var(--radius-card)] sm:p-6 sm:pb-6"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--hairline)",
            boxShadow: "var(--home-card-lift)",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="post-modal-desc"
        >
          <div
            className="mx-auto mb-3 h-1 w-9 shrink-0 rounded-full sm:hidden"
            style={{ background: "var(--border-subtle)" }}
            aria-hidden
          />
          <label
            htmlFor={id}
            className="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:opacity-80 sm:right-3 sm:top-3 sm:h-8 sm:w-8"
            style={{ color: "var(--text-muted)" }}
            aria-label="閉じる"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </label>
          <div className="relative z-0 pr-10 pt-1 sm:pr-0 sm:pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
