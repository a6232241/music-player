import Apis from "@/utils/Apis";
import { getDocumentFile } from "@/utils/helper";
import * as FileSystem from "expo-file-system";
import { Link } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const dbPath = "SQLite/main.db";

const ProfileScreen = () => {
  const handleBackupSqliteDB = async () => {
    try {
      const file = await getDocumentFile(dbPath);
      if (!file || !file.uri) throw new Error("No file selected");

      await Apis.file.postFile("backup", file);
    } catch (error) {
      console.error("Call handleBackupSqliteDB error:", error);
    }
  };

  const handleRestoreSqliteDB = async () => {
    try {
      const response = await Apis.file.getFile("backup/main.db", `${FileSystem.documentDirectory}${dbPath}`);
      if (!response?.uri) throw new Error("No file selected");

      await FileSystem.deleteAsync(`${response.uri}-wal`, { idempotent: true });
      await FileSystem.deleteAsync(`${response.uri}-shm`, { idempotent: true });

      await Apis.reloadDb();
    } catch (error) {
      console.error("Call handleRestoreSqliteDB error:", error);
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, gap: 10 }}>
        <Link href="../upload" asChild>
          <TouchableOpacity style={{ padding: 10, borderWidth: 1, borderColor: "black" }}>
            <Text style={{ fontSize: 20 }}>Upload</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={{ padding: 10, borderWidth: 1, borderColor: "black" }} onPress={handleBackupSqliteDB}>
          <Text style={{ fontSize: 20 }}>Backup DB</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 10, borderWidth: 1, borderColor: "black" }} onPress={handleRestoreSqliteDB}>
          <Text style={{ fontSize: 20 }}>Restore DB</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

export default ProfileScreen;
