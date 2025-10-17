import { Locator, Page } from "@playwright/test";
import { PageHelper } from "./pageHelper";

export class PragmaticPlayPage extends PageHelper {
  constructor(page: Page) {
    super(page);
  }

  async extractLobbyData(): Promise<Record<string, any>> {
    console.log(`Current Page URL: ${this.page.url()}`);
    const categorySelector = "a[data-testid*='lobby-category']:not([data-testid*='for-you']):not([data-testid*='search'])";
    const categories: Locator = this.page.locator(categorySelector);
    const categoryCount: number = await categories.count();
    console.log("Category Count: ", categoryCount);

    let lobbyTables: Record<string, any> = {};
    for (let i = 0; i < categoryCount; i++) {
      const currentCategory: Locator = categories.nth(i);
      const categoryName: string = this.getNormalizedString((await currentCategory.textContent()) ?? "");
      console.log("Category Name: ", categoryName);
      await currentCategory.click({ timeout: 5000 });
      await this.page.waitForTimeout(5000);
      lobbyTables[categoryName] = await this.getTables();
    }

    return lobbyTables;
  }

  private getNormalizedString(str: string): string {
    return str.includes("\u00A0") ? str.replace(/\u00A0/g, " ") : str;
  }

  async getTables(): Promise<string[]> {
    const closedTables: Locator = this.page.locator("p:has-text('Show closed tables')");
    const closedTablesCount: number = await closedTables.count();
    if (closedTablesCount === 1) await closedTables.click({ timeout: 5000 });

    const tableNames: Locator = this.page.locator("span[data-testid*='tile-container-title']");
    const tableCount: number = await tableNames.count();
    console.log("Table Count: ", tableCount);

    let tablesArray: string[] = [];
    for (let i = 0; i < tableCount; i++) {
      const tableName: string = await tableNames.nth(i).innerHTML();
      console.log("Table: ", tableName);
      tablesArray.push(tableName);
    }

    return tablesArray;
  }
}
