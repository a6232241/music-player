import { useTheme } from "@/context/ThemeContext";
import React, { ComponentProps, useCallback } from "react";
import { FlatList, Text, View } from "react-native";
import AudioItem from "./AudioItem";

type Props = {
  audios: ComponentProps<typeof AudioItem>["data"][];
  onAudioItemPress: (index: number) => void;
  setAudio: (audio: ComponentProps<typeof AudioItem>["data"]) => void;
  downloadProgress?: Record<string, { progress: number; loading: boolean }>;
  onRefresh: () => Promise<void>;
};

const AudioList = ({ audios, onAudioItemPress, setAudio, downloadProgress, onRefresh }: Props) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { colors } = useTheme();

  const renderItem = useCallback(
    ({ item, index }: { item: ComponentProps<typeof AudioItem>["data"]; index: number }) => {
      const itemProgress = downloadProgress?.[item.fileName];
      return (
        <AudioItem
          data={item}
          onPress={() => onAudioItemPress(index)}
          setData={setAudio}
          externalProgress={itemProgress?.progress}
          externalLoading={itemProgress?.loading}
        />
      );
    },
    [onAudioItemPress, setAudio, downloadProgress],
  );

  const keyExtractor = useCallback(
    (item: ComponentProps<typeof AudioItem>["data"], index: number) => item.id.toString(),
    [],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  }, [onRefresh]);

  if (!audios.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>No audios found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={audios}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={{ gap: 5 }}
      onRefresh={handleRefresh}
      refreshing={isRefreshing}
    />
  );
};

export default React.memo(AudioList);
