/**
 * Playwright configuration for the browser tests.
 * It serves the production build in demo mode with an empty API key, which overrides .env.
 * This guarantees a browser test can never call a real AI provider or spend tokens.
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 3210;
const IS_CI = Boolean(process.env.CI);
const CI_RETRIES = 1;
const LOCAL_RETRIES = 0;
const PHONE_VIEWPORT = { width: 375, height: 812 };
const BASE_URL = `http://localhost:${PORT}`;
/**
 * Tests start as a returning visitor who left every ride-screen section open, so they reach any control directly.
 * The keys match src/components/FoldOut/foldOutChoices.ts; e2e/fold-outs.spec.ts checks the first-time view.
 */
const OPEN_SECTIONS = ["edit", "ride-options", "make-it-yours", "share", "stats"].map((name) => ({
  name: `lifecycle-roller-coaster:open-${name}`,
  value: "on",
}));

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? CI_RETRIES : LOCAL_RETRIES,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    ...devices["Desktop Chrome"],
    viewport: PHONE_VIEWPORT,
    storageState: { cookies: [], origins: [{ origin: BASE_URL, localStorage: OPEN_SECTIONS }] },
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    env: { EXTRACTOR_MODE: "fixture", ANTHROPIC_API_KEY: "" },
  },
});
