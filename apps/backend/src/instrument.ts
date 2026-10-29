import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  environment: process.env.NODE_ENV ?? "development",
  release: process.env.RAILWAY_GIT_COMMIT_SHA,
  tracesSampleRate: 1.0,
  profileLifecycle: "trace",
  profileSessionSampleRate: 1.0,
});
