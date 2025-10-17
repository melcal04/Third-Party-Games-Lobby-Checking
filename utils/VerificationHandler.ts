// Finds tables in the ACTUAL list that are NEW (ADDED) compared to the EXPECTED list.
export async function verifyAddedTablesInTheRecordList(
  expectedData: Record<string, string[]>,
  actualData: Record<string, string[]>
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  // Iterate over the ACTUAL data keys to catch categories only present in the lobby
  for (const category in actualData) {
    if (actualData.hasOwnProperty(category)) {
      const actualTables: string[] = actualData[category] ?? [];
      const expectedTables: string[] = expectedData[category] ?? [];
      // Find tables in 'actualTables' that are NOT present in 'expectedTables' (these are "Added")
      const addedTables: string[] = actualTables.filter((table) => !expectedTables.includes(table));
      if (addedTables.length > 0) result[category] = addedTables;
    }
  }
  return result;
}

// Finds tables in the EXPECTED list that are MISSING (REMOVED) from the ACTUAL list.
export async function verifyRemovedTablesInTheRecordList(
  expectedData: Record<string, string[]>,
  actualData: Record<string, string[]>
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  // Iterate over the EXPECTED data keys
  for (const category in expectedData) {
    if (expectedData.hasOwnProperty(category)) {
      const expectedTables: string[] = expectedData[category] ?? [];
      const actualTables: string[] = actualData[category] ?? [];
      // Find tables in 'expectedTables' that are NOT present in 'actualTables' (these are "Removed")
      const removedTables: string[] = expectedTables.filter((table) => !actualTables.includes(table));
      if (removedTables.length > 0) result[category] = removedTables;
    }
  }
  return result;
}
