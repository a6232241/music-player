import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { IAudioMetadata, parseBuffer } from "music-metadata";

const getMetadataFromUri = async (uri?: string | null): Promise<void | IAudioMetadata> => {
  if (!uri) return;

  try {
    const base64Data = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
    const buffer = Buffer.from(base64Data, "base64");
    const metadata = await parseBuffer(buffer, { mimeType: "audio/mpeg" });
    return metadata;
  } catch (error) {
    console.error("解析失敗:", error);
  }
};

const getDocumentFile = async (path: string): Promise<FileSystem.FileInfo | null> => {
  try {
    const destinationUri = FileSystem.documentDirectory + path;
    const info = await FileSystem.getInfoAsync(destinationUri);
    if (!info.exists || info.size <= 0) return null;
    return info;
  } catch (error) {
    console.error("Error getting document file:", error);
    return null;
  }
};

/**
 * Forces a WAL checkpoint to flush all pending writes into the main database file.
 * Call this before backup to ensure the .db file contains complete data.
 */
const checkpointSqliteDB = async (path: string): Promise<{ success: boolean; error?: string }> => {
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
 * 1. Checks if the file exists and is not empty.
 * 2. Checks the 16-byte SQLite header.
 * 3. Runs PRAGMA integrity_check.
 */
const verifySqliteDB = async (path: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const destinationUri = FileSystem.documentDirectory + path;

    // 1. Basic file check
    const info = await FileSystem.getInfoAsync(destinationUri);
    if (!info.exists || info.size === 0) {
      return { isValid: false, error: "Database file does not exist or is empty" };
    }

    // 2. Magic Header check (SQLite format 3\0)
    const headerBase64 = await FileSystem.readAsStringAsync(destinationUri, {
      encoding: "base64",
      length: 16,
      position: 0,
    });
    const headerBuffer = Buffer.from(headerBase64, "base64");
    const headerString = headerBuffer.toString("ascii");

    if (headerString !== "SQLite format 3\0") {
      return { isValid: false, error: "Invalid SQLite file header" };
    }

    // 3. PRAGMA integrity_check
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

export { checkpointSqliteDB, getDocumentFile, getMetadataFromUri, verifySqliteDB };
