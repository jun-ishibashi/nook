function siteNoIndex() {
  const v = process.env.NO_INDEX_SITE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    if (!siteNoIndex()) return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  images: {
    /** next/image の quality プロップで使う値（未指定時は 75） */
    qualities: [75, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "@neondatabase/serverless"],
};

export default nextConfig;
