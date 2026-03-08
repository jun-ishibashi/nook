import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "NOOK - みんなの部屋をのぞいてみよう",
    template: "%s | NOOK",
  },
  description: "お部屋のインテリア写真をシェアして、使っている家具の購入先もわかる。",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
  openGraph: {
    siteName: "NOOK",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const POST_MODAL_ID = "post_modal";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className={`min-h-screen antialiased ${notoSansJP.className}`} style={{ background: "var(--bg)", color: "var(--text)" }}>
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
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
