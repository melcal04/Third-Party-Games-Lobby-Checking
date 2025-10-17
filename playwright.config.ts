import { defineConfig, devices } from "@playwright/test";
import { testDirectory } from "./assets/testData";

export default defineConfig({
  globalSetup: "./global/globalSetup",
  globalTeardown: "./global/globalTeardown",
  timeout: 300000, // 5 minutes
  testDir: "./tests",
  fullyParallel: false,
  use: {
    headless: false,
    trace: "on",
    video: "on",
    ignoreHTTPSErrors: true,
    storageState: testDirectory.stateJsonFullPath,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        launchOptions: {
          args: ["--ignore-certificate-errors", "--mute-audio"],
        },
      },
    },
  ],
});
