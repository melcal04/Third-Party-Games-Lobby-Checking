import { TestInfo } from "@playwright/test";
import { testDirectory } from "../assets/testData";
import { test } from "../fixtures/customFixture";
import { verifyAddedTablesInTheRecordList, verifyRemovedTablesInTheRecordList } from "../utils/VerificationHandler";
import { generateJsonFromProvider, generateJsonReport, readJsonProviderData } from "../utils/JsonHandler";
import { addProviderSheet } from "../utils/ExcelHandler";

test.describe("Lobby Checking", () => {
  const MAX_ATTEMPTS: number = 5;
  let providerTables: Record<string, any>;
  let providerName: string;

  test.beforeEach(async ({ provider }, testInfo: TestInfo) => {
    providerName = testInfo.title;
    console.log(`Starting check lobby tables in: ${testInfo.title}`);
  });

  test("Evolution", async ({ provider }) => {
    for (let index = 0; index < MAX_ATTEMPTS; index++) {
      await provider.waitForNumberOfSeconds(10);
      let extractionFailed = false;
      try {
        providerTables = await provider.evolution.extractLobbyData();
        if (Object.keys(providerTables).length > 0) {
          console.log(`Successfully extracted data on attempt ${index + 1}.`);
          break;
        } else {
          console.warn(`Data extracted but was empty on attempt ${index + 1}.`);
          extractionFailed = true;
        }
      } catch (error) {
        console.error(`Extraction failed with error on attempt ${index + 1}:`, error);
        extractionFailed = true;
      }

      if (extractionFailed && index < 2) {
        console.log("Retrying: Reloading page...");
        await provider.reload();
      } else if (extractionFailed && index === 2) {
        console.error("Failed to extract lobby data after 3 attempts. Giving up.");
      }
    }
  });

  test("PragmaticPlay", async ({ provider }) => {
    for (let index = 0; index < MAX_ATTEMPTS; index++) {
      await provider.waitForNumberOfSeconds(10);
      let extractionFailed = false;
      try {
        providerTables = await provider.pragmaticPlay.extractLobbyData();
        if (Object.keys(providerTables).length > 0) {
          console.log(`Successfully extracted data on attempt ${index + 1}.`);
          break;
        } else {
          console.warn(`Data extracted but was empty on attempt ${index + 1}.`);
          extractionFailed = true;
        }
      } catch (error) {
        console.error(`Extraction failed with error on attempt ${index + 1}:`, error);
        extractionFailed = true;
      }

      if (extractionFailed && index < 2) {
        console.log("Retrying: Reloading page...");
        await provider.reload();
      } else if (extractionFailed && index === 2) {
        console.error("Failed to extract lobby data after 3 attempts. Giving up.");
      }
    }
  });

  test("AllBet", async ({ provider }) => {
    for (let index = 0; index < MAX_ATTEMPTS; index++) {
      await provider.waitForNumberOfSeconds(15);
      let extractionFailed = false;
      try {
        providerTables = await provider.allBet.extractLobbyData();
        if (Object.keys(providerTables).length > 0) {
          console.log(`Successfully extracted data on attempt ${index + 1}.`);
          break;
        } else {
          console.warn(`Data extracted but was empty on attempt ${index + 1}.`);
          extractionFailed = true;
        }
      } catch (error) {
        console.error(`Extraction failed with error on attempt ${index + 1}:`, error);
        extractionFailed = true;
      }

      if (extractionFailed && index < 2) {
        console.log("Retrying: Reloading page...");
        await provider.reload();
      } else if (extractionFailed && index === 2) {
        console.error("Failed to extract lobby data after 3 attempts. Giving up.");
      }
    }
  });

  test("SexyGaming", async ({ provider }) => {
    for (let index = 0; index < MAX_ATTEMPTS; index++) {
      await provider.waitForNumberOfSeconds(10);
      let extractionFailed = false;
      try {
        providerTables = await provider.sexyGaming.extractLobbyData();
        if (Object.keys(providerTables).length > 0) {
          console.log(`Successfully extracted data on attempt ${index + 1}.`);
          break;
        } else {
          console.warn(`Data extracted but was empty on attempt ${index + 1}.`);
          extractionFailed = true;
        }
      } catch (error) {
        console.error(`Extraction failed with error on attempt ${index + 1}:`, error);
        extractionFailed = true;
      }

      if (extractionFailed && index < 2) {
        console.log("Retrying: Reloading page...");
        await provider.reload();
      } else if (extractionFailed && index === 2) {
        console.error("Failed to extract lobby data after 3 attempts. Giving up.");
      }
    }
  });

  test("WMCasino", async ({ provider }) => {
    for (let index = 0; index < MAX_ATTEMPTS; index++) {
      await provider.waitForNumberOfSeconds(90);
      let extractionFailed = false;
      try {
        providerTables = await provider.wmCasino.extractLobbyData();
        if (Object.keys(providerTables).length > 0) {
          console.log(`Successfully extracted data on attempt ${index + 1}.`);
          break;
        } else {
          console.warn(`Data extracted but was empty on attempt ${index + 1}.`);
          extractionFailed = true;
        }
      } catch (error) {
        console.error(`Extraction failed with error on attempt ${index + 1}:`, error);
        extractionFailed = true;
      }

      if (extractionFailed && index < 2) {
        console.log("Retrying: Reloading page...");
        await provider.reload();
      } else if (extractionFailed && index === 2) {
        console.error("Failed to extract lobby data after 3 attempts. Giving up.");
      }
    }
  });

  test("SAGaming", async ({ provider }) => {
    for (let index = 0; index < MAX_ATTEMPTS; index++) {
      await provider.waitForNumberOfSeconds(10);
      let extractionFailed = false;
      try {
        providerTables = await provider.saGaming.extractLobbyData();
        if (Object.keys(providerTables).length > 0) {
          console.log(`Successfully extracted data on attempt ${index + 1}.`);
          break;
        } else {
          console.warn(`Data extracted but was empty on attempt ${index + 1}.`);
          extractionFailed = true;
        }
      } catch (error) {
        console.error(`Extraction failed with error on attempt ${index + 1}:`, error);
        extractionFailed = true;
      }

      if (extractionFailed && index < 2) {
        console.log("Retrying: Reloading page...");
        await provider.reload();
      } else if (extractionFailed && index === 2) {
        console.error("Failed to extract lobby data after 3 attempts. Giving up.");
      }
    }
  });

  test.afterEach(async () => {
    await generateJsonFromProvider(providerName, providerTables, testDirectory.actualJsonFolder);
    const expectedData: Record<string, string[]> = await readJsonProviderData(testDirectory.expectedJsonFolder, providerName);
    const actualData: Record<string, string[]> = await readJsonProviderData(testDirectory.actualJsonFolder, providerName);
    const addedTableData: Record<string, string[]> = await verifyAddedTablesInTheRecordList(expectedData, actualData);
    const removedTableData: Record<string, string[]> = await verifyRemovedTablesInTheRecordList(expectedData, actualData);
    await generateJsonReport(providerName, addedTableData, removedTableData, testDirectory.reportJsonFolder);
    await addProviderSheet(
      providerName,
      expectedData,
      actualData,
      addedTableData,
      removedTableData,
      testDirectory.tempExcelFolder,
      testDirectory.tempExcelFileName
    );
  });
});
