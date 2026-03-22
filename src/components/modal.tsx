"use client";

import { useEffect, useCallback, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isFocusableVisible(el: HTMLElement) {
  if (el.hasAttribute("disabled")) return false;
  const st = getComputedStyle(el);
  if (st.visibility === "hidden" || st.display === "none") return false;
  return el.getClientRects().length > 0;
}

export default function Modal({ id, children }: { id: string; children: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

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

  const handleTabTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const root = panelRef.current;
    const focusables = [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(isFocusableVisible);
    if (focusables.length === 0) return;
    if (focusables.length === 1) {
      e.preventDefault();
      focusables[0].focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    const checkbox = document.getElementById(id) as HTMLInputElement | null;
    if (!checkbox) return;

    let modalOpen = false;
    function setOpen(next: boolean) {
      if (next === modalOpen) return;
      modalOpen = next;
      if (next) {
        lastFocusRef.current = document.activeElement as HTMLElement | null;
        document.body.classList.add("modal-open");
        document.addEventListener("keydown", handleEscape);
        document.addEventListener("keydown", handleTabTrap);
        requestAnimationFrame(() => {
          const panel = panelRef.current;
          if (!panel) return;
          const body = panel.querySelector<HTMLElement>("[data-modal-body]");
          const scope = body ?? panel;
          const focusables = [...scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(isFocusableVisible);
          const toFocus = focusables[0] ?? panel.querySelector<HTMLElement>('[aria-label="閉じる"]');
          toFocus?.focus();
        });
      } else {
        document.body.classList.remove("modal-open");
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("keydown", handleTabTrap);
        const prev = lastFocusRef.current;
        lastFocusRef.current = null;
        if (prev && document.body.contains(prev)) prev.focus();
      }
    }

    const observer = new MutationObserver(() => {
      setOpen(checkbox.checked);
    });
    observer.observe(checkbox, { attributes: true, attributeFilter: ["checked"] });
    setOpen(checkbox.checked);
    return () => {
      observer.disconnect();
      setOpen(false);
    };
  }, [id, handleEscape, handleTabTrap]);

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
          ref={panelRef}
          className="nook-modal-dialog-surface nook-post-modal-panel relative z-10 flex max-h-[min(90dvh,720px)] w-full max-w-lg animate-fade-in flex-col overflow-hidden rounded-t-[var(--radius-card)] sm:max-h-[90dvh] sm:rounded-[var(--radius-card)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="post-modal-desc"
        >
          <header className="nook-modal-header-surface relative z-20 flex shrink-0 items-center justify-end border-b px-4 py-2.5 sm:px-5 sm:py-3">
            <span
              className="nook-modal-drag-indicator pointer-events-none absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full sm:hidden"
              aria-hidden
            />
            <button
              type="button"
              onClick={close}
              className="nook-fg-muted relative flex min-h-[var(--touch)] min-w-[var(--touch)] shrink-0 items-center justify-center rounded-full transition hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] active:scale-[0.96] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
              aria-label="閉じる"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          <div
            data-modal-body
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 sm:p-6 sm:pb-6 sm:pt-4"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
