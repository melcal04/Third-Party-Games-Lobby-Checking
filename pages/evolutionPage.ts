import { Frame, Locator, Page } from "@playwright/test";
import { PageHelper } from "./pageHelper";

export class EvolutionPage extends PageHelper {
  constructor(page: Page) {
    super(page);
  }

  async extractLobbyData(): Promise<Record<string, any>> {
    console.log(`Current Page URL: ${this.page.url()}`);
    const frame: Frame = await this.getIframe();
    const categories: Locator = frame.locator("li[id*='category-navigator']:not([id*='top_games']):not([id*='all_games'])");
    const categoryCount: number = await categories.count();
    console.log("Category Count: ", categoryCount);

    let lobbyTables: Record<string, any> = {};
    for (let i = 0; i < categoryCount; i++) {
      const currentCategory: Locator = categories.nth(i);
      const categoryName: string = await currentCategory.innerText();
      console.log("Category Name: ", categoryName);
      await currentCategory.click({ timeout: 5000 });
      await frame.waitForTimeout(5000);
      lobbyTables[categoryName] = await this.getTables(frame);
    }

    return lobbyTables;
  }

  async getTables(frame: Frame): Promise<string[]> {
    const tableNames: Locator = await this.scrollAndFindTables(frame, "p[data-role='tile-name']");
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
