"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { NOOK_POST_MODAL_CLOSE_EVENT } from "@/lib/nook-modal";

/** モバイル: シート上部を下にスワイプして閉じる（§5 操作は軽く） */
const SWIPE_CLOSE_MIN_DY_PX = 72;

export default function Modal({ id, children }: { id: string; children: React.ReactNode }) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const sheetTouchStartY = useRef<number | null>(null);

  const syncCheckbox = useCallback((v: boolean) => {
    const cb = checkboxRef.current;
    if (cb && cb.checked !== v) cb.checked = v;
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      syncCheckbox(next);
    },
    [syncCheckbox]
  );

  useEffect(() => {
    function onProgrammaticClose() {
      setOpen(false);
      syncCheckbox(false);
    }
    window.addEventListener(NOOK_POST_MODAL_CLOSE_EVENT, onProgrammaticClose);
    return () => window.removeEventListener(NOOK_POST_MODAL_CLOSE_EVENT, onProgrammaticClose);
  }, [syncCheckbox]);

  const onSheetSwipeTouchStart = useCallback((e: React.TouchEvent) => {
    sheetTouchStartY.current = e.touches[0]?.clientY ?? null;
  }, []);

  const onSheetSwipeTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (sheetTouchStartY.current === null) return;
      const startY = sheetTouchStartY.current;
      sheetTouchStartY.current = null;
      const endY = e.changedTouches[0]?.clientY;
      if (endY === undefined) return;
      const dy = endY - startY;
      if (dy > SWIPE_CLOSE_MIN_DY_PX) handleOpenChange(false);
    },
    [handleOpenChange]
  );

  const onSheetSwipeTouchCancel = useCallback(() => {
    sheetTouchStartY.current = null;
  }, []);

  return (
    <div className="contents">
      <input
        ref={checkboxRef}
        id={id}
        type="checkbox"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => setOpen(e.currentTarget.checked)}
      />
      <Dialog.Root open={open} onOpenChange={handleOpenChange} modal>
        <Dialog.Portal>
          <Dialog.Overlay
            className="nook-post-modal-backdrop fixed inset-0 z-50 cursor-pointer backdrop-blur-[3px]"
            aria-hidden
          />
          <Dialog.Content
            className="nook-radix-dialog-content nook-modal-dialog-surface nook-post-modal-panel fixed bottom-0 left-0 right-0 z-50 flex max-h-[min(90dvh,720px)] w-full max-w-lg animate-fade-in flex-col overflow-hidden rounded-t-[var(--radius-card)] outline-none focus:outline-none sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90dvh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[var(--radius-card)]"
            onPointerDownOutside={(e) => {
              const t = e.target as HTMLElement | null;
              if (t?.closest?.('[data-radix-popper-content-wrapper]')) {
                e.preventDefault();
              }
            }}
            onInteractOutside={(e) => {
              const t = e.target as HTMLElement | null;
              if (t?.closest?.('[data-radix-popper-content-wrapper]')) {
                e.preventDefault();
              }
            }}
          >
            <Dialog.Title className="sr-only">写真を載せる</Dialog.Title>
            <header className="nook-modal-header-surface relative z-20 flex min-h-[3.25rem] shrink-0 items-center justify-end border-b px-4 py-2.5 sm:min-h-0 sm:px-5 sm:py-3">
              <div
                className="absolute left-0 top-0 z-[1] flex h-[3.25rem] w-[calc(100%-3.5rem)] touch-none items-start justify-center pt-2.5 sm:hidden"
                onTouchStart={onSheetSwipeTouchStart}
                onTouchEnd={onSheetSwipeTouchEnd}
                onTouchCancel={onSheetSwipeTouchCancel}
                aria-hidden
              >
                <span className="nook-modal-drag-indicator pointer-events-none mt-0.5 h-1 w-10 shrink-0 rounded-full" />
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="nook-fg-muted relative z-10 flex min-h-[var(--touch)] min-w-[var(--touch)] shrink-0 items-center justify-center rounded-full transition hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] active:scale-[0.96] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                  aria-label="閉じる"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </Dialog.Close>
            </header>
            <div
              data-modal-body
              className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 sm:p-6 sm:pb-6 sm:pt-4"
            >
              {children}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
