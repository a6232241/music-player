import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <Pressable onPress={toggleTheme} style={styles.container}>
      <Ionicons name={theme === "light" ? "sunny" : "moon"} size={24} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
