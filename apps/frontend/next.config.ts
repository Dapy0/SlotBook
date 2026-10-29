import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// const backendEnvPath = path.resolve(process.cwd(), '../backend/.env');

// if (!fs.existsSync(backendEnvPath)) {
//   throw new Error(`Backend .env not found at ${backendEnvPath}`);
// }

// const backendEnv = dotenv.parse(fs.readFileSync(backendEnvPath));
// const BACKEND_PORT = backendEnv.PORT;
const nextConfig: NextConfig = {
  // env: {
  //   NEXT_PUBLIC_BACKEND_URL: `http://localhost:${BACKEND_PORT}`,
  // },
  typedRoutes: true,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:3001"}/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/uploading/bundler-plugin-options/

  org: "dapy",

  project: "slotbook",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
