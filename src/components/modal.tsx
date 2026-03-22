"use client";

import { useEffect, useCallback } from "react";

export default function Modal({ id, children }: { id: string; children: React.ReactNode }) {
  const close = useCallback(() => {
    const checkbox = document.getElementById(id) as HTMLInputElement | null;
    if (checkbox) checkbox.checked = false;
  }, [id]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const checkbox = document.getElementById(id) as HTMLInputElement | null;
      if (checkbox?.checked) checkbox.checked = false;
    },
    [id]
  );

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
    return () => {
      observer.disconnect();
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleEscape);
    };
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
          className="nook-post-modal-panel relative z-10 flex max-h-[min(90dvh,720px)] w-full max-w-lg animate-fade-in flex-col overflow-hidden rounded-t-[var(--radius-card)] sm:max-h-[90dvh] sm:rounded-[var(--radius-card)]"
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
          <header
            className="relative z-20 flex shrink-0 items-center justify-end border-b px-4 py-2.5 sm:px-5 sm:py-3"
            style={{
              borderColor: "var(--hairline)",
              background: "var(--bg-raised)",
            }}
          >
            <span
              className="pointer-events-none absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full sm:hidden"
              style={{ background: "var(--border-subtle)" }}
              aria-hidden
            />
            <button
              type="button"
              onClick={close}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] active:scale-[0.96] sm:h-9 sm:w-9"
              style={{ color: "var(--text-muted)" }}
              aria-label="閉じる"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 sm:p-6 sm:pb-6 sm:pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
