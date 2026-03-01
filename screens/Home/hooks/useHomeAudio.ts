import Apis from "@/services";
import { getDocumentFile } from "@/services/system/fileService";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useFocusEffect } from "expo-router";
import { ComponentProps, useCallback, useEffect, useMemo, useState } from "react";
import AudioItem from "../components/AudioItem";
import { SortType } from "../components/SortSelect";
import { useDownloadAudio } from "./useDownloadAudio";

export function useHomeAudio() {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [audios, setAudios] = useState<ComponentProps<typeof AudioItem>["data"][]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [selectedSortType, setSelectedSortType] = useState<SortType>(SortType.DEFAULT);
  const [audioId, setAudioId] = useState<number>();
  const track = useMemo(() => audios.find((a) => a.id === audioId), [audios, audioId]);

  const setAudio = useCallback((audio: ComponentProps<typeof AudioItem>["data"]) => {
    setAudios((prev) => {
      const newAudios = [...prev];
      const index = newAudios.findIndex((item) => item.id === audio.id);
      if (index >= 0) {
        newAudios[index] = audio;
      }
      return newAudios;
    });
  }, []);

  const { downloadProgress, handleDownloadAll } = useDownloadAudio({ audios, setAudio });

  const handlePress = useCallback(() => {
    if (player.paused) player.play();
    else player.pause();
  }, [player]);

  const handleAudioItemPress = useCallback(
    async (_index: number) => {
      // replace 需要加載，因此設定播放時間重置，避免進入下一首音樂時，播放狀態尚未改變，導致播放時間錯誤
      player.seekTo(0);

      const filePath = (await getDocumentFile(`audio/${audios[_index].fileName}`))?.uri;
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
        const filePath = (await getDocumentFile(`audio/${audio.fileName}`))?.uri;
        audio.isExist = !!filePath;
        return audio;
      }),
    );
  }, []);

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

  const handleRefreshAudios = useCallback(async () => {
    try {
      let list = await getAudios();
      if (!list) throw new Error("Failed to get musics");

      list = await addIsExistByAudios(list);

      setAudios(list);
    } catch (error) {
      console.error("Error getting musics:", error);
    }
  }, [getAudios, addIsExistByAudios]);

  useFocusEffect(
    useCallback(() => {
      try {
        (async () => {
          let list = await getAudios();
          if (!list) throw new Error("Failed to get musics");

          list = await addIsExistByAudios(list);

          if (list.length > 0 && !player.playing) {
            const filePath = (await getDocumentFile(`audio/${list[0].fileName}`))?.uri;
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
    const currentIndex = audios.findIndex((audio) => audio.id === audioId);
    if (!status.didJustFinish || audios.length === 0 || currentIndex >= audios.length - 1) return;
    handleAudioItemPress(currentIndex + 1);
  }, [status.didJustFinish, handleAudioItemPress, player, audios, audioId]);

  return {
    audios,
    selectedTagIds,
    selectedSortType,
    track,
    status,
    downloadProgress,
    handlePress,
    handleAudioItemPress,
    handleSelectTagId,
    handleSelectSortType,
    onNext,
    onPrev,
    handleDownloadAll,
    setAudio,
    handleRefreshAudios,
  };
}
