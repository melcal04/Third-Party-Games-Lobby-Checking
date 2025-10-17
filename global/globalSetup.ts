import { chromium, Request } from "@playwright/test";
import { testURLs, testAccount, testDirectory, mainDirectory } from "../assets/testData";

export default async function globalSetup() {
  console.log("Starting global setup...");
  await createLoginStates();
  console.log("Global setup complete.");
}

/**
 * Creates and saves an authenticated browser state for test account.
 */
async function createLoginStates() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    recordVideo: undefined,
  });
  const page = await context.newPage();

  // Check if the failed request matches the URL
  let isRequestBlocked = false;
  page.on("requestfailed", (request: Request) => {
    if (request.url().includes(testURLs.base)) {
      isRequestBlocked = true;
      console.error(`🚨 NETWORK BLOCK DETECTED: Request to ${request.url()} failed with error: ${request.failure()}`);
    }
  });

  // Navigate to the base URL
  await page.goto(testURLs.base, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Check the status immediately after navigation
  if (isRequestBlocked) throw new Error(`CRITICAL: Base URL ${testURLs.base} was blocked or failed to load. Aborting login setup.`);

  // Login username and password
  await page.locator("#LoginName").fill(testAccount.username, { timeout: 5000 });
  await page.locator("#DesktopPassword").fill(testAccount.password, { timeout: 5000 });
  await page.getByRole("button", { name: "Log in" }).click({ timeout: 5000 });

  // Wait for successful navigation after login
  await page.waitForURL(testURLs.sports, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // Save state on success
  await page.context().storageState({ path: testDirectory.stateJsonFilePath });
  await page.close();
  console.log("Login state saved successfully.");
}
