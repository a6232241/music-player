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
