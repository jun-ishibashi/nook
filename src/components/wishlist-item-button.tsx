"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  productUrl: string;
  name: string;
  note: string;
  postId: string;
  initialSaved: boolean;
  size?: "sm" | "md";
};

export default function WishlistItemButton({
  productUrl,
  name,
  note,
  postId,
  initialSaved,
  size = "md",
}: Props) {
  const { status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const isSm = size === "sm";
  const pad = isSm ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs";

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/post/${postId}`)}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productUrl, name, note, postId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.saved === "boolean") {
        setSaved(data.saved);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`shrink-0 rounded-full font-semibold transition active:scale-[0.97] disabled:opacity-50 ${pad}`}
      style={
        saved
          ? {
              background: "var(--accent-warm-muted)",
              color: "var(--text)",
              border: "1px solid var(--hairline)",
            }
          : {
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--hairline)",
            }
      }
      aria-pressed={saved}
      aria-label={saved ? "欲しいから外す" : "欲しいに追加"}
    >
      {loading ? "…" : "欲しい"}
    </button>
  );
}
