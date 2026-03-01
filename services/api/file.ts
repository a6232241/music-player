import * as FileSystem from "expo-file-system";
import { GetMusicResponse } from "../database/repositories/Music/type";

export type DownloadProgress = {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
  progress: number;
};

export type DownloadResult = {
  success: boolean;
  fileName: string;
  error?: string;
};

class File {
  origin: string;
  pathname: string;
  constructor(origin: string) {
    this.origin = origin;
    this.pathname = "file";
  }
  async getFile(remotePath: string, localPath: string): Promise<FileSystem.FileSystemDownloadResult | undefined> {
    try {
      const dir = localPath.split("/").slice(0, -1).join("/");
      const dirInfo = await FileSystem.getInfoAsync(dir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      const response = await FileSystem.downloadAsync(`${this.origin}/${this.pathname}/${remotePath}`, localPath);
      if (response?.status !== 200) throw new Error("Failed to download file");

      return response;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  async postFile(remoteDirname: string, file: FileSystem.FileInfo): Promise<any> {
    try {
      const response = await FileSystem.uploadAsync(`${this.origin}/${this.pathname}/${remoteDirname}`, file.uri, {
        fieldName: "file",
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      });

      const responseData = response?.body ? JSON.parse(response?.body) : null;
      if (responseData?.isError) throw new Error(responseData?.message);

      return responseData;
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

  async downloadAudio(fileName: string, onProgress?: (progress: DownloadProgress) => void): Promise<DownloadResult> {
    try {
      if (!fileName) {
        throw new Error("File name is required");
      }

      const remotePath = `assets/${fileName}`;
      const localPath = `${FileSystem.documentDirectory}audio/${fileName}`;
      const localTempPath = `${FileSystem.documentDirectory}temp/${fileName}`;

      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        return { success: true, fileName };
      }

      // Create download resumable for background support
      const downloadResumable = FileSystem.createDownloadResumable(
        `${this.origin}/${this.pathname}/${remotePath}`,
        localTempPath,
        {},
        (downloadProgress) => {
          if (onProgress) {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            onProgress({
              totalBytesWritten: downloadProgress.totalBytesWritten,
              totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite,
              progress: isNaN(progress) ? 0 : progress,
            });
          }
        },
      );

      const result = await downloadResumable.downloadAsync();

      if (!result || result.status !== 200) {
        throw new Error(`Failed to download file: ${fileName}`);
      }

      await FileSystem.moveAsync({
        from: localTempPath,
        to: localPath,
      });

      return { success: true, fileName };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error downloading ${fileName}:`, error);
      return { success: false, fileName, error: errorMessage };
    }
  }

  async downloadAllAudios(
    audios: GetMusicResponse[],
    onProgress?: (fileName: string, progress: DownloadProgress) => void,
    onComplete?: (result: DownloadResult) => void,
  ): Promise<DownloadResult[]> {
    const results: DownloadResult[] = await Promise.all(
      audios.map(async (audio) => {
        const result = await this.downloadAudio(audio.fileName, (progress) => {
          if (onProgress) {
            onProgress(audio.fileName, progress);
          }
        });

        if (onComplete) {
          onComplete(result);
        }
        return result;
      }),
    );

    return results;
  }
}

export default File;
