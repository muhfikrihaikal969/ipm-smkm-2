import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Memaksa browser mengambil gambar langsung dari Supabase CDN tanpa lewat proxy Node.js
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;