import { TestInfo } from "@playwright/test";
import { mainDirectory, testDirectory } from "../assets/testData";
import { test } from "../fixtures/customFixture";
import { verifyAddedTablesInTheRecordList, verifyRemovedTablesInTheRecordList } from "../utils/VerificationHandler";
import { generateJsonFromExcel, generateJsonFromProvider, generateJsonReport, readJsonProviderData } from "../utils/JsonHandler";
import { downloadExcelFromSharepoint, generateExcelReport } from "../utils/ExcelHandler";
import { sendEmail } from "../utils/EmailHandler";

test.describe("Lobby Checking", () => {
  let providerTables: Record<string, any>;
  let providerName: string;

  test.beforeAll(async () => {
    // Download the Excel file from Sharepoint before generating json
    await downloadExcelFromSharepoint(mainDirectory.excelFolder, testDirectory.expectedExcelFilePath);
    await generateJsonFromExcel(testDirectory.expectedExcelFilePath, testDirectory.expectedJsonFolder);
  });

  test.beforeEach(async ({ provider }, testInfo: TestInfo) => {
    providerName = testInfo.title;
    console.log(`Starting check lobby tables in: ${testInfo.title}`);
  });

  test("Evolution", async ({ provider }) => {
    await provider.waitForNumberOfSeconds(10);
    providerTables = await provider.evolution.extractLobbyData();
  });

  test("PragmaticPlay", async ({ provider }) => {
    await provider.waitForNumberOfSeconds(10);
    providerTables = await provider.pragmaticPlay.extractLobbyData();
  });

  test("AllBet", async ({ provider }) => {
    await provider.waitForNumberOfSeconds(10);
    providerTables = await provider.allBet.extractLobbyData();
  });

  test("SexyGaming", async ({ provider }) => {
    await provider.waitForNumberOfSeconds(10);
    providerTables = await provider.sexyGaming.extractLobbyData();
  });

  test("WMCasino", async ({ provider }) => {
    await provider.waitForNumberOfSeconds(80);
    providerTables = await provider.wmCasino.extractLobbyData();
  });

  test("SAGaming", async ({ provider }) => {
    await provider.waitForNumberOfSeconds(10);
    providerTables = await provider.saGaming.extractLobbyData();
  });

  test.afterEach(async () => {
    await generateJsonFromProvider(providerName, providerTables, testDirectory.actualJsonFolder);
    const expectedData: Record<string, string[]> = await readJsonProviderData(testDirectory.expectedJsonFolder, providerName);
    const actualData: Record<string, string[]> = await readJsonProviderData(testDirectory.actualJsonFolder, providerName);
    const addedTableData: Record<string, string[]> = await verifyAddedTablesInTheRecordList(expectedData, actualData);
    const removedTableData: Record<string, string[]> = await verifyRemovedTablesInTheRecordList(expectedData, actualData);
    await generateJsonReport(providerName, addedTableData, removedTableData, testDirectory.reportJsonFolder);
    await generateExcelReport(providerName, expectedData, actualData, addedTableData, removedTableData, testDirectory.reportExcelFolder);
  });

  test.afterAll(async () => {
    await sendEmail(testDirectory.reportExcelFolder);
  });
});
