import { MainDirectory, TestAccount, TestDirectory, TestURLs } from "../types";

export const testURLs: TestURLs = {
  base: "https://www.senangpositifbahagia.com/",
  sports: "https://sportsbook.senangpositifbahagia.com/",
  casino: "https://3xqwbark72.royalcasino.senangpositifbahagia.com/?_gl=...",
  microsoft: "https://login.microsoftonline.com/",
  sharepoint:
    "https://leekie.sharepoint.com/sites/SC/Shared%20Documents/Forms/AllItems.aspx?" +
    "id=%2Fsites%2FSC%2FShared%20Documents%2FSQT%20x%20Domain%2F%21SQT%2FSQT%20Automation%2F05%20Jenkins%2F" +
    "Test%20Data&viewid=ba0b2639%2D2e12%2D4e60%2D8d9b%2D844bfe1ce014",
};

export const testAccount: TestAccount = {
  username: "sctestidr001",
  password: "asdf12345",
};

export const mainDirectory: MainDirectory = {
  authFolder: "./assets/auth",
  excelFolder: "./assets/excel",
  jsonFolder: "./assets/json",
};

export const testDirectory: TestDirectory = {
  stateJsonFilePath: `${mainDirectory.authFolder}/state.json`,
  expectedExcelFilePath: `${mainDirectory.excelFolder}/expected/tableList.xlsx`,
  reportExcelFolder: `${mainDirectory.excelFolder}/report/`,
  expectedJsonFolder: `${mainDirectory.jsonFolder}/expected/`,
  actualJsonFolder: `${mainDirectory.jsonFolder}/actual/`,
  reportJsonFolder: `${mainDirectory.jsonFolder}/report/`,
};
