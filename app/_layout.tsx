import ThemeToggle from "@/components/ThemeToggle";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
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

const Router = () => {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThemeToggle />,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ title: "上傳音樂" }} />
    </Stack>
  );
};

export default function RootLayout() {
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const dbInitResult = await Apis.init();
        if (!dbInitResult) {
          throw new Error("Failed to initialize the database");
        }

        setDb(dbInitResult.db);
      } catch (error) {
        console.error("Error initializing the database:", error);
      } finally {
        setIsDbLoading(false);
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  useDrizzleStudio(db);

  return (
    <ThemeProvider>
      <ActionSheetProvider>
        <SafeAreaProvider>
          {isDbLoading && (
            <SafeAreaView style={{ flex: 1 }}>
              <Text>Loading...</Text>
            </SafeAreaView>
          )}
          {!isDbLoading && <Router />}
        </SafeAreaProvider>
      </ActionSheetProvider>
    </ThemeProvider>
  );
}
