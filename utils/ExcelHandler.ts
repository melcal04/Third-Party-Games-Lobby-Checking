import { chromium } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();
import * as fs from "fs";
import * as path from "path";
import ExcelJS, { Workbook, Worksheet } from "exceljs";
import { testURLs } from "../assets/testData";

/**
 * Logs into SharePoint, navigates to a specific document library,
 * downloads a target Excel file, and saves it locally.
 * @param outputDir The local directory path where the file should be saved.
 * @param outputFile The full local file path (including filename) to save the downloaded file as.
 */
export async function downloadExcelFromSharepoint(outputDir: string, outputFile: string) {
  // Launch the Chromium browser.
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    recordVideo: undefined,
  });
  const page = await context.newPage();

  // Navigate to the Microsoft login page (used for SharePoint Online authentication).
  await page.goto(testURLs.microsoft, { timeout: 60000 });

  // Enter Username (Email)
  await page.locator("#i0116").fill(process.env.SENDER_EMAIL_USERNAME!);
  await page.locator("#idSIButton9").click();
  // Wait for the password field to appear before filling
  await page.waitForSelector("#i0118", { timeout: 15000 });
  await page.fill("#i0118", process.env.SENDER_EMAIL_PASSWORD!);
  await page.click("#idSIButton9");

  // Handle the "Stay Signed In?" prompt if it appears.
  try {
    await page.locator("#idBtn_Back").click({ timeout: 5000 });
  } catch (error) {
    console.log('Did not encounter "Stay Signed In" prompt, proceeding.');
  }

  // Navigate to the specific, deep-linked SharePoint folder.
  await page.goto(testURLs.sharepoint, { timeout: 60000 });

  // Ensure the local output directory exists, creating it recursively if necessary.
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Initiates the file download by right-clicking the file link,
  // selecting 'Download' from the context menu, and waiting for the file transfer to complete.
  const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
  const fileName = "3rdPartyGamesTableList.xlsx";
  const fileLink = page.locator("span[data-id='heroField']").getByText(fileName);
  await fileLink.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Download" }).click();
  const download = await downloadPromise;

  // Save the downloaded file to the specified local path.
  await download.saveAs(outputFile);
  console.log(`Excel file saved successfully to: ${outputFile}`);

  // Clean up: Close the page and the browser context.
  await page.close();
}

/**
 * Creates and returns a new ExcelJS Workbook instance.
 * @returns {Promise<ExcelJS.Workbook>} A promise that resolves with the new workbook object.
 */
export async function createNewWorkbook(): Promise<ExcelJS.Workbook> {
  return new ExcelJS.Workbook();
}

/**
 * Adds a new worksheet to the workbook for a specific provider, populating it with
 * table comparison data (Expected, Added, Removed) and applying styles.
 *
 * @param {Workbook} workbook The ExcelJS Workbook object to which the sheet will be added.
 * @param {string} providerName The name of the provider (used for the sheet title).
 * @param {Record<string, string[]>} expectedData Data structure: {category: [tables...]} from the base list.
 * @param {Record<string, string[]>} actualData Data structure: {category: [tables...]} from the game lobby.
 * @param {Record<string, string[]>} addedTableData Data structure: {category: [tables...]} tables found in lobby but not in base.
 * @param {Record<string, string[]>} removedTableData Data structure: {category: [tables...]} tables found in base but not in lobby.
 * @returns {Promise<void>}
 */
export async function addProviderSheet(
  workbook: Workbook,
  providerName: string,
  expectedData: Record<string, string[]>,
  actualData: Record<string, string[]>,
  addedTableData: Record<string, string[]>,
  removedTableData: Record<string, string[]>
): Promise<void> {
  // Sanitize providerName for use as a sheet title.
  // Excel sheet names have a max length of 31 and cannot contain characters like \ / ? * [ ] :
  const sheetName = providerName.substring(0, 31).replace(/[\[\]\*\/\:\\\?]/g, "_");

  // Create a new worksheet for the current provider
  const providerWorksheet: ExcelJS.Worksheet = workbook.addWorksheet(sheetName);

  // Get all unique categories (keys) from both expected and actual data to ensure all groups are included.
  const allCategories = new Set([...Object.keys(actualData), ...Object.keys(expectedData)]);

  // Array to store the row numbers of the blank separator rows for later styling (to make them thin).
  const separatorRowNumbers: number[] = [];

  // Add the fixed header row to the worksheet
  providerWorksheet.addRow(["Category", "Expected Tables", "Added Tables", "Removed Tables"]);

  // Iterate over every unique category found
  for (const category of allCategories) {
    // Get the list of tables for the current category, defaulting to an empty array if the category is missing.
    const expectedTables = expectedData[category] ?? [];
    const addedTables = addedTableData[category] ?? [];
    const removedTables = removedTableData[category] ?? [];

    // Determine the maximum length among all three table arrays to ensure all data is displayed.
    const maxLength = Math.max(expectedTables.length, addedTables.length, removedTables.length);

    // Add the data rows for the category. Data is displayed in vertical lists.
    for (let i = 0; i < maxLength; i++) {
      providerWorksheet.addRow([
        // Column A: Category Name. Only display on the first row of the category block.
        i === 0 ? category : "",
        expectedTables[i] ?? "", // Column B: Expected Tables (or empty string)
        addedTables[i] ?? "", // Column C: Added Tables (or empty string)
        removedTables[i] ?? "", // Column D: Removed Tables (or empty string)
      ]);
    }

    // Add a blank row for visual separation between different categories.
    const separatorRow = providerWorksheet.addRow([]);
    // Store the row number of the separator row for height reduction later.
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
    // Fill background with black
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF000000" } };
    // Set font color to white
    cell.font.color = { argb: "FFFFFFFF" };
    // Center text horizontally
    cell.alignment = { horizontal: "center" };
  });

  // Determine the final row count for border application.
  const totalRowCount = providerWorksheet.lastRow?.number ?? 1;

  // Make the category separator rows very thin for visual effect.
  for (const rowNum of separatorRowNumbers) {
    const row = providerWorksheet.getRow(rowNum);
    row.height = 3;
  }

  // --- Styling: All Cells - Solid Borders ---
  const solidBorder = { style: "thin" as const, color: { argb: "FF000000" } };

  // Iterate over all rows from header (1) to the last data/separator row.
  for (let i = 1; i <= totalRowCount; i++) {
    const row = providerWorksheet.getRow(i);
    // Iterate over all cells (including empty ones to ensure a complete grid).
    row.eachCell({ includeEmpty: true }, (cell) => {
      // Apply borders only to non-separator rows.
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
}

/**
 * Saves the ExcelJS workbook to a specified file path, creating the directory if necessary.
 * @param {ExcelJS.Workbook} workbook The workbook object to save.
 * @param {string} outputDir The directory where the file should be saved.
 * @param {string} fileName The name of the output file (e.g., 'report.xlsx').
 * @returns {Promise<void>}
 */
export async function saveWorkbook(workbook: ExcelJS.Workbook, outputDir: string, fileName: string): Promise<void> {
  // Create the output directory if it doesn't exist. The recursive option ensures
  // parent directories are also created if they don't exist.
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Construct the full file path
  const filePath = path.join(outputDir, fileName);

  // Write the workbook to a file asynchronously
  try {
    await workbook.xlsx.writeFile(filePath);
    console.log(`Consolidated report ${fileName} created successfully at ${filePath}!`);
  } catch (err) {
    console.error("Error writing Excel file:", err);
    // Re-throw the error for the caller to handle, ensuring error propagation.
    throw err;
  }
}
