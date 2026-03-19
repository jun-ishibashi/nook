"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSettings({
  initialBio,
  initialProfileLink,
}: {
  initialBio: string;
  initialProfileLink: string;
}) {
  const router = useRouter();
  const [bio, setBio] = useState(initialBio);
  const [profileLink, setProfileLink] = useState(initialProfileLink);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, profileLink }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "保存できませんでした。もう一度お試しください。");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <details
      className="group overflow-hidden rounded-[var(--radius-card)] border"
      style={{ borderColor: "var(--hairline)", background: "var(--bg-raised)" }}
    >
      <summary
        className="cursor-pointer list-none px-4 py-3.5 text-sm outline-none marker:content-none [&::-webkit-details-marker]:hidden"
        style={{ color: "var(--text-secondary)" }}
      >
        <span className="flex items-center justify-between gap-2">
          <span id="profile-settings-heading" className="nook-section-label !mb-0 font-semibold normal-case tracking-normal">
            プロフィール設定
          </span>
          <span className="text-[10px] font-normal opacity-50" aria-hidden>
            ▼
          </span>
        </span>
      </summary>
      <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: "var(--border-subtle)" }}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="profile-bio" className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
              ひとこと
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              rows={2}
              className="textarea-base mt-1 text-xs"
              placeholder="例: 賃貸1LDK・コンクリ好き"
              maxLength={160}
            />
            <p className="mt-0.5 text-right text-[10px]" style={{ color: "var(--text-faint)" }}>
              {bio.length}/160
            </p>
          </div>
          <div>
            <label htmlFor="profile-link" className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
              リンク（任意）
            </label>
            <input
              id="profile-link"
              type="url"
              value={profileLink}
              onChange={(e) => setProfileLink(e.target.value.slice(0, 500))}
              className="input-base mt-1 text-xs"
              placeholder="https://www.instagram.com/..."
              maxLength={500}
              autoComplete="url"
            />
          </div>
          {error ? (
            <p className="nook-form-error mt-0 text-xs" role="alert">
              {error}
            </p>
          ) : null}
          {saved ? (
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              保存しました
            </p>
          ) : null}
          <button type="submit" disabled={loading} className="btn-primary text-xs disabled:opacity-50">
            {loading ? "保存中…" : "保存"}
          </button>
        </form>
      </div>
    </details>
  );
}
