"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function ImageUpload({ files, onFiles, onRemove }: {
  files: File[]; onFiles: (files: File[]) => void; onRemove?: (index: number) => void;
}) {
  const onDrop = useCallback((accepted: File[]) => { onFiles([...files, ...accepted]); }, [files, onFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, maxFiles: 10 });

  return (
    <div>
      <div
        {...getRootProps()}
        className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition"
        style={{
          borderColor: isDragActive ? "var(--text)" : "var(--border)",
          background: isDragActive ? "var(--bg-raised)" : "var(--bg-sunken)",
        }}
        role="button" tabIndex={0} aria-label="写真を追加"
      >
        <input {...getInputProps()} aria-hidden />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-faint)" }} className="mb-2" aria-hidden>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{isDragActive ? "ドロップして追加" : "タップして写真を追加"}</p>
        <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-faint)" }}>最大10枚</p>
      </div>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="list">
          {files.map((file, i) => (
            <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-xl" style={{ background: "var(--bg-sunken)" }} role="listitem">
              <img src={URL.createObjectURL(file)} alt={`写真 ${i + 1}`} className="h-full w-full object-cover" />
              {onRemove && (
                <button type="button" onClick={() => onRemove(i)} className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500" style={{ background: "rgba(44,40,37,0.5)" }} aria-label={`写真 ${i + 1} を削除`}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
