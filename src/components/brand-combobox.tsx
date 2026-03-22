"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  filterBrandSuggestions,
  matchBrandFromFreeText,
  type BrandMasterEntry,
} from "@/lib/brand-master";

type Props = {
  brand: string;
  brandSlug: string;
  onChange: (next: { brand: string; brandSlug: string }) => void;
  /** 追加フォーム用の短い id 接尾辞 */
  idSuffix?: string;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  "aria-label"?: string;
};

/**
 * ブランド自由入力＋マスタからのサジェスト（選ぶと slug 付与、手入力だけなら slug は空）
 */
export default function BrandCombobox({
  brand,
  brandSlug,
  onChange,
  idSuffix = "",
  className = "",
  inputClassName = "input-base text-base sm:text-xs",
  placeholder = "ブランド・店名（任意）",
  "aria-label": ariaLabel = "ブランドまたは店名",
}: Props) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputId = `brand-combo-${idSuffix}`;

  const suggestions = filterBrandSuggestions(brand, 10);
  const activeIdx =
    suggestions.length > 0 ? Math.min(active, suggestions.length - 1) : 0;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function applyEntry(e: BrandMasterEntry) {
    onChange({ brand: e.label, brandSlug: e.slug });
    setOpen(false);
  }

  function handleInputChange(v: string) {
    const next = v.slice(0, 80);
    onChange({ brand: next, brandSlug: "" });
    setOpen(true);
    setActive(0);
  }

  function handleBlur() {
    window.setTimeout(() => {
      const m = matchBrandFromFreeText(brand);
      if (m && !brandSlug) {
        onChange({ brand: m.label.slice(0, 80), brandSlug: m.slug });
      }
      setOpen(false);
    }, 120);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && suggestions[activeIdx]) {
        applyEntry(suggestions[activeIdx]);
      }
      setOpen(false);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) =>
        Math.min(i + 1, Math.max(0, suggestions.length - 1))
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    }
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        id={inputId}
        type="text"
        role="combobox"
        value={brand}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={80}
        className={inputClassName}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && suggestions.length > 0}
        aria-haspopup="listbox"
        aria-activedescendant={
          open && suggestions.length > 0
            ? `${listId}-opt-${activeIdx}`
            : undefined
        }
        autoComplete="off"
      />
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-0.5 max-h-48 overflow-y-auto rounded-md border nook-border-hairline nook-bg-raised py-1 shadow-lg"
        >
          {suggestions.map((item, i) => (
            <li key={item.slug} role="presentation">
              <button
                type="button"
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={i === activeIdx}
                className={`w-full px-2.5 py-1.5 text-left text-[11px] transition hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] ${
                  i === activeIdx
                    ? "nook-fg bg-[color-mix(in_srgb,var(--text)_8%,transparent)]"
                    : "nook-fg-secondary"
                }`}
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => applyEntry(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
