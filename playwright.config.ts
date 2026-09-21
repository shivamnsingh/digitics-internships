import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  webServer: { command: "npm run dev -- -p 3100", url: "http://127.0.0.1:3100/api/health", reuseExistingServer: false, timeout: 120000, env: { DATA_DIR: ".test-data", ADMIN_PASSWORD: "test-password", ADMIN_SESSION_SECRET: "test-session-secret-test-session-secret" } },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "iphone-se", use: { ...devices["iPhone SE"] } },
    { name: "iphone-14", use: { ...devices["iPhone 14"] } },
    { name: "pixel-7", use: { ...devices["Pixel 7"] } },
    { name: "ipad", use: { ...devices["iPad (gen 7)"] } },
  ],
});
