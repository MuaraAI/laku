import type { NextConfig } from "next";

// Security headers (audit prod 8 Okt — temuan #2 MEDIUM: web production hanya
// punya HSTS, tanpa CSP/XFO/XCTO/Referrer-Policy/Permissions-Policy).
//
// Catatan CSP:
// - script-src 'unsafe-inline' diperlukan untuk motion-flag inline di layout,
//   style-src untuk CSS Next.js inline + Google Fonts stylesheet.
// - connect-src: API + Supabase (auth REST + realtime websocket).
// - img-src 'self' data: + blob: (next/image lokal, unoptimized google-g.svg).
// - frame-ancestors 'none' = pengganti modern X-Frame-Options DENY.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://api.muaraai.com https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
