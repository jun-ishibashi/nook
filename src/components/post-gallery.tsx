"use client";

import ImageGallery from "react-image-gallery";
import "react-image-gallery/build/image-gallery.css";

import NookImage from "./nook-image";
import {
  renderNookGalleryLeftNav,
  renderNookGalleryRightNav,
} from "./nook-image-gallery-controls";

export type GalleryPin = {
  id: string;
  name: string;
  pinX: number;
  pinY: number;
};

/** react-image-gallery のスライドに mood（Nook）を足したもの */
type GallerySlide = {
  original: string;
  thumbnail?: string;
  mood?: string;
  /** 複数枚時：下サムネに 1,2,… を重ねて表示 */
  thumbnailLabel?: string;
  pins?: GalleryPin[];
};

type Props = {
  items: GallerySlide[];
};

export default function PostGallery({ items }: Props) {
  const renderItem = (item: GallerySlide) => {
    const pins = item.pins ?? [];
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
        <NookImage
          src={item.original}
          alt=""
          fill
          mood={item.mood}
          className="object-cover"
        />
        {pins.length > 0 ? (
          <div className="pointer-events-none absolute inset-0 z-[2]">
            {pins.map((p, idx) => (
              <a
                key={p.id}
                href={`#post-furniture-item-${p.id}`}
                className="nook-gallery-pin pointer-events-auto absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--accent)] text-[10px] font-bold text-white shadow-md transition hover:scale-110 hover:opacity-95 active:scale-95"
                style={{
                  left: `${p.pinX * 100}%`,
                  top: `${p.pinY * 100}%`,
                  zIndex: 10 + idx,
                }}
                title={p.name}
                aria-label={`${p.name} の説明へ`}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {pins.length > 1 ? (
                  <span className="leading-none">{idx + 1}</span>
                ) : null}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const multi = items.length > 1;

  return (
    <div className="post-detail-gallery nook-ig-gallery-shell">
      <ImageGallery
        items={items}
        renderItem={renderItem}
        showThumbnails={multi}
        showPlayButton={false}
        showFullscreenButton={false}
        showNav={multi}
        showBullets={false}
        showIndex={multi}
        indexSeparator=" / "
        /** ライブラリ既定の <img>（サムネ等）向け。メインスライドは NookImage が別途フォールバック */
        onErrorImageURL="/empty-state.png"
        renderLeftNav={renderNookGalleryLeftNav}
        renderRightNav={renderNookGalleryRightNav}
      />
    </div>
  );
}
