import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";

/**
 * Checks if the SQLite database file exists and has the correct 16-byte magic header.
 */
export const verifySqliteFileHeader = async (path: string): Promise<{ isValid: boolean; error?: string }> => {
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

    return { isValid: true };
  } catch (error) {
    console.error("verifySqliteFileHeader error:", error);
    return { isValid: false, error: error instanceof Error ? error.message : String(error) };
  }
};
