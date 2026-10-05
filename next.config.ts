import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Proxies REST calls through this same origin so the auth cookies are
  // first-party to the browser. Frontend and backend are on different
  // registrable domains (vercel.app vs onrender.com) in production, and
  // browsers with third-party-cookie blocking (Safari, Brave, Chrome's
  // rollout) silently drop a cross-site cookie even with SameSite=None.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
