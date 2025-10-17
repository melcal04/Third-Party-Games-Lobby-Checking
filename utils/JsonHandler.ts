import ExcelJS, { CellValue, Row } from "exceljs";
import * as fs from "fs";
import * as path from "path";

/**
 * Reads an Excel file and converts each worksheet into a separate JSON file.
 * The JSON structure groups all cell values by their header column,
 * preserving the original data types where possible.
 *
 * @param excelFilePath The path to the input Excel file (e.g., './assets/data.xlsx').
 * @param outputDirectory The path to the directory where JSON files will be saved (e.g., './assets/json').
 * @returns {Promise<void>} A Promise that resolves when all sheets have been processed.
 */
export async function generateJsonFromExcel(filePath: string, outputDir: string) {
  // Check if the input file exists.
  if (!fs.existsSync(filePath)) throw new Error("Input Excel file does not exist.");
  // Create the output directory if it doesn't exist.
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(filePath);
  } catch (error) {
    throw new Error("Failed to read the Excel file. Check file validity.");
  }

  for (const sheet of workbook.worksheets) {
    // Ensure worksheets to proceed.
    if (sheet.rowCount === 0) continue;

    // Clean the sheet name to ensure a valid filename (removes illegal characters).
    const sheetName = sheet.name.replace(/[\\/:*?"<>|]/g, "_");

    // Object to hold the final results, where keys are headers and values are arrays of cell data.
    const results: Record<string, CellValue[]> = {};
    const headers: string[] = [];
    const headerRow: Row = sheet.getRow(1);

    // Iterate through the first row to determine headers and initialize the results object.
    headerRow.eachCell((cell) => {
      const cellValue = String(cell.value ?? "").trim();
      if (cellValue) {
        headers.push(cellValue);
        results[cellValue] = [];
      }
    });

    // Ensure headers to proceed.
    if (headers.length === 0) continue;

    // Loop through each row starting from the second row (the data).
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip the header row.
      headers.forEach((header, colIndex) => {
        const cellValue = row.getCell(colIndex + 1).value; // getCell is 1-based, so use colIndex + 1.
        if (cellValue && cellValue.toString().trim() !== "") {
          results[header].push(cellValue);
        }
      });
    });

    // Write the results object as a JSON file, using 2 spaces for pretty-printing.
    const filePath = path.join(outputDir, `${sheetName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`Expected Json file saved successfully to: ${filePath}`);
  }
}

/**
 * Serializes and saves provider-specific data to a JSON file.
 * The function first checks if the data object is non-empty before writing the file.
 *
 * @param providerName - The name of the provider (used as the filename prefix, e.g., 'NetEnt' results in 'NetEnt.json').
 * @param providerData - The data object to be written to the JSON file. It should be a key-value map.
 * @param outputDir    - The local directory path where the resulting JSON file should be saved.
 * @returns A Promise that resolves when the file has been successfully written or skipped.
 */
export async function generateJsonFromProvider(providerName: string, providerData: Record<string, any>, outputDir: string): Promise<void> {
  if (Object.keys(providerData).length > 0) {
    // Create the output directory if it doesn't exist.
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const filePath = path.join(outputDir, `${providerName}.json`);
    // Uses fs.writeFileSync for synchronous file writing with 2-space indentation.
    fs.writeFileSync(filePath, JSON.stringify(providerData, null, 2));
    console.log(`Actual Json file saved successfully to: ${filePath}`);
  } else {
    console.log(`Actual data for ${providerName} is empty. File write skipped.`);
  }
}

/**
 * Generates and saves a JSON report file summarizing the differences (Added and Removed tables)
 * found during data verification for a specific provider.
 *
 * @param providerName The name of the game provider (used as the report file name).
 * @param addedTables A Record containing tables found in the actual data but not in the expected data.
 * @param removedTables A Record containing tables found in the expected data but not in the actual data.
 * @param outputDir The directory path where the final JSON report should be saved.
 * @returns A Promise that resolves when the file operation is complete (or skipped).
 */
export async function generateJsonReport(
  providerName: string,
  addedTables: Record<string, string[]>,
  removedTables: Record<string, string[]>,
  outputDir: string
): Promise<void> {
  const providerData: {
    Added: Record<string, string[]>;
    Removed: Record<string, string[]>;
  } = {
    Added: addedTables,
    Removed: removedTables,
  };
  if (Object.keys(providerData).length > 0) {
    // Create the output directory if it doesn't exist.
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const filePath = path.join(outputDir, `${providerName}.json`);
    // Uses fs.writeFileSync for synchronous file writing with 2-space indentation.
    fs.writeFileSync(filePath, JSON.stringify(providerData, null, 2));
    console.log(`Report Json file saved successfully to: ${filePath}`);
  } else {
    console.log(`Report data for ${providerName} is empty. File write skipped.`);
  }
}

/**
 * Reads a JSON file containing categorized lists.
 *
 * @param fileDir The directory containing the JSON file.
 * @param providerName The name of the provider (used for the filename: `[providerName].json`).
 * @returns A Promise resolving to a Record where keys are categories and values are string arrays (table names).
 * @throws An error if the JSON file is not found.
 */
export async function readJsonProviderData(fileDir: string, providerName: string): Promise<Record<string, string[]>> {
  // Construct the full file path (e.g., '/path/to/data/WM.json')
  const jsonFilePath: string = path.join(fileDir, `${providerName}.json`);
  // Check if the file exists
  if (!fs.existsSync(jsonFilePath)) throw new Error(`JSON file not found: ${jsonFilePath}`);
  // Read the raw file content
  const contentRaw: string = fs.readFileSync(jsonFilePath, "utf-8");
  // Parse and return the content
  return JSON.parse(contentRaw);
}
