import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // CI has no .env file, and app.config.ts reads these at import time,
    // so they must exist before any test file imports the app.
    env: {
      JWT_SECRET_KEY: "test-secret-key",
      APP_HOST: "127.0.0.1",
      PORT: "0",
    },
  },
});
