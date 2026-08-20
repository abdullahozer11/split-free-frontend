const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierRecommended = require("eslint-plugin-prettier/recommended");
const jestPlugin = require("eslint-plugin-jest");

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ...jestPlugin.configs["flat/recommended"],
    files: [
      "**/__tests__/**/*.[jt]s?(x)",
      "**/*.(test|spec).[jt]s?(x)",
      "jest.setup.js",
      "jest.config.js",
    ],
  },
  {
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
  {
    files: [
      "*.config.js",
      "babel.config.js",
      "metro.config.js",
      "tailwind.config.js",
      "jest.config.js",
      "jest.setup.js",
      "eslint.config.js",
    ],
    languageOptions: {
      globals: {
        ...require("globals").node,
      },
    },
  },
  {
    ignores: [
      ".expo/**",
      "node_modules/**",
      "android/**",
      "ios/**",
      "supabase/**",
      "coverage/**",
      "dist/**",
      "src/database.types.ts",
      "expo-env.d.ts",
      "index.js",
    ],
  },
]);
