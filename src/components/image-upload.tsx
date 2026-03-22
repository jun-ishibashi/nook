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
        className="flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed transition duration-150"
        style={{
          borderColor: isDragActive ? "var(--text-muted)" : "var(--hairline)",
          background: isDragActive ? "color-mix(in srgb, var(--bg-raised) 88%, var(--bg-wash))" : "var(--bg-sunken)",
        }}
        role="button"
        tabIndex={0}
        aria-label="写真を足す"
      >
        <input {...getInputProps()} aria-hidden />
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-faint)" }} className="mb-2" aria-hidden>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {isDragActive ? "ここにドロップ" : "写真を足す"}
        </p>
        <p className="mt-0.5 text-center text-[10px] leading-snug" style={{ color: "var(--text-faint)" }}>
          最大10枚・タップで選択
        </p>
      </div>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" role="list">
          {files.map((file, i) => (
            <div
              key={i}
              className="group relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-[var(--radius-sm)] shadow-[var(--home-tile-shadow)]"
              style={{ background: "var(--bg-sunken)" }}
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
                  className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
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
