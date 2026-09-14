import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";

console.log(`[Playwright Config] Base URL: ${baseURL}`);

export default defineConfig({
  testDir: "./tests",

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    headless: true,
    screenshot: "on",
    trace: "on",
    video: "on",
  },

  outputDir: "test-results",
});
