import AudioItem from "@/components/AudioItem";
import Apis from "@/utils/Apis";
import { Buffer } from "buffer";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { IAudioMetadata, ICommonTagsResult, parseBuffer } from "music-metadata";
import { useCallback, useState } from "react";
import { Button, FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [audioMetaCommons, setAudioMetaCommons] = useState<ICommonTagsResult[]>([]);
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [index, setIndex] = useState<number>(0);

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

  const handlePress = () => {
    if (player.paused) player.play();
    else player.pause();
  };

  const handleAudioItemPress = useCallback(
    (_index: number) => {
      player.seekTo(0);
      // player.replace(audios[_index]);
      player.play();
      setIndex(_index);
    },
    [player],
  );

  // useEffect(() => {
  //   (async () => {
  //     let metadataCommons: ICommonTagsResult[] = [];
  //     for (const asset of assets ?? []) {
  //       let metadata = await getMetadataFromUri(asset.localUri);
  //       if (metadata?.common) metadataCommons.push(metadata.common);
  //     }
  //     setAudioMetaCommons(metadataCommons);
  //   })();
  // }, [assets]);

  // useEffect(() => {
  //   // 由於執行 handleAudioItemPress 後，index 發生改變，但 didJustFinish 可能依舊為 true 的情況
  //   // 因此補上 seekTo(0)，確保 didJustFinish = false
  //   player.seekTo(0);
  //   if (!status.didJustFinish || index >= audios.length - 1) return;

  //   handleAudioItemPress(index + 1);
  // }, [status.didJustFinish, index, handleAudioItemPress, player]);

  const handleUploadFile = async () => {
    try {
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

      const musicId = await Apis.sqlite?.music.postMusic({
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
      });

      if (!musicId) throw new Error("Failed to post music");

      await Apis.sqlite?.localFilePath.postLocalFilePath({
        id: musicId,
        path: destinationUri,
      });
    } catch (error) {
      console.error("File upload error:", error);
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={["right", "left", "bottom"]}>
        <FlatList
          data={audioMetaCommons}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => <AudioItem metaCommon={item} onPress={() => handleAudioItemPress(index)} />}
          contentContainerStyle={{ gap: 5 }}
        />
        <Text>Playing: {status.playing ? "Yes" : "No"}</Text>
        <Text>Current Time: {status.currentTime}s</Text>
        <Text>Duration: {status.duration}s</Text>
        <Text>didJustFinish: {status.didJustFinish ? "true" : "false"}</Text>
        <Button title="Play / Pause" onPress={handlePress} />
        <Button title="Upload Audio" onPress={handleUploadFile} />
      </SafeAreaView>
    </>
  );
}
