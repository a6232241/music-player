import Apis from "@/utils/Apis";
import { PostMusicRequire } from "@/utils/Apis/Sqlite/Music/type";
import { getMetadataFromUri } from "@/utils/helper";
import { Buffer } from "buffer";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { ActivityIndicator, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UploadScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const handleUploadFile = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/mpeg",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || result.assets.length === 0) throw new Error("No file selected");

      const { uri, name } = result.assets[0];
      const destinationUri = FileSystem.documentDirectory + name;

      await FileSystem.copyAsync({
        from: uri,
        to: destinationUri,
      });

      const meta = await getMetadataFromUri(uri);
      if (!meta) throw new Error("Failed to get metadata");

      const audioInfo: PostMusicRequire = {
        title: meta?.common?.title,
        artist: meta?.common?.artist,
        album: meta?.common?.album,
        albumArt:
          meta?.common?.picture?.[0]?.data && meta?.common?.picture?.[0]?.format
            ? `data:${meta.common.picture[0].format};base64,${Buffer.from(meta.common.picture[0].data).toString("base64")}`
            : undefined,
        lyrics: meta?.common?.lyrics?.[0]?.text,
        duration: meta?.format?.duration,
        year: meta?.common?.year,
        date: meta?.common?.date,
        copyright: meta?.common?.copyright,
      };
      const musicId = await Apis.sqlite?.music.postMusic(audioInfo);
      if (!musicId) throw new Error("Failed to post music");

      await Apis.sqlite?.localFilePath.postLocalFilePath({
        id: musicId,
        path: destinationUri,
      });
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {isLoading ? <ActivityIndicator size="large" /> : <Button title="Upload Audio" onPress={handleUploadFile} />}
      </SafeAreaView>
    </>
  );
};

export default UploadScreen;
