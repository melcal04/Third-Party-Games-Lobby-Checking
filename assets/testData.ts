import { MainDirectory, TestAccount, TestDirectory, TestURLs } from "../types";
import * as dotenv from "dotenv";
dotenv.config();

export const testURLs: TestURLs = {
  base: `https://www.${process.env.UNBLOCKED_SBOTOP_URL}/`,
  sports: `https://sportsbook.${process.env.UNBLOCKED_SBOTOP_URL}/`,
  casino: `https://3xqwbark72.royalcasino.${process.env.UNBLOCKED_SBOTOP_URL}/?_gl=...`,
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
  stateJsonFullPath: `${mainDirectory.authFolder}/state.json`,
  baseExcelFileName: "tableList.xlsx",
  baseExcelFolder: `${mainDirectory.excelFolder}/base/`,
  tempExcelFileName: "tempReport.xlsx",
  tempExcelFolder: `${mainDirectory.excelFolder}/temp/`,
  reportExcelFileName: "Third Party Games Lobby Checking Report.xlsx",
  reportExcelFolder: `${mainDirectory.excelFolder}/report/`,
  expectedJsonFolder: `${mainDirectory.jsonFolder}/expected/`,
  actualJsonFolder: `${mainDirectory.jsonFolder}/actual/`,
  reportJsonFolder: `${mainDirectory.jsonFolder}/report/`,
};
