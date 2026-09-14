import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import next from "@next/eslint-plugin-next";

/**
 * @typedef {ConfigWithExtendsArray} NewType
 */

const eslintConfig = defineConfig([
  {
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
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

  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
