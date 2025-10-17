/**
 * Compares the actual list of tables against the expected list to identify any NEW tables (Added).
 * A table is considered "added" if it exists in the actual data but is missing from the expected data.
 *
 * @param expectedData A record where keys are categories and values are arrays of expected table names.
 * @param actualData A record where keys are categories and values are arrays of actual/found table names.
 * @returns A record containing only the categories and table names that were found in 'actualData' but NOT in 'expectedData' (i.e., added tables).
 */
export async function verifyAddedTablesInTheRecordList(
  expectedData: Record<string, string[]>,
  actualData: Record<string, string[]>
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  for (const category in actualData) {
    if (actualData.hasOwnProperty(category)) {
      const actualTables: string[] = actualData[category] ?? [];
      const expectedTables: string[] = expectedData[category] ?? [];
      const addedTables: string[] = actualTables.filter((table) => !expectedTables.includes(table));
      if (addedTables.length > 0) result[category] = addedTables;
    }
  }
  return result;
}

/**
 * Compares the expected list of tables against the actual list to identify any MISSING tables (Removed).
 * A table is considered "removed" if it exists in the expected data but is missing from the actual data.
 *
 * @param expectedData A record where keys are categories and values are arrays of expected table names.
 * @param actualData A record where keys are categories and values are arrays of actual/found table names.
 * @returns A record containing only the categories and table names that were found in 'expectedData' but NOT in 'actualData' (i.e., removed tables).
 */
export async function verifyRemovedTablesInTheRecordList(
  expectedData: Record<string, string[]>,
  actualData: Record<string, string[]>
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  for (const category in expectedData) {
    if (expectedData.hasOwnProperty(category)) {
      const expectedTables: string[] = expectedData[category] ?? [];
      const actualTables: string[] = actualData[category] ?? [];
      const removedTables: string[] = expectedTables.filter((table) => !actualTables.includes(table));
      if (removedTables.length > 0) result[category] = removedTables;
    }
  }
  return result;
}
