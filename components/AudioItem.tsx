import { GetMusicResponse } from "@/utils/Apis/Sqlite/Music/type";
import { Image } from "expo-image";
import React from "react";
import { Button, Text, View } from "react-native";

type Props = {
  data: GetMusicResponse;
  onPress: () => void;
};

const AudioItem: React.FC<Props> = ({ data, onPress }) => {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: 10,
          height: 70,
          backgroundColor: "white",
        }}>
        <Button title="Play" onPress={onPress} />
        <Image style={{ height: "100%", aspectRatio: 1 }} source={data?.albumArt} />
        <Text>{data?.title ?? ""}</Text>
      </View>
    </>
  );
};

export default AudioItem;
