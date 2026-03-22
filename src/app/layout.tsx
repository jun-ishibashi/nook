import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/navbar";
import Modal from "@/components/modal";
import CreatePost from "@/components/create-post";
import Footer from "@/components/footer";
import BackToTop from "@/components/back-to-top";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto",
});

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NOOK — 静かに、こだわりを重ねる。理想の部屋への一歩を。",
    template: "%s | NOOK",
  },
  description:
    "無機質、モノトーン、光。一人暮らしのインスピレーションを、現実の部屋へ。住んでいそうな画から、その家具が「どこで買えるか」までを最短でつなぐ、若者のための発見アプリ。",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
  openGraph: {
    siteName: "NOOK",
    locale: "ja_JP",
    type: "website",
    title: "NOOK — 静かに、こだわりを重ねる。理想の部屋への一歩を。",
    description:
      "無機質、モノトーン、光。一人暮らしのインスピレーションを、現実の部屋へ。住んでいそうな画から、その家具が「どこで買えるか」までを最短でつなぐ、若者のための発見アプリ。",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOOK — 静かに、こだわりを重ねる。理想の部屋への一歩を。",
    description:
      "無機質、モノトーン、光。一人暮らしのインスピレーションを、現実の部屋へ。住んでいそうな画から、その家具が「どこで買えるか」までを最短でつなぐ、若者のための発見アプリ。",
  },
};

const POST_MODAL_ID = "post_modal";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`} suppressHydrationWarning>
      <head>
        <Script src="/nook-theme-init.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`flex min-h-screen flex-col antialiased ${notoSansJP.className}`}
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          fontFeatureSettings: '"palt" 1',
        }}
      >
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:font-medium focus:outline-none"
            style={{ background: "var(--bg-inverse)", color: "var(--text-inverse)" }}
          >
            メインコンテンツへスキップ
          </a>
          <Navbar postModalId={POST_MODAL_ID} />
          <Modal id={POST_MODAL_ID}>
            <CreatePost />
          </Modal>
          <main id="main" className="min-h-0 w-full flex-1">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
