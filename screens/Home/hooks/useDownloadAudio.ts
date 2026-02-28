import Apis from "@/utils/Apis";
import { ComponentProps, useCallback, useState } from "react";
import { Alert } from "react-native";
import AudioItem from "../components/AudioItem";

interface UseDownloadAudioProps {
  audios: ComponentProps<typeof AudioItem>["data"][];
  setAudio: (audio: ComponentProps<typeof AudioItem>["data"]) => void;
}

export function useDownloadAudio({ audios, setAudio }: UseDownloadAudioProps) {
  const [downloadProgress, setDownloadProgress] = useState<Record<string, { progress: number; loading: boolean }>>({});

  const handleDownloadAll = useCallback(async () => {
    const audiosToDownload = audios.filter((audio) => !audio.isExist);

    if (audiosToDownload.length === 0) {
      return;
    }

    try {
      const initialProgress: Record<string, { progress: number; loading: boolean }> = {};
      audiosToDownload.forEach((audio) => {
        initialProgress[audio.fileName] = { progress: 0, loading: true };
      });
      setDownloadProgress(initialProgress);

      const results = await Apis.file.downloadAllAudios(
        audiosToDownload,
        (fileName, progress) => {
          setDownloadProgress((prev) => ({
            ...prev,
            [fileName]: { progress: progress.progress * 100, loading: true },
          }));
        },
        (result) => {
          if (result.success) {
            const updatedAudio = audios.find((a) => a.fileName === result.fileName);
            if (updatedAudio) {
              setAudio({ ...updatedAudio, isExist: true });
            }
          }

          setDownloadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[result.fileName];
            return newProgress;
          });
        },
      );
      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.length - successCount;

      if (failedCount === 0) {
        Alert.alert("Success", `Downloaded all ${successCount} songs`);
      } else {
        Alert.alert("Partial Success", `Downloaded ${successCount} songs, ${failedCount} failed`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setDownloadProgress({});
      }, 500);
    }
  }, [audios, setAudio]);

  return {
    downloadProgress,
    handleDownloadAll,
  };
}
