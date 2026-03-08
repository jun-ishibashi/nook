"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo from "./logo";

export default function WelcomeBanner() {
  const { data: session } = useSession();

  if (session) return null;

  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl p-6 sm:p-8"
      style={{ background: "var(--bg-inverse)", color: "var(--text-inverse)" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Logo size={14} />
            <span className="text-[11px] font-bold uppercase tracking-widest">NOOK</span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
            みんなの部屋を
            <br className="sm:hidden" />
            のぞいてみよう
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#a39e98" }}>
            お部屋のインテリア写真をシェアして、
            <br className="hidden sm:block" />
            使っている家具の購入先もわかる。
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-bold transition active:scale-[0.97]"
            style={{ background: "var(--bg)", color: "var(--text)" }}
          >
            はじめる
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 pt-5" style={{ borderTop: "1px solid #3a3632" }}>
        {[
          { label: "写真を投稿", icon: <><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
          { label: "アイテムを紐付け", icon: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
          { label: "気になる部屋を保存", icon: <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> },
        ].map((step) => (
          <div key={step.label} className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "#3a3632" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "#a39e98" }} aria-hidden>{step.icon}</svg>
            </div>
            <p className="text-[11px] font-bold" style={{ color: "#a39e98" }}>{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
