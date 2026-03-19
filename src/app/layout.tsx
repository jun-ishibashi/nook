import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/navbar";
import Modal from "@/components/modal";
import CreatePost from "@/components/create-post";
import Footer from "@/components/footer";

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
    default: "NOOK — みんなの部屋をさがす",
    template: "%s | NOOK",
  },
  description: "リアルな部屋の写真と、家具・雑貨をどこで買えるかをまとめてさがす。",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
  openGraph: {
    siteName: "NOOK",
    locale: "ja_JP",
    type: "website",
    title: "NOOK — みんなの部屋をさがす",
    description: "リアルな部屋の写真と、家具・雑貨をどこで買えるかをまとめてさがす。",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOOK — みんなの部屋をさがす",
    description: "リアルな部屋の写真と、家具・雑貨をどこで買えるかをまとめてさがす。",
  },
};

const POST_MODAL_ID = "post_modal";

/** FOUC 防止: 初回ペイント前に data-theme を適用（既定: dark） */
const THEME_INIT_SCRIPT = `
(function(){
  try {
    var k = "nook-theme";
    var t = localStorage.getItem(k);
    if (t !== "light" && t !== "dark") t = "dark";
    document.documentElement.setAttribute("data-theme", t);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`} suppressHydrationWarning>
      <body
        className={`flex min-h-screen flex-col antialiased ${notoSansJP.className}`}
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          fontFeatureSettings: '"palt" 1',
        }}
      >
        <Script id="nook-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
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
        </Providers>
      </body>
    </html>
  );
}
