import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={["right", "left", "bottom"]}>
        <Text>Edit app/index.tsx to edit this screen.</Text>
      </SafeAreaView>
    </>
  );
}
