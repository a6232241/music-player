import TagMultiSelect from "@/components/TagMultiSelect";
import Apis from "@/utils/Apis";
import { PostMusicRequire } from "@/utils/Apis/Sqlite/Music/type";
import { getMetadataFromUri } from "@/utils/helper";
import { Buffer } from "buffer";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { ActivityIndicator, Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UploadScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const handleUploadFile = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/mpeg",
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled || result.assets.length === 0) return;

      await Promise.allSettled(
        result.assets.map(async (asset: DocumentPicker.DocumentPickerAsset) => {
          const { uri, name } = asset;
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
            fileName: name,
          };
          const musicId = await Apis.sqlite?.music.postMusic(audioInfo);
          if (!musicId) throw new Error("Failed to post music");

          const file = await FileSystem.getInfoAsync(destinationUri);
          if (file.exists) await Apis.file.postFile("assets", file);

          if (selectedTagIds.size > 0) {
            Apis.sqlite?.musicTag.postMusicTags({
              musicId,
              tagIds: Array.from(selectedTagIds),
            });
          }
        }),
      );
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTagId = (id: number) => {
    setSelectedTagIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <>
      <SafeAreaView edges={["left", "right", "bottom"]} style={{ flex: 1, alignItems: "center" }}>
        <TagMultiSelect selected={selectedTagIds} onPress={handleSelectTagId} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {isLoading ? <ActivityIndicator size="large" /> : <Button title="Upload" onPress={handleUploadFile} />}
        </View>
      </SafeAreaView>
    </>
  );
};

export default UploadScreen;
