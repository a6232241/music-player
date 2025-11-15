import * as FileSystem from "expo-file-system";

class File {
  origin: string;
  pathname: string;
  constructor(origin: string) {
    this.origin = origin;
    this.pathname = "file";
  }

  async getFile(remotePath: string, localPath: string): Promise<void> {
    const response = await FileSystem.downloadAsync(`${this.origin}/${this.pathname}/${remotePath}`, localPath);
    if (response?.status !== 200) throw new Error("Failed to download file");
  }

  async postFile(remoteDirname: string, file: FileSystem.FileInfo): Promise<void> {
    const response = await FileSystem.uploadAsync(`${this.origin}/${this.pathname}/${remoteDirname}`, file.uri, {
      fieldName: "file",
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    });

    const responseData = response?.body ? JSON.parse(response?.body) : null;
    if (responseData?.isError) throw new Error(responseData?.message);
  }
}

export default File;
