import { GetMusicResponse } from "@/utils/Apis/Sqlite/Music/type";
import { Image } from "expo-image";
import React from "react";
import { Button, Text, View } from "react-native";

type Props = {
  data: GetMusicResponse & { isExist?: boolean };
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
          opacity: data?.isExist ? 1 : 0.5,
        }}
        pointerEvents={data?.isExist ? "auto" : "none"}>
        <Button title="Play" onPress={onPress} />
        <Image style={{ height: "100%", aspectRatio: 1 }} source={data?.albumArt} />
        <Text>{data?.title ?? ""}</Text>
      </View>
    </>
  );
};

export default AudioItem;
