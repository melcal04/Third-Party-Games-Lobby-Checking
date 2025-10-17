import { Frame, Locator, Page } from "@playwright/test";
import { PageHelper } from "./pageHelper";

export class WMCasinoPage extends PageHelper {
  constructor(page: Page) {
    super(page);
  }

  async extractLobbyData(): Promise<Record<string, any>> {
    console.log(`Current Page URL: ${this.page.url()}`);
    const categorySelector = "div#ui_3_menu_box div.open_btn span[class*='text_']";
    const categories: Locator[] = await this.getFilteredCategoryLocators(categorySelector);
    const categoryCount: number = categories.length;
    console.log("Category Count: ", categoryCount);

    let lobbyTables: Record<string, any> = {};
    for (let i = 0; i < categoryCount; i++) {
      const currentCategory: Locator = categories[i];
      const categoryName: string = await this.getFilteredTextContent(currentCategory);
      console.log("Category Name: ", categoryName);
      await currentCategory.click({ timeout: 5000 });
      await this.page.waitForTimeout(5000);
      lobbyTables[categoryName] = await this.getTables();
    }

    return lobbyTables;
  }

  async getTables(): Promise<string[]> {
    const frame: Frame = await this.getIframe("iframe#iframe_109");
    const tableNames: Locator = frame.locator("article#game_list_box div.game_name");
    const tableCount: number = await tableNames.count();
    console.log("Table Count: ", tableCount);

    let tablesArray: string[] = [];
    for (let i = 0; i < tableCount; i++) {
      const filteredText: string = await this.getFilteredTextContent(tableNames.nth(i));
      const regularText: string | null = await tableNames.nth(i).textContent();
      const tableName: string = filteredText + (regularText || "");
      console.log("Table: ", tableName);
      tablesArray.push(tableName);
    }

    return tablesArray;
  }

  private async getFilteredCategoryLocators(selector: string): Promise<Locator[]> {
    const allCategoryElements = this.page.locator(selector);
    const categoryCount = await allCategoryElements.count();

    const officialCategories: Locator[] = [];
    for (let i = 0; i < categoryCount; i++) {
      const currentLocator = allCategoryElements.nth(i);
      const textContent = await this.getFilteredTextContent(currentLocator);
      const isOfficial = !textContent.includes("All") && !textContent.includes("Niuniu") && !textContent.includes("Multiple");
      if (isOfficial) officialCategories.push(currentLocator);
    }

    return officialCategories;
  }

  private async getFilteredTextContent(locator: Locator): Promise<string> {
    return await locator.evaluate((el) => {
      const computedStyle = getComputedStyle(el, "::before");
      return computedStyle.content.replace(/['"]/g, "");
    });
  }
}
