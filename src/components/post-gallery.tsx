"use client";

import ImageGallery from "react-image-gallery";
import "react-image-gallery/build/image-gallery.css";

import NookImage from "./nook-image";

/** react-image-gallery のスライドに mood（Nook）を足したもの */
type GallerySlide = {
  original: string;
  thumbnail?: string;
  mood?: string;
};

type Props = {
  items: GallerySlide[];
};

export default function PostGallery({ items }: Props) {
  const renderItem = (item: GallerySlide) => {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
        <NookImage
          src={item.original}
          alt=""
          fill
          mood={item.mood}
          className="object-cover"
        />
      </div>
    );
  };

  return (
    <div className="post-detail-gallery">
      <ImageGallery
        items={items}
        renderItem={renderItem}
        showThumbnails={items.length > 1}
        showPlayButton={false}
        showFullscreenButton={items.length > 1}
      />
    </div>
  );
}
