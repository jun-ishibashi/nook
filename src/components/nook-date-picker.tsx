"use client";

import * as Popover from "@radix-ui/react-popover";
import { useId, useMemo, useState } from "react";
import { parseLocalISODate, toLocalISODate } from "@/lib/local-date";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"] as const;

function monthGrid(year: number, month: number) {
  const mondayPad = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - mondayPad + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

function formatTriggerLabel(iso: string, emptyLabel: string) {
  if (!iso.trim()) return emptyLabel;
  const d = parseLocalISODate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Props = {
  value: string;
  onChange: (iso: string) => void;
  "aria-label": string;
  className?: string;
  /** 未選択時にボタンに出す文言（任意項目なら「未入力」など） */
  emptyLabel?: string;
  /** 空に戻す操作を出す（既定: true） */
  allowClear?: boolean;
};

export default function NookDatePicker({
  value,
  onChange,
  "aria-label": ariaLabel,
  className = "",
  emptyLabel = "日付を選ぶ",
  allowClear = true,
}: Props) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  const initialView = useMemo(() => {
    const d = parseLocalISODate(value) ?? new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  }, [value]);

  const [viewY, setViewY] = useState(initialView.y);
  const [viewM, setViewM] = useState(initialView.m);

  function openPanel() {
    const d = parseLocalISODate(value) ?? new Date();
    setViewY(d.getFullYear());
    setViewM(d.getMonth());
    setOpen(true);
  }

  const cells = useMemo(() => monthGrid(viewY, viewM), [viewY, viewM]);
  const monthTitle = new Date(viewY, viewM, 1).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });
  const today = new Date();
  const selected = parseLocalISODate(value);

  function shiftMonth(delta: number) {
    const d = new Date(viewY, viewM + delta, 1);
    setViewY(d.getFullYear());
    setViewM(d.getMonth());
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) setOpen(false);
      else openPanel();
    }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <Popover.Root
      modal={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          const d = parseLocalISODate(value) ?? new Date();
          setViewY(d.getFullYear());
          setViewM(d.getMonth());
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          id={`${panelId}-trigger`}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={panelId}
          aria-haspopup="dialog"
          onKeyDown={onTriggerKeyDown}
          className={`input-base flex min-h-[var(--touch)] w-full items-center justify-between gap-2 text-left shadow-none ${className}`}
        >
          <span className="min-w-0 truncate">{formatTriggerLabel(value, emptyLabel)}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="nook-fg-muted shrink-0"
            aria-hidden
          >
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          id={panelId}
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={12}
          avoidCollisions
          aria-label={`${ariaLabel}（カレンダー）`}
          className="nook-radix-popover z-[250] rounded-[var(--radius-sm)] border nook-border-hairline nook-bg-raised p-3 shadow-[var(--home-card-lift)] outline-none"
          style={{
            width: "max(var(--radix-popover-trigger-width), 288px)",
            maxWidth: "min(100vw - 1.5rem, 24rem)",
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              className="nook-fg-muted flex h-11 w-11 min-h-[var(--touch)] min-w-[var(--touch)] shrink-0 items-center justify-center rounded-full text-base transition hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 sm:text-sm"
              aria-label="前の月"
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </button>
            <p className="nook-fg min-w-0 flex-1 text-center text-sm font-semibold">
              {monthTitle}
            </p>
            <button
              type="button"
              className="nook-fg-muted flex h-11 w-11 min-h-[var(--touch)] min-w-[var(--touch)] shrink-0 items-center justify-center rounded-full text-base transition hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 sm:text-sm"
              aria-label="次の月"
              onClick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>
          <div
            className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold nook-fg-muted"
            aria-hidden
          >
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-0.5" role="grid">
            {cells.map(({ date: d, inMonth }, i) => {
              const iso = toLocalISODate(d);
              const isSel = Boolean(selected && isSameLocalDay(d, selected));
              const isToday = isSameLocalDay(d, today);
              return (
                <button
                  key={`${iso}-${i}`}
                  type="button"
                  role="gridcell"
                  aria-selected={isSel}
                  className={`flex h-11 min-h-[2.75rem] items-center justify-center rounded-md text-sm transition sm:h-9 sm:min-h-0 sm:text-xs ${
                    !inMonth
                      ? "nook-fg-faint opacity-50 hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)]"
                      : "nook-fg hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)]"
                  } ${
                    isSel
                      ? "bg-[color-mix(in_srgb,var(--text)_14%,transparent)] font-semibold"
                      : ""
                  } ${
                    isToday && !isSel
                      ? "ring-1 ring-[color-mix(in_srgb,var(--text)_25%,transparent)]"
                      : ""
                  }`}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          {allowClear ? (
            <div className="mt-2 border-t pt-2 nook-border-hairline">
              <button
                type="button"
                className="nook-fg-muted min-h-[var(--touch)] w-full rounded-md py-2 text-center text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] sm:min-h-0 sm:py-1.5 sm:text-[11px]"
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                日付をクリア
              </button>
            </div>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
