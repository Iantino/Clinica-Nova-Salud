import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiProxy = (process.env.API_PROXY_URL ?? "http://localhost:4000").replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${apiProxy}/api/:path*` }];
  },
};

export default nextConfig;
