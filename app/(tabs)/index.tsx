import AudioItem from "@/components/AudioItem";
import TagFilter from "@/components/TagFilter";
import Apis from "@/utils/Apis";
import { GetMusicResponse } from "@/utils/Apis/Sqlite/Music/type";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useFocusEffect } from "expo-router";
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

  const handleSelectTagId = (id: number) => {
    setSelectedTagIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  useFocusEffect(
    useCallback(() => {
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
    }, [player, index, selectedTagIds]),
  );

  useEffect(() => {
    player.seekTo(0);
    if (!status.didJustFinish || index >= audios.length - 1) return;
    handleAudioItemPress(index + 1);
  }, [status.didJustFinish, index, handleAudioItemPress, player, audios.length]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
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
      </SafeAreaView>
    </>
  );
}
