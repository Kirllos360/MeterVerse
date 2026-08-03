import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // P54-standalone: Admin (:3535) and Portal (:3030) are separate web apps on
  // one source tree. Each profile gets its OWN distDir so both Next dev servers
  // can run SIMULTANEOUSLY without colliding on a shared .next directory.
  distDir: process.env.PORTAL_MODE === '1' ? '.next-portal' : '.next',
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'clerk.com',
        port: ''
      }
    ]
  },
  // Fonts loaded via Google Fonts CDN in layout.tsx
  experimental: {
    optimizePackageImports: ["framer-motion", "@tabler/icons-react", "recharts", "lucide-react", "date-fns"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Bundle analysis (run: ANALYZE=true next build)
  // Removed invalid withBundleAnalyzer config key
  async rewrites() {
    // MeterVerse OS: admin FE (3535) proxies to Admin API (3131); portal FE
    // (3030) proxies to Portal API (3003) when PORTAL_MODE=1.
    const backendPort = process.env.PORTAL_MODE === "1" ? "3003" : "3131"
    return [
      {
        source: "/api/:path*",
        destination: `http://localhost:${backendPort}/api/:path*`,
      },
    ]
  },
  async redirects() {
    // Admin profile (:3535): the Admin console is served DIRECTLY at "/" via the
    // profile-aware root page — no /admin redirect needed (URL stays localhost:3535).
    // Portal profile (:3030) serves the user version at "/".
    return [
      {
        source: "/admin/:path+",
        destination: "/admin",
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
};

let configWithPlugins = baseConfig;

// Conditionally enable Sentry configuration (disabled in CI or when env vars missing)
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED && process.env.NEXT_PUBLIC_SENTRY_ORG && process.env.NEXT_PUBLIC_SENTRY_PROJECT) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    org: process.env.NEXT_PUBLIC_SENTRY_ORG,
    project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    tunnelRoute: '/monitoring',

    // Disable Sentry telemetry
    telemetry: false,

    // Sentry v10: moved under webpack namespace
    webpack: {
      reactComponentAnnotation: {
        enabled: true
      },
      treeshake: {
        removeDebugLogging: true
      }
    },

    // Disable source map upload when org/project are not configured
    sourcemaps: {
      disable: !process.env.NEXT_PUBLIC_SENTRY_ORG || !process.env.NEXT_PUBLIC_SENTRY_PROJECT
    }
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;



