import type { NextConfig } from "next";

/**
 * Security headers.
 * `content` directive is computed so Vercel preview URLs and Supabase Storage
 * hosts can be injected via env without editing code.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const extraImageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const imgSrc = [
  "'self'",
  "data:",
  "blob:",
  ...(supabaseUrl ? [supabaseUrl] : []),
  ...extraImageHosts,
].join(" ");

const csp = [
  "default-src 'self'",
  `img-src ${imgSrc}`,
  "media-src 'self' data: blob:",
  // Next.js requires inline/eval for its runtime; styles need inline for styled-jsx/sw-tailwind.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      ...(supabaseUrl
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(supabaseUrl).hostname,
              pathname: "/**",
            },
          ]
        : []),
      ...extraImageHosts.map((host) => ({
        protocol: "https" as const,
        hostname: host,
        pathname: "/**",
      })),
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/drei"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/sequence/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
