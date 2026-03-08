"use client";

import ImageGallery from "react-image-gallery";
import "react-image-gallery/build/image-gallery.css";

type Props = {
  items: { original: string; thumbnail: string }[];
};

export default function PostGallery({ items }: Props) {
  return (
    <ImageGallery
      items={items}
      showThumbnails={items.length > 1}
      showPlayButton={false}
      showFullscreenButton={items.length > 1}
    />
  );
}
