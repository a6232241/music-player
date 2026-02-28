import TagMultiSelect from "@/components/TagMultiSelect";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AudioList from "./components/AudioList";
import Player from "./components/Player";
import SortSelect from "./components/SortSelect";
import { useHomeAudio } from "./hooks/useHomeAudio";

export default function Index() {
  const { colors } = useTheme();

  const {
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
  } = useHomeAudio();

  return (
    <>
      <SafeAreaView edges={["left", "right"]} style={{ flex: 1, gap: 20, backgroundColor: colors.background }}>
        <TagMultiSelect selected={selectedTagIds} onPress={handleSelectTagId} />

        <View style={{ flex: 1, gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 20, color: colors.text }}>列表</Text>
            {audios.some((audio) => !audio.isExist) && (
              <Button title="Download All Audios" onPress={handleDownloadAll} color={colors.tint} />
            )}
            <SortSelect selected={selectedSortType} onPress={handleSelectSortType} />
          </View>
          <AudioList
            audios={audios}
            onAudioItemPress={handleAudioItemPress}
            setAudio={setAudio}
            downloadProgress={downloadProgress}
            onRefresh={handleRefreshAudios}
          />
          <Player track={track} isPlaying={status.playing} onPlayPause={handlePress} onNext={onNext} onPrev={onPrev} />
        </View>
      </SafeAreaView>
    </>
  );
}
