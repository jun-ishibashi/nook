"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/logo";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "ログインの準備に失敗しました。もう一度お試しください。",
  OAuthCallback: "認証でエラーが発生しました。もう一度お試しください。",
  OAuthCreateAccount: "アカウントを作成できませんでした。もう一度お試しください。",
  EmailCreateAccount: "アカウントを作成できませんでした。もう一度お試しください。",
  Callback: "認証でエラーが発生しました。もう一度お試しください。",
  OAuthAccountNotLinked: "このメールは、ほかのログイン方法で登録済みです。",
  EmailSignin: "メールを送信できませんでした。もう一度お試しください。",
  CredentialsSignin: "ログインできませんでした。もう一度お試しください。",
  SessionRequired: "ログインが必要です。",
  Default: "ログインできませんでした。もう一度お試しください。",
};

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const errorCode = searchParams.get("error") ?? "";
  const error = errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default) : "";

  return (
    <div className="login-page mx-auto flex min-h-[85vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-10 sm:min-h-[80vh] sm:flex-row sm:gap-10 sm:py-14 lg:gap-16">
      {/* 左：ビジュアル面（§5.1 写真が主役） */}
      <div className="login-visual hidden w-full max-w-md flex-1 sm:block">
        <div className="relative overflow-hidden rounded-[var(--radius-card)]" style={{ aspectRatio: "3/4" }}>
          <Image
            src="/hero-home.png"
            alt="コンクリート壁の間接照明が灯るワンルーム"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 0px, 50vw"
            priority
            quality={80}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(19,18,17,0.7) 0%, rgba(19,18,17,0.15) 50%, transparent 100%)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-[11px] font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              リアルな部屋写真から、家具の購入先まで。
            </p>
          </div>
        </div>
      </div>

      {/* 右：フォーム面 */}
      <div className="w-full max-w-md flex-1">
        <div className="nook-elevated-surface space-y-6 overflow-hidden p-5 sm:p-7">
          {/* 入口層：ムードと部屋を先に。チラシ感は出さない */}
          <header className="login-entry-header">
            <div className="mb-5 flex items-center gap-3">
              <span style={{ color: "var(--text)" }} aria-hidden>
                <Logo size={40} />
              </span>
              <p className="nook-section-label">NOOK</p>
            </div>
            <h1 className="text-pretty text-xl font-bold leading-tight tracking-tighter sm:text-2xl" style={{ color: "var(--text)" }}>
              静かに、こだわりを重ねる。
            </h1>
          <p className="mt-3 max-w-sm text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            みんなの部屋のムードから入って、気に入った家具・雑貨の購入先までひと続きで辿れます。<br />
            保存や欲しいで、あとで静かに見返せます。
          </p>
          </header>

          {error ? (
            <div className="nook-form-error mt-0" role="alert">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-5">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              signIn("google", { callbackUrl });
            }}
            disabled={loading}
            className="login-google-btn flex min-h-[var(--touch)] w-full items-center justify-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            style={{
              background: "var(--bg-raised)",
              color: "var(--text)",
              border: "1px solid var(--hairline)",
              boxShadow: "var(--home-tile-shadow)",
            }}
            aria-busy={loading}
            aria-label={loading ? "Google との接続中" : "Google アカウントでログイン"}
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? (
              <span className="flex items-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: "var(--text-muted)", borderTopColor: "transparent" }}
                  aria-hidden
                />
                接続中です
              </span>
            ) : (
              "Google で続行"
            )}
          </button>

          </div>
        </div>

        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium sm:mt-10"
          aria-label="ほかのページ"
        >
          <Link href="/" className="transition hover:opacity-70" style={{ color: "var(--text-muted)" }}>
            みんなの部屋へ
          </Link>
          <Link href="/terms" className="transition hover:opacity-70" style={{ color: "var(--text-faint)" }}>
            利用規約
          </Link>
          <Link href="/privacy" className="transition hover:opacity-70" style={{ color: "var(--text-faint)" }}>
            プライバシー
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="nook-app-canvas min-h-screen">
      <Suspense
        fallback={
          <div className="login-page-skeleton mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-4 py-10 sm:py-14" aria-busy="true">
            <div className="nook-elevated-surface space-y-5 overflow-hidden p-5 sm:p-7">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-lg" style={{ background: "var(--bg-sunken)" }} />
                  <div className="h-3 w-16 animate-pulse rounded-sm self-center" style={{ background: "var(--bg-sunken)" }} />
                </div>
                <div className="h-6 w-32 animate-pulse rounded-sm" style={{ background: "var(--bg-sunken)" }} />
                <div className="h-10 w-full animate-pulse rounded-md" style={{ background: "var(--bg-sunken)" }} />
              </div>
              <div className="h-12 w-full animate-pulse rounded-full" style={{ background: "var(--bg-sunken)" }} />
            </div>
            <span className="sr-only">読み込み中</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
