"use client";

import { clampPinUnit } from "@/lib/furniture-pin-coords";

type Props = {
  imageSrc: string;
  pinX: number | null;
  pinY: number | null;
  onChange: (next: { pinX: number | null; pinY: number | null }) => void;
  /** 部屋の写真と同じ 4:5 + cover で座標を揃える */
  caption?: string;
};

export default function FurniturePhotoPinPicker({
  imageSrc,
  pinX,
  pinY,
  onChange,
  caption = "写真をタップで位置を付けます（任意）",
}: Props) {
  function handleImgClick(e: React.MouseEvent<HTMLImageElement>) {
    const el = e.currentTarget;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;
    const x = clampPinUnit(e.nativeEvent.offsetX / w);
    const y = clampPinUnit(e.nativeEvent.offsetY / h);
    onChange({ pinX: x, pinY: y });
  }

  const hasPin = pinX !== null && pinY !== null;

  return (
    <div className="mt-2 space-y-1.5">
      <p className="nook-fg-muted text-[10px] font-semibold leading-snug">{caption}</p>
      <div className="relative aspect-[4/5] w-full max-w-[11rem] overflow-hidden rounded-[var(--radius-sm)] border nook-border-hairline bg-black/5 dark:bg-white/5">
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full cursor-crosshair object-cover"
          onClick={handleImgClick}
          draggable={false}
        />
        {hasPin ? (
          <span
            className="pointer-events-none absolute z-[1] h-3 w-3 rounded-full border-2 border-white bg-[var(--accent)] shadow-md"
            style={{
              left: `${pinX! * 100}%`,
              top: `${pinY! * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            aria-hidden
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onChange({ pinX: null, pinY: null })}
        disabled={!hasPin}
        className="text-[10px] font-medium text-[var(--text-muted)] underline decoration-[var(--border)] underline-offset-2 transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
      >
        位置を消す
      </button>
    </div>
  );
}
