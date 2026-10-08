import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import drizzle from "eslint-plugin-drizzle";
import vitest from "@vitest/eslint-plugin";
import globals from "globals";

export default defineConfig([
  globalIgnores([
    "dist/**",
    "drizzle/**",
    "eslint.config.mjs",
    "drizzle.config.ts",
    "vitest.config.ts",
  ]),

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { drizzle },
    rules: {
      "drizzle/enforce-delete-with-where": ["error", { drizzleObjectName: ["db", "tx"] }],
      "drizzle/enforce-update-with-where": ["error", { drizzleObjectName: ["db", "tx"] }],

      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",

      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "no-restricted-properties": [
        "error",
        ...[
          "getHours",
          "getMinutes",
          "getDate",
          "getDay",
          "getMonth",
          "getFullYear",
          "toLocaleString",
          "toLocaleDateString",
          "toLocaleTimeString",
        ].map((property) => ({
          property,
          message: "Works in pc timeZone. Use Intl.DateTimeFormat with timeZone.",
        })),
      ],
    },
  },

  {
    files: ["**/*.test.ts"],
    ...vitest.configs.recommended,
  },
]);
