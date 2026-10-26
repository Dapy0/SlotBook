import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintPluginZod from "eslint-plugin-zod";
import eslintConfigPrettier from "eslint-config-prettier";
import { baseConfig } from "../../eslint.config.mjs";
import vitest from "@vitest/eslint-plugin";

const eslintConfig = defineConfig(
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintPluginZod.configs.recommended,
  baseConfig,
  globalIgnores(["vitest.config.ts", "eslint.config.mjs"]),

  {
    ignores: ["node_modules"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "@typescript-eslint/naming-convention": [
        "error",

        { selector: "variable", filter: { regex: "Schema$", match: true }, format: ["camelCase"] },
        { selector: "typeAlias", format: ["PascalCase"] },
      ],
    },
  },
  {
    files: ["src/**/*.test.ts"],
    ...vitest.configs.recommended,
  },
  eslintConfigPrettier,
);

export default eslintConfig;
