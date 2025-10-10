import AudioItem from "@/components/AudioItem";
import { audios } from "@/utils/assets/audio";
import { Buffer } from "buffer";
import { useAssets } from "expo-asset";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system";
import { IAudioMetadata, ICommonTagsResult, parseBuffer } from "music-metadata";
import { useCallback, useEffect, useState } from "react";
import { Button, FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [assets] = useAssets(audios);
  const [audioMetaCommons, setAudioMetaCommons] = useState<ICommonTagsResult[]>([]);
  const player = useAudioPlayer(audios[0]);
  const status = useAudioPlayerStatus(player);
  const [index, setIndex] = useState<number>(0);

  const getMetadataFromAsset = async (assetPath?: string | null): Promise<void | IAudioMetadata> => {
    if (!assetPath) return;

    try {
      const base64Data = await FileSystem.readAsStringAsync(assetPath, { encoding: "base64" });
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
      player.replace(audios[_index]);
      player.play();
      setIndex(_index);
    },
    [player],
  );

  useEffect(() => {
    (async () => {
      let metadataCommons: ICommonTagsResult[] = [];
      for (const asset of assets ?? []) {
        let metadata = await getMetadataFromAsset(asset.localUri);
        if (metadata?.common) metadataCommons.push(metadata.common);
      }
      setAudioMetaCommons(metadataCommons);
    })();
  }, [assets]);

  useEffect(() => {
    // 由於執行 handleAudioItemPress 後，index 發生改變，但 didJustFinish 可能依舊為 true 的情況
    // 因此補上 seekTo(0)，確保 didJustFinish = false
    player.seekTo(0);
    if (!status.didJustFinish || index >= audios.length - 1) return;

    handleAudioItemPress(index + 1);
  }, [status.didJustFinish, index, handleAudioItemPress, player]);

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
      </SafeAreaView>
    </>
  );
}
