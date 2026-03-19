import Image from "next/image";

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
}: Props) {
  if (!src) return null;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes ?? "(max-width: 640px) 50vw, 400px"}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 1000}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
