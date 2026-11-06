/**
 * ESLint flat configuration for the application.
 * It applies the Next.js rule sets and enforces the architecture import boundaries.
 * Build output and generated type declarations are ignored.
 */
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const SDK_ADAPTER = "src/lib/ai/anthropicExtractor.ts";
const SDK_PATTERN = {
  group: ["@anthropic-ai/*"],
  message: "Only the Anthropic adapter may import the provider SDK.",
};
const AI_PATTERN = {
  group: ["@/lib/ai", "@/lib/ai/*", "**/lib/ai/*", "**/ai/*"],
  message: "This module must stay independent of the AI layer.",
};
const TRACK_PATTERN = {
  group: ["@/lib/track", "@/lib/track/*", "**/lib/track/*", "**/track/*"],
  message: "This module must stay independent of track rendering.",
};
const UI_PATTERN = {
  group: ["@/app/*", "@/components/*"],
  message: "Library modules must not import application or UI code.",
};

function restrictImports(files, patterns, ignores = []) {
  return { files, ignores, rules: { "no-restricted-imports": ["error", { patterns }] } };
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  restrictImports(["src/**/*.{ts,tsx}"], [SDK_PATTERN], [SDK_ADAPTER]),
  restrictImports(["src/lib/events/**"], [SDK_PATTERN, AI_PATTERN, TRACK_PATTERN, UI_PATTERN]),
  restrictImports(["src/lib/track/**"], [SDK_PATTERN, AI_PATTERN, UI_PATTERN]),
  restrictImports(["src/lib/ai/**"], [SDK_PATTERN, TRACK_PATTERN, UI_PATTERN], [SDK_ADAPTER]),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
