import { Link } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <Link href="../upload" asChild>
          <TouchableOpacity style={{ padding: 10, borderWidth: 1, borderColor: "black" }}>
            <Text style={{ fontSize: 20 }}>Upload</Text>
          </TouchableOpacity>
        </Link>
      </SafeAreaView>
    </>
  );
};

export default ProfileScreen;
