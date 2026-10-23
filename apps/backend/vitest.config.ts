import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      JWT_SECRET_KEY: "test-secret-key",
      APP_HOST: "127.0.0.1",
      PORT: "0",
      NODE_ENV: "test",
    },
    globalSetup: ["./src/test/globalSetup.ts"],
    setupFiles: ["./src/test/setupEnv.ts"],
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 60_000,
  },
});
