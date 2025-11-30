import { useTheme } from "@/context/ThemeContext";
import Apis from "@/utils/Apis";
import { DownloadProgress } from "@/utils/Apis/File/type";
import { GetMusicResponse } from "@/utils/Apis/Sqlite/Music/type";
import { Image } from "expo-image";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, Text, TouchableOpacity, View } from "react-native";

type Data = GetMusicResponse & { isExist?: boolean };

type Props = {
  data: Data;
  onPress: () => void;
  setData: (audios: Data) => void;
  externalProgress?: number;
  externalLoading?: boolean;
};

const AudioItem: React.FC<Props> = ({ data, onPress, setData, externalProgress, externalLoading }) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const displayProgress = externalProgress ?? progress;
  const displayLoading = externalLoading ?? isLoading;

  const handleDownloadPress = async () => {
    setIsLoading(true);
    setProgress(0);
    try {
      if (!data?.fileName) throw new Error("This music is not exist file name");

      const result = await Apis.file.downloadAudio(data.fileName, (downloadProgress: DownloadProgress) => {
        setProgress(downloadProgress.progress * 100);
      });

      if (result.success) {
        setData({ ...data, isExist: true });
      } else {
        throw new Error(result.error || "Download failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      Alert.alert("Error", errorMessage);
      console.error("Call handleDownloadPress error:", error);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <>
      <View>
        <TouchableOpacity onPress={onPress}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: 10,
              height: 70,
              backgroundColor: colors.background,
              opacity: data?.isExist ? 1 : 0.5,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            pointerEvents={data?.isExist ? "auto" : "none"}>
            <Image style={{ height: "100%", aspectRatio: 1 }} source={data?.albumArt} />
            <Text style={{ color: colors.text }}>{data?.title ?? ""}</Text>
          </View>
        </TouchableOpacity>

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
            {displayLoading ? (
              <View style={{ alignItems: "center", gap: 5 }}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={{ color: colors.text, fontSize: 12 }}>{Math.round(displayProgress)}%</Text>
              </View>
            ) : (
              <Button title="Download" onPress={handleDownloadPress} color={colors.tint} />
            )}
          </View>
        )}
      </View>
    </>
  );
};

export default React.memo(AudioItem);
