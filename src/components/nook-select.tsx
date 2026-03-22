"use client";

import * as Popover from "@radix-ui/react-popover";
import { useId, useState } from "react";

export type NookSelectOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: NookSelectOption[];
  "aria-label": string;
  /** トリガーに付与（input-base と併用想定） */
  className?: string;
  disabled?: boolean;
};

export default function NookSelect({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  className = "",
  disabled = false,
}: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const found = options.findIndex((o) => o.value === value);
  const selectedIdx = found >= 0 ? found : 0;
  const selectedLabel =
    (found >= 0 ? options[found]?.label : undefined) ??
    options[0]?.label ??
    "";

  function selectAt(i: number) {
    const o = options[i];
    if (!o) return;
    onChange(o.value);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setActive(selectedIdx);
        setOpen(true);
        return;
      }
      if (e.key === "ArrowDown") {
        setActive((i) => Math.min(i + 1, options.length - 1));
      } else {
        setActive((i) => Math.max(0, i - 1));
      }
    }
    if (e.key === "Enter" || e.key === " ") {
      if (open) {
        e.preventDefault();
        selectAt(active);
      } else {
        e.preventDefault();
        setActive(selectedIdx);
        setOpen(true);
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      selectAt(active);
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    }
  }

  return (
    <Popover.Root
      modal={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setActive(selectedIdx);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          role="combobox"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? `${listId}-opt-${active}` : undefined}
          onKeyDown={onTriggerKeyDown}
          className={`input-base flex min-h-[var(--touch)] w-full items-center justify-between gap-2 text-left shadow-none ${className}`}
        >
          <span className="min-w-0 truncate">{selectedLabel}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className={`nook-fg-muted shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          id={listId}
          role="listbox"
          tabIndex={-1}
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={12}
          avoidCollisions
          onKeyDown={onMenuKeyDown}
          className="nook-radix-popover z-[250] max-h-56 min-w-[var(--radix-popover-trigger-width)] w-[var(--radix-popover-trigger-width)] overflow-y-auto rounded-[var(--radius-sm)] border nook-border-hairline nook-bg-raised py-1 shadow-[var(--home-card-lift)] outline-none"
        >
          {options.map((o, i) => (
            <button
              key={o.value || `opt-${i}`}
              type="button"
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`min-h-[2.75rem] w-full px-3 py-2.5 text-left text-base transition hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] sm:min-h-0 sm:py-2 sm:text-xs ${
                i === active
                  ? "nook-fg bg-[color-mix(in_srgb,var(--text)_8%,transparent)]"
                  : "nook-fg-secondary"
              } ${o.value === value ? "font-medium" : ""}`}
              onMouseDown={(ev) => ev.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => selectAt(i)}
            >
              {o.label}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
