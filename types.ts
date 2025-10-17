export interface TestURLs {
  base: string;
  sports: string;
  casino: string;
  microsoft: string;
  sharepoint: string;
}

export interface TestAccount {
  username: string;
  password: string;
}

export interface MainDirectory {
  excelFolder: string;
  jsonFolder: string;
  authFolder: string;
}

export interface TestDirectory {
  stateJsonFullPath: string;
  baseExcelFileName: string;
  baseExcelFolder: string;
  tempExcelFileName: string;
  tempExcelFolder: string;
  reportExcelFileName: string;
  reportExcelFolder: string;
  expectedJsonFolder: string;
  actualJsonFolder: string;
  reportJsonFolder: string;
}
