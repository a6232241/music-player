import AudioItem from "@/components/AudioItem";
import AudioList from "@/components/AudioList";
import Player from "@/components/Player";
import SortSelect, { SortType } from "@/components/SortSelect";
import TagMultiSelect from "@/components/TagMultiSelect";
import { useTheme } from "@/context/ThemeContext";
import Apis from "@/utils/Apis";
import { getDocumentFile } from "@/utils/helper";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useFocusEffect } from "expo-router";
import React, { ComponentProps, useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { colors } = useTheme();
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [audios, setAudios] = useState<ComponentProps<typeof AudioItem>["data"][]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [selectedSortType, setSelectedSortType] = useState<SortType>(SortType.DEFAULT);
  const [audioId, setAudioId] = useState<number>();
  const track = React.useMemo(() => audios.find((a) => a.id === audioId), [audios, audioId]);

  const handlePress = useCallback(() => {
    if (player.paused) player.play();
    else player.pause();
  }, [player]);

  const handleAudioItemPress = useCallback(
    async (_index: number) => {
      // replace 需要加載，因此設定播放時間重置，避免進入下一首音樂時，播放狀態尚未改變，導致播放時間錯誤
      player.seekTo(0);

      const filePath = (await getDocumentFile(audios[_index].fileName))?.uri;
      if (!filePath) return;

      player.replace(filePath);
      setAudioId(audios[_index].id);
      // replace 需要加載，因此設定延遲，避免播放失效
      setTimeout(() => player.play(), 300);
    },
    [player, audios],
  );

  const handleSelectTagId = useCallback((id: number) => {
    setSelectedTagIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSelectSortType = useCallback((index?: number | undefined) => {
    switch (index) {
      case SortType.DATE_ASC:
        setSelectedSortType(SortType.DATE_ASC);
        break;
      case SortType.DATE_DESC:
        setSelectedSortType(SortType.DATE_DESC);
        break;
      default:
        setSelectedSortType(SortType.DEFAULT);
        break;
    }
  }, []);

  const getAudios = useCallback(async () => {
    const tagIds = Array.from(selectedTagIds);
    const list =
      !tagIds || tagIds.length === 0
        ? await Apis.sqlite?.music.getMusics({ sortType: selectedSortType })
        : await Apis.sqlite?.music.getMusicsByTagIds({ ids: tagIds, sortType: selectedSortType });
    return list;
  }, [selectedTagIds, selectedSortType]);

  const addIsExistByAudios = useCallback(async (audios: ComponentProps<typeof AudioItem>["data"][]) => {
    return Promise.all(
      audios.map(async (audio) => {
        const filePath = (await getDocumentFile(audio.fileName))?.uri;
        audio.isExist = !!filePath;
        return audio;
      }),
    );
  }, []);

  const setAudio = useCallback(
    (audio: ComponentProps<typeof AudioItem>["data"]) => {
      const index = audios.findIndex((item) => item.id === audio.id);
      if (index >= 0) {
        const newAudios = [...audios];
        newAudios[index] = audio;
        setAudios(newAudios);
      }
    },
    [audios],
  );

  const onNext = useCallback(() => {
    const currentIndex = audios.findIndex((a) => a.id === audioId);
    if (currentIndex < audios.length - 1) {
      handleAudioItemPress(currentIndex + 1);
    }
  }, [audios, audioId, handleAudioItemPress]);

  const onPrev = useCallback(() => {
    const currentIndex = audios.findIndex((a) => a.id === audioId);
    if (currentIndex > 0) {
      handleAudioItemPress(currentIndex - 1);
    }
  }, [audios, audioId, handleAudioItemPress]);

  useFocusEffect(
    useCallback(() => {
      try {
        (async () => {
          let list = await getAudios();
          if (!list) throw new Error("Failed to get musics");

          list = await addIsExistByAudios(list);

          if (list.length > 0 && !player.playing) {
            const filePath = (await getDocumentFile(list[0].fileName))?.uri;
            if (filePath) {
              player.replace(filePath);
              setAudioId(list[0]?.id);
            }
          }
          setAudios(list);
        })();
      } catch (error) {
        console.error("Error getting musics:", error);
      }
    }, [getAudios, player, addIsExistByAudios]),
  );

  useEffect(() => {
    const currentIndex = audioId ? audios.findIndex((audio) => audio.id === audioId) : audios[0]?.id;
    if (!status.didJustFinish || audios.length === 0 || currentIndex >= audios.length - 1) return;
    handleAudioItemPress(currentIndex + 1);
  }, [status.didJustFinish, handleAudioItemPress, player, audios, audioId]);

  return (
    <>
      <SafeAreaView edges={["left", "right"]} style={{ flex: 1, gap: 20, backgroundColor: colors.background }}>
        <TagMultiSelect selected={selectedTagIds} onPress={handleSelectTagId} />

        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 20, color: colors.text }}>列表</Text>
          <SortSelect selected={selectedSortType} onPress={handleSelectSortType} />
          <AudioList audios={audios} handleAudioItemPress={handleAudioItemPress} setAudio={setAudio} />
          <Player track={track} isPlaying={status.playing} onPlayPause={handlePress} onNext={onNext} onPrev={onPrev} />
        </View>
      </SafeAreaView>
    </>
  );
}
