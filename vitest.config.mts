/**
 * Vitest configuration for the pure logic tests.
 * It resolves the same @ path alias that the TypeScript configuration declares.
 * Tests run in the default Node environment with no browser or network.
 */
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
