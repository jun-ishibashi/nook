"use client";

import { SessionProvider } from "next-auth/react";
import NookToaster from "./nook-toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <NookToaster />
    </SessionProvider>
  );
}
