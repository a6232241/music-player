import Apis from "@/utils/Apis";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    (async () => {
      const dbInitResult = await Apis.init();
      if (!dbInitResult.success) {
        console.error("Failed to initialize the database.");
        return;
      }
      setIsDbLoading(false);
      await SplashScreen.hideAsync();

      const db = await SQLite.openDatabaseAsync("main.db");
      setDb(db);
    })();
  }, []);

  useDrizzleStudio(db);

  return (
    <ActionSheetProvider>
      <SafeAreaProvider>
        {isDbLoading && (
          <SafeAreaView style={{ flex: 1 }}>
            <Text>Loading...</Text>
          </SafeAreaView>
        )}
        {!isDbLoading && (
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="upload" />
          </Stack>
        )}
      </SafeAreaProvider>
    </ActionSheetProvider>
  );
}
