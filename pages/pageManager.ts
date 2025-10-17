import { Page } from "@playwright/test";
import { AllBetPage } from "./AllBetPage";
import { EvolutionPage } from "./evolutionPage";
import { PragmaticPlayPage } from "./pragmaticPlayPage";
import { SexyGamingPage } from "./sexyGamingPage";
import { WMCasinoPage } from "./wmCasinoPage";
import { SAGamingPage } from "./saGamingPage";

export class PageManager {
  private readonly page: Page;
  public readonly evolution: EvolutionPage;
  public readonly pragmaticPlay: PragmaticPlayPage;
  public readonly allBet: AllBetPage;
  public readonly sexyGaming: SexyGamingPage;
  public readonly wmCasino: WMCasinoPage;
  public readonly saGaming: SAGamingPage;

  constructor(page: Page) {
    this.page = page;
    this.evolution = new EvolutionPage(this.page);
    this.pragmaticPlay = new PragmaticPlayPage(this.page);
    this.allBet = new AllBetPage(this.page);
    this.sexyGaming = new SexyGamingPage(this.page);
    this.wmCasino = new WMCasinoPage(this.page);
    this.saGaming = new SAGamingPage(this.page);
  }

  /**
   * Pauses test execution for a specified number of seconds using Playwright's waitForTimeout.
   * @param timeInSeconds The duration to wait, in seconds.
   */
  async waitForNumberOfSeconds(timeInSeconds: number): Promise<void> {
    await this.page.waitForTimeout(timeInSeconds * 1000);
  }

  /**
   * Forces a hard reload of the current page.
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }
}
