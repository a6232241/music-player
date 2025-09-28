import { audios } from "@/utils/assets/audio";
import { useAudioPlayer } from "expo-audio";
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const player = useAudioPlayer(audios[0]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={["right", "left", "bottom"]}>
        <Button title="Play Sound" onPress={() => player.play()} />
      </SafeAreaView>
    </>
  );
}
