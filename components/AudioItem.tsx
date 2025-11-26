import Apis from "@/utils/Apis";
import { GetMusicResponse } from "@/utils/Apis/Sqlite/Music/type";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, Text, View } from "react-native";

type Data = GetMusicResponse & { isExist?: boolean };

type Props = {
  data: Data;
  onPress: () => void;
  setData: (audios: Data) => void;
};

const AudioItem: React.FC<Props> = ({ data, onPress, setData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleDownloadPress = async () => {
    setIsLoading(true);
    try {
      if (!data?.fileName) throw new Error("This music is not exist file name");
      await Apis.file.getFile(`assets/${data?.fileName}`, `${FileSystem.documentDirectory}/${data?.fileName}`);
      setData({ ...data, isExist: true });
    } catch (error) {
      let errorMessage = "Unknown error";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === "string") errorMessage = error;

      Alert.alert("Error", errorMessage);
      console.error("Call handleDownloadPress error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View>
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

        {!data?.isExist && (
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
            }}>
            {isLoading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <Button title="Download" onPress={handleDownloadPress} />
            )}
          </View>
        )}
      </View>
    </>
  );
};

export default React.memo(AudioItem);
