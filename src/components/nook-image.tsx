import NextImage from "next/image";
import { getMoodFilter } from "@/lib/image-mood";

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
 * Cloudinary・同一オリジン `/uploads` 向けに next/image をラップ
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
  const filterStyle = { filter: getMoodFilter(mood) };
  if (!src) return null;

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
    />
  );
}
