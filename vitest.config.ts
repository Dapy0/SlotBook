import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["apps/backend", "packages/shared", "apps/frontend"],
  },
});
