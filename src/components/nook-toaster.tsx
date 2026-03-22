"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/** テーマ切替に追随。位置は固定ナビの下にずらす（モバイルは safe-area 考慮）。 */
export default function NookToaster() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" ? readTheme() : "dark"
  );

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(readTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return (
    <Toaster
      theme={theme}
      position="top-center"
      closeButton
      offset="calc(var(--nav-height) + 10px)"
      mobileOffset="calc(var(--nav-height) + 8px)"
      toastOptions={{
        duration: 3500,
        classNames: {
          toast: "nook-toast",
          title: "nook-toast__title",
          description: "nook-toast__desc",
          closeButton: "nook-toast__close",
          actionButton: "nook-toast__action",
          cancelButton: "nook-toast__cancel",
        },
      }}
      containerAriaLabel="通知"
    />
  );
}
