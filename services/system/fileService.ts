import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import { IAudioMetadata, parseBuffer } from "music-metadata";

export const getMetadataFromUri = async (uri?: string | null): Promise<void | IAudioMetadata> => {
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

export const getDocumentFile = async (path: string): Promise<FileSystem.FileInfo | null> => {
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
