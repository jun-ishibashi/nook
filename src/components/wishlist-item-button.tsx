"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginCallbackHref } from "@/lib/login-href";
import { useState, useTransition } from "react";

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
  const [isPending, startTransition] = useTransition();

  const isSm = size === "sm";
  const pad = isSm
    ? "min-h-11 px-3 py-2 text-xs sm:min-h-0 sm:px-2 sm:py-1 sm:text-[10px]"
    : "min-h-11 px-4 py-2 text-xs sm:min-h-0 sm:px-4 sm:py-1.5";

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      router.push(loginCallbackHref(`/post/${postId}`));
      return;
    }
    startTransition(async () => {
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
      } catch {}
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
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
      {isPending ? "…" : "欲しい"}
    </button>
  );
}
