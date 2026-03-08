"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "認証の準備に失敗しました。",
  OAuthCallback: "認証コールバックでエラーが発生しました。",
  OAuthCreateAccount: "アカウント作成に失敗しました。",
  EmailCreateAccount: "アカウント作成に失敗しました。",
  Callback: "コールバックでエラーが発生しました。",
  OAuthAccountNotLinked: "このメールアドレスは別のログイン方法で登録されています。",
  EmailSignin: "メール送信に失敗しました。",
  CredentialsSignin: "ログインに失敗しました。",
  SessionRequired: "このページはログインが必要です。",
  Default: "ログインに失敗しました。しばらくしてからお試しください。",
};

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const errorCode = searchParams.get("error") ?? "";
  const error = errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default) : "";

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Interior Share
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          お部屋のインテリアをシェアしよう
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 text-left" role="alert">{error}</div>
        )}

        <button
          type="button"
          onClick={() => { setLoading(true); signIn("google", { callbackUrl }); }}
          disabled={loading}
          className="mt-8 flex min-h-[var(--touch)] w-full items-center justify-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
          style={{ background: "var(--bg-raised)", color: "var(--text)", border: "1px solid var(--border)" }}
          aria-busy={loading}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--text-muted)", borderTopColor: "transparent" }} />
              ログイン中...
            </span>
          ) : "Google でログイン"}
        </button>

        <p className="mt-6 text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          ログインすると写真の投稿・保存ができます
        </p>

        <div className="mt-8">
          <Link href="/" className="text-xs font-medium transition hover:opacity-70" style={{ color: "var(--text-muted)" }}>
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center" aria-busy="true">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--text-muted)", borderTopColor: "transparent" }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
