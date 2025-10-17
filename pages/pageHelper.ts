import { ElementHandle, Frame, Locator, Page } from "@playwright/test";

export class PageHelper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Finds and returns the Playwright Frame object for an iframe element.
   * Use the returned Frame object to interact with elements inside the iframe's content.
   * @param selector CSS selector for the iframe. Defaults to 'iframe'.
   * @returns A Promise that resolves to the ready Playwright Frame object.
   */
  async getIframe(selector: string = "iframe"): Promise<Frame> {
    // Locate the iframe element on the main page.
    const iframeLocator: Locator = this.page.locator(selector);

    // Wait up to 15s for the iframe element to appear in the DOM.
    await iframeLocator.waitFor({ state: "attached", timeout: 15000 });
    console.log("Iframe element located");

    // Get the ElementHandle (direct DOM reference) for the iframe tag.
    const handle: ElementHandle<Element> | null = await iframeLocator.elementHandle();
    if (!handle) throw new Error(`Failed to get ElementHandle for iframe: ${selector}`);

    // Check the element is actually an <iframe> to prevent errors.
    const tagName = await handle.evaluate((el) => el.tagName.toLowerCase());
    if (tagName !== "iframe") throw new Error(`Element is not an iframe. Got: ${tagName}`);

    // Cast the handle for type safety to allow access to contentFrame().
    const iframeHandle = handle as ElementHandle<HTMLIFrameElement>;

    // Get the Frame object, which represents the inner document context.
    const frame: Frame | null = await iframeHandle.contentFrame();
    if (!frame) throw new Error(`Failed to get content Frame from iframe: ${selector}`);
    console.log("Successfully got the iframe content frame");

    // Return the Frame object, ready for interaction.
    return frame;
  }

  /**
   * Scrolls the frame repeatedly to load all dynamic content matching the selector.
   * Scrolling continues until no new elements are found, addressing infinite scrolling/virtualized lists.
   */
  async scrollAndFindTables(frame: Frame, selector: string): Promise<Locator> {
    let previousCount = 0;
    let currentCount = 0;
    do {
      previousCount = currentCount;
      const currentTables: Locator = frame.locator(selector);
      currentCount = await currentTables.count();
      if (currentCount > 0) {
        await currentTables.nth(currentCount - 1).scrollIntoViewIfNeeded();
        await frame.waitForTimeout(2000);
      }
    } while (currentCount > previousCount);
    return frame.locator(selector);
  }
}
