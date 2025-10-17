import { chromium } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();
import * as fs from "fs";
import * as path from "path";
import { Workbook, Worksheet } from "exceljs";
import { testURLs } from "../assets/testData";

/**
 * Logs into SharePoint, navigates to a specific document library,
 * downloads a target Excel file, and saves it locally.
 *
 * @param outputDir The local directory path where the file should be saved.
 * @param outputName The filename to save the downloaded file as.
 */
export async function downloadExcelFromSharepoint(outputDir: string, outputName: string) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    recordVideo: undefined,
  });

  const page = await context.newPage();
  await page.goto(testURLs.microsoft, { timeout: 60000 });
  await page.locator("#i0116").fill(process.env.SENDER_EMAIL_USERNAME!);
  await page.locator("#idSIButton9").click();
  await page.waitForSelector("#i0118", { timeout: 15000 });
  await page.fill("#i0118", process.env.SENDER_EMAIL_PASSWORD!);
  await page.click("#idSIButton9");

  // Handle the "Stay Signed In?" prompt if it appears.
  try {
    await page.locator("#idBtn_Back").click({ timeout: 5000 });
  } catch (error) {
    console.log('Did not encounter "Stay Signed In" prompt, proceeding.');
  }

  await page.goto(testURLs.sharepoint, { timeout: 60000 });

  // Initiates the file download by right-clicking the file link,
  // selecting 'Download' from the context menu, and waiting for the file transfer to complete.
  const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
  const fileName = "Third Party Games Table List.xlsx";
  const fileLink = page.locator("span[data-id='heroField']").getByText(fileName);
  await fileLink.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Download" }).click();
  const download = await downloadPromise;

  // Save the downloaded file to the specified local path.
  const downloadFile = path.join(outputDir, outputName);
  await download.saveAs(downloadFile);
  console.log(`Excel file saved successfully to: ${downloadFile}`);

  await page.close();
}

/**
 * Creates an empty Excel workbook at the specified path and saves it, serving as the starting point.
 * This is intended for use in Playwright's Global Setup.
 *
 * @param outputDir The path to the directory where the file will be saved.
 * @param outputName The filename for the temporary workbook.
 */
export async function createTempWorkbook(outputDir: string, outputName: string): Promise<void> {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const tempFile = path.join(outputDir, outputName);
  try {
    await new Workbook().xlsx.writeFile(tempFile);
    console.log(`Excel file created successfully at ${tempFile}!`);
  } catch (err) {
    console.error("Error writing temporary Excel file:", err);
    throw err;
  }
}

/**
 * Reads the existing temporary workbook, adds a new sheet with provider data, and saves it back.
 * This is intended for use in the Playwright test.afterEach hook.
 *
 * @param providerName The name of the provider (used for the sheet name).
 * @param expectedData Expected lobby data extracted from the source file.
 * @param actualData Actual lobby data extracted during the test run.
 * @param addedTableData Tables found in 'actual' but not in 'expected'.
 * @param removedTableData Tables found in 'expected' but not in 'actual'.
 * @param outputDir The path to the directory where the file will be saved.
 * @param outputName The filename for the temporary workbook.
 */
export async function addProviderSheet(
  providerName: string,
  expectedData: Record<string, string[]>,
  actualData: Record<string, string[]>,
  addedTableData: Record<string, string[]>,
  removedTableData: Record<string, string[]>,
  outputDir: string,
  outputName: string
): Promise<void> {
  const tempFile = path.join(outputDir, outputName);
  const workbook = new Workbook();
  await workbook.xlsx.readFile(tempFile);

  const sheetName = providerName.substring(0, 31).replace(/[\[\]\*\/\:\\\?]/g, "_");
  const providerWorksheet: Worksheet = workbook.addWorksheet(sheetName);

  const allCategories = new Set([...Object.keys(actualData), ...Object.keys(expectedData)]);
  providerWorksheet.addRow(["Category", "Expected Tables", "Added Tables", "Removed Tables"]);
  const separatorRowNumbers: number[] = [];

  for (const category of allCategories) {
    const expectedTables = expectedData[category] ?? [];
    const addedTables = addedTableData[category] ?? [];
    const removedTables = removedTableData[category] ?? [];

    const maxLength = Math.max(expectedTables.length, addedTables.length, removedTables.length);
    for (let i = 0; i < maxLength; i++) {
      providerWorksheet.addRow([
        i === 0 ? category : "", // Column A: Category Name. Only display on the first row of the category block.
        expectedTables[i] ?? "", // Column B: Expected Tables (or empty string if missing)
        addedTables[i] ?? "", // Column C: Added Tables (or empty string if missing)
        removedTables[i] ?? "", // Column D: Removed Tables (or empty string if missing)
      ]);
    }

    // Add a blank row for visual separation between different categories.
    const separatorRow = providerWorksheet.addRow([]);
    separatorRowNumbers.push(separatorRow.number);
  }

  // --- Styling: Column Widths ---
  providerWorksheet.columns = [
    { header: "Category", width: 30 },
    { header: "Expected Tables", width: 30 },
    { header: "Added Tables", width: 30 },
    { header: "Removed Tables", width: 30 },
  ];

  // --- Styling: Header Row (Row 1) ---
  const headerRow = providerWorksheet.getRow(1);
  headerRow.font = { bold: true, size: 14 };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF000000" } };
    cell.font.color = { argb: "FFFFFFFF" };
    cell.alignment = { horizontal: "center" };
  });

  // Make the category separator rows very thin for visual effect.
  for (const rowNum of separatorRowNumbers) {
    const row = providerWorksheet.getRow(rowNum);
    row.height = 3;
  }

  // --- Styling: All Cells - Solid Borders ---
  const totalRowCount = providerWorksheet.lastRow?.number ?? 1;
  const solidBorder = { style: "thin" as const, color: { argb: "FF000000" } };
  for (let i = 1; i <= totalRowCount; i++) {
    const row = providerWorksheet.getRow(i);
    row.eachCell({ includeEmpty: true }, (cell) => {
      if (!separatorRowNumbers.includes(i)) {
        cell.border = {
          top: solidBorder,
          left: solidBorder,
          bottom: solidBorder,
          right: solidBorder,
        };
      }
    });
  }

  // Write the updated workbook back to the temporary file path.
  await workbook.xlsx.writeFile(tempFile);
}

/**
 * Loads the temporary workbook, renames the output, and saves it to the final report location.
 * This is intended for use in Playwright's Global Teardown.
 *
 * @param inputDir The directory where the temporary workbook file created and updated during tests.
 * @param inputName The filename for the temporary workbook.
 * @param outputDir The directory where the final report should be saved.
 * @param outputName The desired filename for the final report (e.g., "Lobby Report.xlsx").
 */
export async function saveWorkbook(inputDir: string, inputName: string, outputDir: string, outputName: string): Promise<void> {
  const workbook = new Workbook();
  const inputFile = path.join(inputDir, inputName);
  await workbook.xlsx.readFile(inputFile);
  const outputFile = path.join(outputDir, outputName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  try {
    await workbook.xlsx.writeFile(outputFile);
    console.log(`Consolidated report created successfully at ${outputFile}!`);
  } catch (err) {
    console.error("Error writing final Excel file:", err);
    throw err;
  }
}
