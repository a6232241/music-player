import * as FileSystem from "expo-file-system";

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
}

export default File;
