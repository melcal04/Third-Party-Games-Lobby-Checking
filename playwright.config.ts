import { defineConfig, devices } from "@playwright/test";
import { testDirectory } from "./assets/testData";

export default defineConfig({
  globalSetup: "./global/globalSetup",
  timeout: 120000, // 2 minutes for each test
  testDir: "./tests",
  fullyParallel: false,
  use: {
    headless: false,
    trace: "on",
    video: "on",
    ignoreHTTPSErrors: true,
    storageState: testDirectory.stateJson,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        launchOptions: {
          args: ["--ignore-certificate-errors"],
        },
      },
    },
  ],
});
