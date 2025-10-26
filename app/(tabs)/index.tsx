import AudioItem from "@/components/AudioItem";
import SortSelect, { SortType } from "@/components/SortSelect";
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
  const [audios, setAudios] = useState<GetMusicResponse[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<SortType>(SortType.DEFAULT);
  const [audioId, setAudioId] = useState<number>();

  const handlePress = () => {
    if (player.paused) player.play();
    else player.pause();
  };

  const handleAudioItemPress = useCallback(
    (_index: number) => {
      if (!audios[_index]?.localFilePath) return;

      player.replace(audios[_index]?.localFilePath);
      player.seekTo(0);
      setAudioId(audios[_index].id);
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

  const handleSortSelectPress = (index?: number | undefined) => {
    switch (index) {
      case SortType.DATE_ASC:
        setAudios((prev) =>
          [...prev].sort((a, b) => {
            if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
            return 1;
          }),
        );
        setSort(SortType.DATE_ASC);
        break;
      case SortType.DATE_DESC:
        setAudios((prev) =>
          [...prev].sort((a, b) => {
            if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
            return 1;
          }),
        );
        setSort(SortType.DATE_DESC);
        break;
      default:
        setAudios((prev) => [...prev].sort((a, b) => a.id - b.id));
        setSort(SortType.DEFAULT);
        break;
    }
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
          if (list[0]?.localFilePath) player.replace(list[0].localFilePath);
          setAudios(list);
          setAudioId(list[0]?.id);
        })();
      } catch (error) {
        console.error("Error getting musics:", error);
      }
    }, [player, selectedTagIds]),
  );

  useEffect(() => {
    const currentIndex = audioId ? audios.findIndex((audio) => audio.id === audioId) : audios[0]?.id;
    if (!status.didJustFinish || currentIndex >= audios.length - 1) return;
    player.seekTo(0);
    handleAudioItemPress(currentIndex + 1);
  }, [status.didJustFinish, handleAudioItemPress, player, audios, audioId]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <TagFilter selected={selectedTagIds} onPress={handleSelectTagId} />
        <SortSelect selected={sort} onPress={handleSortSelectPress} />
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
