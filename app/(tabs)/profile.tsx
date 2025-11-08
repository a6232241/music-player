import { getDocumentFile } from "@/utils/helper";
import * as FileSystem from "expo-file-system";
import { Link } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const dbPath = "SQLite/main.db";

const ProfileScreen = () => {
  const handleBackupSqliteDB = async () => {
    try {
      const filePath = await getDocumentFile(dbPath);
      console.log(filePath);
      if (!filePath || !filePath.uri) throw new Error("No file selected");

      const response = await FileSystem.uploadAsync(`http://localhost:3000/backup`, filePath.uri, {
        fieldName: "file",
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      });
      const responseData = response?.body ? JSON.parse(response?.body) : null;
      if (responseData?.isError) throw new Error(responseData?.message);

      console.log("Upload successful:", responseData?.message);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleRestoreSqliteDB = async () => {
    try {
      const savePath = FileSystem.documentDirectory + dbPath;
      const response = await FileSystem.downloadAsync("http://localhost:3000/backup/main.db", savePath);
      if (response?.status !== 200) throw new Error("Failed to download file");

      console.log("Download successful:", response);
    } catch (error) {
      console.error("Error uploading file:", error);
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
