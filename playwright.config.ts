import { defineConfig } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  "http://127.0.0.1:4173";

console.log(
  `[Playwright Config] Base URL: ${baseURL}`,
);

export default defineConfig({
  testDir: "./tests/generated",

  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,

    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },

  outputDir: "test-results",
});