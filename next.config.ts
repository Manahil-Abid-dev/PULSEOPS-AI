import type { NextConfig } from "next";

/**
 * Secure HTTP headers (task: Security Hardening — secure headers).
 *
 * NOTE ON CSP: this policy allows 'unsafe-inline' for styles because
 * Tailwind's runtime + several UI primitives inject inline styles; a
 * stricter CSP with nonces is possible but requires wiring a per-request
 * nonce through the App Router, which is a larger change than "add secure
 * headers" — documented here as a follow-up rather than attempted
 * silently. connect-src includes Firebase/Firestore/Google Identity
 * endpoints the client SDK talks to directly from the browser.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "0" }, // modern browsers rely on CSP instead of the legacy XSS auditor
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-ancestors 'none'",
    ].join("; "),
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
