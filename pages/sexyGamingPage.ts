import { Frame, Locator, Page } from "@playwright/test";
import { PageHelper } from "./pageHelper";

export class SexyGamingPage extends PageHelper {
  constructor(page: Page) {
    super(page);
  }

  async extractLobbyData(): Promise<Record<string, any>> {
    console.log(`Current Page URL: ${this.page.url()}`);
    const frame: Frame = await this.getIframe("iframe#iframeGameHall");
    const categories: Locator = frame.locator("div.relative.mt-12 > div > div:nth-child(2) button");
    const categoryCount: number = await categories.count();
    console.log("Category Count: ", categoryCount);

    let lobbyTables: Record<string, any> = {};
    for (let i = 0; i < categoryCount; i++) {
      await frame.locator('button:has(div:text("HIDE"))').click({ timeout: 5000 });
      const currentCategory: Locator = categories.nth(i);
      const categoryName: string = await currentCategory.innerText();
      console.log("Category Name: ", categoryName);
      await currentCategory.click({ timeout: 5000 });
      await frame.waitForTimeout(5000);
      lobbyTables[categoryName] = await this.getTables(frame, categoryName);
    }

    return lobbyTables;
  }

  async getTables(frame: Frame, categoryName: string): Promise<string[]> {
    const tableNameSelector: string =
      "div[class*='item-view']:not([style*='transform: translateY(-9999px)']) > div > div > div > div > span";
    let tableNames: Locator;
    if (categoryName === "Baccarat") tableNames = await this.scrollAndFindTables(frame, tableNameSelector);
    else tableNames = frame.locator(tableNameSelector);
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
