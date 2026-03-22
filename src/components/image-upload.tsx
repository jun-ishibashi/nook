"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { getMoodFilter } from "@/lib/image-mood";

/** blob URL は親で Map 管理（子ごとの useMemo + revoke が Strict Mode と競合しやすい） */
function FilePreviewThumb({
  src,
  mood,
  index,
  onRemove,
}: {
  src: string;
  mood?: string;
  index: number;
  onRemove?: (index: number) => void;
}) {
  return (
    <div
      className="nook-bg-sunken group relative h-[5.25rem] w-[5.25rem] overflow-hidden rounded-[var(--radius-sm)] shadow-[var(--home-tile-shadow)] sm:h-28 sm:w-28"
      role="listitem"
    >
      <img
        src={src}
        alt={`写真 ${index + 1}`}
        className="h-full w-full object-cover transition-all"
        style={{ filter: getMoodFilter(mood) }}
      />
      {onRemove ? (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="nook-image-remove-btn nook-overlay-action-reveal absolute right-0.5 top-0.5 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm sm:h-6 sm:w-6"
          aria-label={`写真 ${index + 1} を削除`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export default function ImageUpload({ files, onFiles, onRemove, mood }: {
  files: File[];
  onFiles: (files: File[]) => void;
  onRemove?: (index: number) => void;
  mood?: string;
}) {
  const previewByFileRef = useRef<Map<File, string>>(new Map());
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useLayoutEffect(() => {
    const map = previewByFileRef.current;
    const keep = new Set(files);
    for (const [f, url] of [...map.entries()]) {
      if (!keep.has(f)) {
        URL.revokeObjectURL(url);
        map.delete(f);
      }
    }
    setPreviewUrls(
      files.map((f) => {
        let u = map.get(f);
        if (!u) {
          u = URL.createObjectURL(f);
          map.set(f, u);
        }
        return u;
      })
    );
  }, [files]);

  useEffect(() => {
    const map = previewByFileRef.current;
    return () => {
      for (const url of map.values()) {
        URL.revokeObjectURL(url);
      }
      map.clear();
    };
  }, []);

  const onDrop = useCallback((accepted: File[]) => { onFiles([...files, ...accepted]); }, [files, onFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, maxFiles: 10 });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex min-h-[min(132px,28dvh)] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed transition duration-150 sm:min-h-[132px] ${isDragActive ? "nook-dropzone-active" : "nook-dropzone-idle"}`}
        role="button"
        tabIndex={0}
        aria-label="写真を足す"
      >
        <input {...getInputProps()} aria-hidden />
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="nook-fg-faint mb-2" aria-hidden>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="nook-fg-secondary text-xs font-medium">
          {isDragActive ? "ここにドロップ" : "写真を足す"}
        </p>
        <p className="nook-fg-faint mt-0.5 text-center nook-caption-sm">
          最大10枚・タップで選択
        </p>
      </div>
      {files.length > 0 && previewUrls.length === files.length && (
        <div className="mt-3 flex flex-wrap gap-2" role="list">
          {files.map((_, i) => (
            <FilePreviewThumb
              key={previewUrls[i]}
              src={previewUrls[i]!}
              mood={mood}
              index={i}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
