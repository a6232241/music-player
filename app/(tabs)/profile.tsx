import { useTheme } from "@/context/ThemeContext";
import Apis from "@/utils/Apis";
import { getDocumentFile } from "@/utils/helper";
import * as FileSystem from "expo-file-system";
import { Link } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const dbPath = "SQLite/main.db";

const ProfileScreen = () => {
  const { colors } = useTheme();

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
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={{ flex: 1, gap: 10, backgroundColor: colors.background }}>
        <Link href="../upload" asChild>
          <TouchableOpacity style={{ padding: 10, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 20, color: colors.text }}>Upload Music</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity
          style={{ padding: 10, borderWidth: 1, borderColor: colors.border }}
          onPress={handleBackupSqliteDB}>
          <Text style={{ fontSize: 20, color: colors.text }}>Backup DB</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 10, borderWidth: 1, borderColor: colors.border }}
          onPress={handleRestoreSqliteDB}>
          <Text style={{ fontSize: 20, color: colors.text }}>Restore DB</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

export default ProfileScreen;
