import React, { ComponentProps, useCallback } from "react";
import { FlatList } from "react-native";
import AudioItem from "./AudioItem";

type Props = {
  audios: ComponentProps<typeof AudioItem>["data"][];
  handleAudioItemPress: (index: number) => void;
  setAudio: (audio: ComponentProps<typeof AudioItem>["data"]) => void;
};

const AudioList = ({ audios, handleAudioItemPress, setAudio }: Props) => {
  const renderItem = useCallback(
    ({ item, index }: { item: ComponentProps<typeof AudioItem>["data"]; index: number }) => (
      <AudioItem data={item} onPress={() => handleAudioItemPress(index)} setData={setAudio} />
    ),
    [handleAudioItemPress, setAudio],
  );

  const keyExtractor = useCallback(
    (item: ComponentProps<typeof AudioItem>["data"], index: number) => item.id.toString(),
    [],
  );

  return (
    <FlatList data={audios} keyExtractor={keyExtractor} renderItem={renderItem} contentContainerStyle={{ gap: 5 }} />
  );
};

export default React.memo(AudioList);
