import { Buffer } from "buffer";
import { Image } from "expo-image";
import { ICommonTagsResult } from "music-metadata";
import React from "react";
import { Button, Text, View } from "react-native";

type Props = {
  metaCommon: ICommonTagsResult;
  onPress: () => void;
};

const AudioItem: React.FC<Props> = ({ metaCommon, onPress }) => {
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
        <Image
          style={{ height: "100%", aspectRatio: 1 }}
          source={
            metaCommon?.picture
              ? `data:${metaCommon.picture[0].format};base64,${Buffer.from(metaCommon.picture[0].data).toString("base64")}`
              : undefined
          }
        />
        <Text>{metaCommon?.title}</Text>
      </View>
    </>
  );
};

export default AudioItem;
