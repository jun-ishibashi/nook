"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { getMoodFilter } from "@/lib/image-mood";

export default function ImageUpload({ files, onFiles, onRemove, mood }: {
  files: File[];
  onFiles: (files: File[]) => void;
  onRemove?: (index: number) => void;
  mood?: string;
}) {
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
        <p className="nook-fg-faint mt-0.5 text-center text-[10px] leading-snug">
          最大10枚・タップで選択
        </p>
      </div>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" role="list">
          {files.map((file, i) => (
            <div
              key={i}
              className="nook-bg-sunken group relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-[var(--radius-sm)] shadow-[var(--home-tile-shadow)]"
              role="listitem"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`写真 ${i + 1}`}
                className="h-full w-full object-cover transition-all"
                style={{ filter: getMoodFilter(mood) }}
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="nook-image-remove-btn absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100"
                  aria-label={`写真 ${i + 1} を削除`}
                >
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
