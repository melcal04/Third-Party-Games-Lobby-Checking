import * as fs from "fs";
import * as path from "path";
import { mainDirectory } from "../assets/testData";

export default async function globalTeardown() {
  console.log("Starting global teardown...");
  // await deleteGeneratedFolder(mainDirectory.authFolder);
  // await deleteGeneratedFolder(mainDirectory.excelFolder);
  // await deleteGeneratedFolder(mainDirectory.jsonFolder);
  console.log("Global teardown complete.");
}

/**
 * Deletes the folder containing all saved login states.
 */
async function deleteGeneratedFolder(fileDir: string) {
  const FOLDER_TO_DELETE = path.resolve(process.cwd(), fileDir);
  try {
    if (fs.existsSync(FOLDER_TO_DELETE)) fs.rmSync(FOLDER_TO_DELETE, { recursive: true, force: true });
  } catch (error) {
    console.error(`Error during global teardown: ${error}`);
  }
}
