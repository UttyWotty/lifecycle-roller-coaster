/**
 * Vitest configuration for the pure logic tests.
 * It resolves the same @ path alias that the TypeScript configuration declares.
 * Tests run in Node with no browser or network, and browser specs in e2e are left to Playwright.
 */
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
