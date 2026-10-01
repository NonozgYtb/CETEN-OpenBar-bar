import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typedRoutes: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/:path*",
      },
    ]
  },
  allowedDevOrigins: ["*", "**", "**.*"],
}

export default nextConfig
