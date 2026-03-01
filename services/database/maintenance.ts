import * as SQLite from "expo-sqlite";
import { verifySqliteFileHeader } from "../system/dbFileService";

/**
 * Forces a WAL checkpoint to flush all pending writes into the main database file.
 * Call this before backup to ensure the .db file contains complete data.
 */
export const checkpointSqliteDB = async (path: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const dbName = path.split("/").pop() || "main.db";
    const db = await SQLite.openDatabaseAsync(dbName);

    // TRUNCATE mode flushes WAL and removes -wal/-shm files
    await db.execAsync("PRAGMA wal_checkpoint(TRUNCATE);");

    return { success: true };
  } catch (error) {
    console.error("checkpointSqliteDB error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Verifies the integrity of a SQLite database file.
 * 1. Checks if the file exists and is not empty via file system check.
 * 2. Runs PRAGMA integrity_check.
 */
export const verifySqliteDB = async (path: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    // 1. Core Header & File verification (delegated to pure file util)
    const fileCheck = await verifySqliteFileHeader(path);
    if (!fileCheck.isValid) {
      return fileCheck;
    }

    // 2. PRAGMA integrity_check (SQLite layer)
    const dbName = path.split("/").pop() || "main.db";
    const db = await SQLite.openDatabaseAsync(dbName);
    const result = (await db.getFirstAsync("PRAGMA integrity_check;")) as { integrity_check: string };

    if (result?.integrity_check !== "ok") {
      return { isValid: false, error: `Integrity check failed: ${result?.integrity_check}` };
    }

    return { isValid: true };
  } catch (error) {
    console.error("verifySqliteDB error:", error);
    return { isValid: false, error: error instanceof Error ? error.message : String(error) };
  }
};
