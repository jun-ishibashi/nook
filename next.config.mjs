/** @type {import('next').NextConfig} */
const nextConfig = {
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
