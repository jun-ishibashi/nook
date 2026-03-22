"use client";

import type { MouseEventHandler } from "react";

/** react-image-gallery 用：デフォルトの巨大矢印・青ホバーを避けたコンパクトなナビ */

function IconPrev() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconNext() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function renderNookGalleryLeftNav(
  onClick: MouseEventHandler<HTMLElement>,
  disabled: boolean
) {
  return (
    <button
      type="button"
      className="image-gallery-icon image-gallery-left-nav nook-ig-nav nook-ig-nav--prev"
      disabled={disabled}
      onClick={onClick}
      aria-label="前の写真"
    >
      <IconPrev />
    </button>
  );
}

export function renderNookGalleryRightNav(
  onClick: MouseEventHandler<HTMLElement>,
  disabled: boolean
) {
  return (
    <button
      type="button"
      className="image-gallery-icon image-gallery-right-nav nook-ig-nav nook-ig-nav--next"
      disabled={disabled}
      onClick={onClick}
      aria-label="次の写真"
    >
      <IconNext />
    </button>
  );
}
