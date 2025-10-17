import { test as base, Locator, Page, TestInfo } from "@playwright/test";
import { testURLs } from "../assets/testData";
import { PageManager } from "../pages/pageManager";

export const test = base.extend<{ provider: PageManager }>({
  provider: async ({ page }, use, testInfo: TestInfo) => {
    // Navigate to the casino providers page
    await page.goto(testURLs.casino, { timeout: 60000 });
    await page
      .locator("section")
      .filter({ has: page.locator("h2").filter({ hasText: "Providers" }) })
      .waitFor({ state: "visible", timeout: 60000 });
    await page.locator('button[data-gtm*="ClickProviderSeeAllOn"]').click({ timeout: 5000 });
    await page.waitForTimeout(20000);

    // Locate the provider thumbnail using the test title to construct the XPath.
    const title: string = testInfo.title;
    const providerThumbnailXpath: string = "div[contains(@data-gtm,'Btn_ClickProviderIcon')]";
    let providerIconXpath: string;
    switch (title) {
      case "Evolution":
        providerIconXpath = "//img[contains(@src,'v=29631814083502162')]";
        break;
      case "PragmaticPlay":
        providerIconXpath = "//img[contains(@src,'v=29631899148827411')]";
        break;
      case "AllBet":
        providerIconXpath = "//img[contains(@src,'v=29631971404794043')]";
        break;
      case "SexyGaming":
        providerIconXpath = "//img[contains(@src,'v=15053126021031298')]";
        break;
      case "WMCasino":
        providerIconXpath = "//img[contains(@src,'v=15052866925216803')]";
        break;
      case "SAGaming":
        providerIconXpath = "//img[contains(@src,'v=30676817649055862')]";
        break;
      default:
        throw new Error(`Unrecognized provider title: "${title}". Cannot determine XPath.`);
    }
    const providerThumbnail: Locator = page.locator(`${providerIconXpath}/ancestor::${providerThumbnailXpath}`);

    // Skip if its still coming soon
    if (await providerThumbnail.locator("//div[normalize-space()='Coming soon']").isVisible())
      test.skip(true, 'Provider is currently "Coming Soon"');

    // Wait for the browser to open a new tab/window (popup event)
    const popupPromise = page.waitForEvent("popup");
    providerThumbnail.click({ timeout: 5000 });
    const newPage = (await popupPromise) as Page;

    // Resize the popup window by setting viewport size
    await newPage.setViewportSize({ width: 1500, height: 1000 });

    // Yield the new Page object (the game window) to the test function.
    await newPage.waitForTimeout(15000);
    await newPage.waitForLoadState();
    const pageManager = new PageManager(newPage);
    await use(pageManager);

    // Cleanup: Close the original browser tab used for navigation (newPage handles the game).
    await page.close();
  },
});
