import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/navbar";
import Modal from "@/components/modal";
import CreatePost from "@/components/create-post";
import Footer from "@/components/footer";
import BackToTop from "@/components/back-to-top";
import { SITE_DESCRIPTION, SITE_TITLE_DEFAULT } from "@/lib/site-meta";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3f0" },
    { media: "(prefers-color-scheme: dark)", color: "#131211" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE_DEFAULT,
    template: "%s | NOOK",
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
  openGraph: {
    siteName: "NOOK",
    locale: "ja_JP",
    type: "website",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
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
      <body className={`nook-body-surface flex min-h-screen flex-col antialiased ${notoSansJP.className}`}>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--bg-inverse)] focus:px-4 focus:py-2 focus:font-medium focus:text-[var(--text-inverse)] focus:outline-none"
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
