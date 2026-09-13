import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintPluginZod from "eslint-plugin-zod";
import eslintConfigPrettier from "eslint-config-prettier";
export const baseConfig = defineConfig(
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  eslintPluginZod.configs.recommended,
  {
    ignores: ["node_modules"],

    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'VariableDeclarator:has(CallExpression[callee.object.name="z"]):not([id.name=/Schema$/])',
          message: 'Variables created with z.*, must end with "Schema"',
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "eslint.config.mjs",
    "postcss.config.mjs",
  ]),
  eslintConfigPrettier,
);
