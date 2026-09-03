/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NODE_ENV === "development"
        ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000")
        : "https://hindu-backend-beta.vercel.app",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/receipts/verify/:token",
        destination: "/receipts/:token",
      },
      {
        source: "/receipt/verify/:token",
        destination: "/receipt/:token",
      },
    ];
  },
};

export default nextConfig;
