import AudioItem from "@/components/AudioItem";
import TagFilter from "@/components/TagFilter";
import Apis from "@/utils/Apis";
import { GetMusicResponse, PostMusicRequire } from "@/utils/Apis/Sqlite/Music/type";
import { getMetadataFromUri } from "@/utils/helper";
import { Buffer } from "buffer";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useState } from "react";
import { Button, FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [index, setIndex] = useState<number>(0);
  const [audios, setAudios] = useState<GetMusicResponse[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());

  const handlePress = () => {
    if (player.paused) player.play();
    else player.pause();
  };

  const handleAudioItemPress = useCallback(
    (_index: number) => {
      if (!audios[_index]?.localFilePath) return;

      player.replace(audios[_index]?.localFilePath);
      player.seekTo(0);
      setIndex(_index);
      // replace 需要加載，因此設定延遲，避免播放失效
      setTimeout(() => player.play(), 300);
    },
    [player, audios],
  );

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

      setAudios((prev) => [
        ...prev,
        {
          ...audioInfo,
          id: new Date().getTime(),
          createdAt: new Date(),
          updateAt: new Date(),
          localFilePath: destinationUri,
        },
      ]);

      const musicId = await Apis.sqlite?.music.postMusic(audioInfo);
      if (!musicId) throw new Error("Failed to post music");

      await Apis.sqlite?.localFilePath.postLocalFilePath({
        id: musicId,
        path: destinationUri,
      });
    } catch (error) {
      console.error("File upload error:", error);
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

  useEffect(() => {
    try {
      (async () => {
        let tagIds: number[] = [];
        selectedTagIds.forEach((id) => tagIds.push(id));
        const list =
          tagIds.length === 0
            ? await Apis.sqlite?.music.getMusics()
            : await Apis.sqlite?.music.getMusicsByTagIds({ ids: tagIds });
        if (!list) throw new Error("Failed to get musics");
        if (list[index]?.localFilePath) player.replace(list[index].localFilePath);
        setAudios(list);
      })();
    } catch (error) {
      console.error("Error getting musics:", error);
    }
  }, [player, index, selectedTagIds]);

  useEffect(() => {
    player.seekTo(0);
    if (!status.didJustFinish || index >= audios.length - 1) return;
    handleAudioItemPress(index + 1);
  }, [status.didJustFinish, index, handleAudioItemPress, player, audios.length]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={["right", "left", "bottom"]}>
        <TagFilter selected={selectedTagIds} onPress={handleSelectTagId} />
        <FlatList
          data={audios}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => <AudioItem data={item} onPress={() => handleAudioItemPress(index)} />}
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
