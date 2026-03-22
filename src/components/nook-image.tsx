"use client";

import { useCallback, useState } from "react";
import NextImage from "next/image";
import { getMoodFilter } from "@/lib/image-mood";
import { BrokenImagePlaceholder } from "@/components/broken-image-placeholder";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  /** `aspect-*` 親の `relative` 内で塗りつぶし */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  mood?: string;
};

/**
 * Cloudinary・同一オリジン `/uploads` 向けに next/image をラップ。
 * 最適化 API の 500・元画像の 404 などでプレースホルダーに切り替える。
 */
export default function NookImage({
  src,
  alt = "",
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  mood,
}: Props) {
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => {
    setFailed(true);
  }, []);

  if (!src) return null;

  if (failed) {
    if (fill) {
      return (
        <BrokenImagePlaceholder
          label={alt || undefined}
          mood={mood}
          absoluteFill
          className={className}
        />
      );
    }
    return (
      <BrokenImagePlaceholder
        label={alt || undefined}
        mood={mood}
        className={className}
        style={{ width: width ?? 800, height: height ?? 1000 }}
      />
    );
  }

  const filterStyle = { filter: getMoodFilter(mood) };
  if (fill) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        className={className}
        style={filterStyle}
        sizes={sizes ?? "(max-width: 640px) 50vw, 400px"}
        priority={priority}
        onError={onError}
      />
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 1000}
      className={className}
      style={filterStyle}
      sizes={sizes}
      priority={priority}
      onError={onError}
    />
  );
}
