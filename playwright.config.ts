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

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? CI_RETRIES : LOCAL_RETRIES,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices["Desktop Chrome"],
    viewport: PHONE_VIEWPORT,
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    env: { EXTRACTOR_MODE: "fixture", ANTHROPIC_API_KEY: "" },
  },
});
