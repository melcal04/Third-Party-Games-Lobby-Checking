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

export async function generateExcelReport(
  providerName: string,
  expectedData: Record<string, string[]>,
  actualData: Record<string, string[]>,
  addedTableData: Record<string, string[]>,
  removedTableData: Record<string, string[]>,
  outputDir: string
): Promise<void> {
  // Get all unique categories (keys) from both the expected and actual lists
  // to ensure all relevant categories are included in the report.
  const allCategories = new Set([...Object.keys(actualData), ...Object.keys(expectedData)]);

  // Create a new Excel workbook instance
  const workbook: Workbook = new ExcelJS.Workbook();

  // Iterate over every unique category found
  for (const category of allCategories) {
    // Create a new worksheet for the current category
    const categoryWorksheet: Worksheet = workbook.addWorksheet(category);

    // Add the header row to the worksheet
    categoryWorksheet.addRow(["Expected Tables", "Added Tables", "Removed Tables"]);

    // Get the list of tables for the current category, defaulting to an empty array if the category is missing in one source
    const expectedTables = expectedData[category] ?? [];
    const addedTables = addedTableData[category] ?? [];
    const removedTables = removedTableData[category] ?? [];

    // Get max length among all three lists to loop through and populate rows simultaneously
    const maxLength = Math.max(expectedTables.length, addedTables.length, removedTables.length);

    for (let i = 0; i < maxLength; i++) {
      // Add a new row. The ?? '' ensures that if a list is shorter than maxLength,
      // the cell is filled with an empty string instead of undefined.
      categoryWorksheet.addRow([
        expectedTables[i] ?? "", // Column A: Base List Tables
        addedTables[i] ?? "", // Column B: Added Tables
        removedTables[i] ?? "", // Column C: Removed Tables
      ]);
    }

    // Styling: Set fixed column widths for readability
    categoryWorksheet.columns = [
      { header: "Expected Tables", width: 30 },
      { header: "Added Tables", width: 30 },
      { header: "Removed Tables", width: 30 },
    ];

    // Styling: Apply header styles (bold, size, color, alignment)
    const headerRow = categoryWorksheet.getRow(1);
    headerRow.font = { bold: true, size: 14 };
    // Iterate over each cell in the header row to apply fill/text color and alignment
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF000000" }, // Black background (ARGB color code)
      };
      cell.font.color = { argb: "FFFFFFFF" }; // White text color
      cell.alignment = { horizontal: "center" };
    });
  }

  // Create the output directory if it doesn't exist.
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${providerName}.xlsx`);

  // Write the workbook to a file in the report directory. This is an asynchronous operation.
  workbook.xlsx
    .writeFile(filePath)
    .then(() => {
      console.log(`${providerName}.xlsx created successfully!`);
    })
    .catch((err) => {
      console.error("Error writing Excel file:", err);
    });
}
