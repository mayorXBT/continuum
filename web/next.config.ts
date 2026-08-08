import type { NextConfig } from "next";

/**
 * Security headers. HSTS already arrives from the host, so it is not repeated
 * here. No Content-Security-Policy is set: wallet connectors inject their own
 * scripts and frames, and a CSP tight enough to be worth having needs to be
 * validated against every connector rather than guessed at.
 */
const securityHeaders = [
  // Clickjacking guard. This matters more than usual for a staking dApp: a
  // framed transfer or stake panel can be used to trick a holder into signing.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here needs these devices.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
