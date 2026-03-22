"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProfileSettings({
  initialDisplayName,
  initialBio,
  initialProfileLink,
}: {
  initialDisplayName: string;
  initialBio: string;
  initialProfileLink: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [profileLink, setProfileLink] = useState(initialProfileLink);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: displayName, bio, profileLink }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "保存できませんでした。もう一度お試しください。");
      return;
    }
    toast.success("保存しました");
    router.refresh();
  }

  return (
    <details className="profile-settings-disclosure nook-elevated-surface group overflow-hidden">
      <summary className="nook-fg-secondary flex min-h-[var(--touch)] cursor-pointer list-none items-center px-4 py-3.5 text-sm outline-none marker:content-none [&::-webkit-details-marker]:hidden sm:min-h-0">
        <span className="flex w-full min-w-0 items-center justify-between gap-2">
          <span id="profile-settings-heading" className="nook-section-label !mb-0 font-semibold normal-case tracking-normal">
            プロフィール設定
          </span>
          <svg
            className="profile-settings-chevron shrink-0 opacity-45"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <div className="border-t px-4 pb-4 pt-3 nook-border-hairline">
        <form onSubmit={handleSubmit} className="space-y-3" aria-busy={loading}>
          <div>
            <label htmlFor="profile-display-name" className="nook-fg-muted nook-caption-sm font-bold">
              表示名
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 40))}
              className="input-base mt-1 text-base sm:text-sm"
              placeholder="サイト上で見える名前"
              maxLength={40}
              autoComplete="nickname"
              aria-describedby="profile-display-name-hint"
            />
            <p id="profile-display-name-hint" className="nook-fg-faint mt-0.5 nook-caption-sm">
              プロフィールページと一覧に表示されます（40文字まで）。
            </p>
          </div>
          <div>
            <label htmlFor="profile-bio" className="nook-fg-muted nook-caption-sm font-bold">
              ひとこと
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              rows={2}
              className="textarea-base mt-1 text-base sm:text-sm"
              placeholder="例: 1LDK・コンクリ好き"
              maxLength={160}
            />
            <p className="nook-fg-faint mt-0.5 text-right nook-caption-sm">
              {bio.length}/160
            </p>
          </div>
          <div>
            <label htmlFor="profile-link" className="nook-fg-muted nook-caption-sm font-bold">
              リンク（任意）
            </label>
            <input
              id="profile-link"
              type="url"
              value={profileLink}
              onChange={(e) => setProfileLink(e.target.value.slice(0, 500))}
              className="input-base mt-1 text-base sm:text-sm"
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
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-label={loading ? "保存しています" : undefined}
            className="btn-primary text-sm sm:text-xs disabled:opacity-50"
          >
            {loading ? "保存中…" : "保存"}
          </button>
        </form>
      </div>
    </details>
  );
}
