import { useTheme } from "@/context/ThemeContext";
import { MusicType } from "@/services/database/repositories/Music/type";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type Props = {
  track: MusicType & { isExist?: boolean };
  isPlaying: boolean;
  visible: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
};

const FullPlayerModal: React.FC<Props> = ({ track, isPlaying, visible, onClose, onPlayPause, onNext, onPrev }) => {
  const { colors } = useTheme();

  const title = track.title || track.fileName;
  const artist = track.artist || "Unknown Artist";

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={30} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Lyrics Section */}
          <View style={styles.lyricsContainer}>
            <ScrollView contentContainerStyle={styles.lyricsContent}>
              <Text style={[styles.lyricsText, { color: colors.text }]}>
                {track.lyrics ? track.lyrics : "not find lyrics"}
              </Text>
            </ScrollView>
          </View>

          {/* Footer Section in Modal */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <View style={styles.modalFooterContent}>
              <Image source={track.albumArt} style={styles.albumArtLarge} contentFit="cover" />
              <View style={styles.modalTextContainer}>
                <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={[styles.modalArtist, { color: colors.text }]} numberOfLines={1}>
                  {artist}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={onPrev}>
                <Ionicons name="play-skip-back" size={35} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onPlayPause} style={styles.playPauseButton}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={45} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onNext}>
                <Ionicons name="play-skip-forward" size={35} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    padding: 10,
    alignItems: "flex-start",
  },
  closeButton: {
    padding: 5,
  },
  lyricsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  lyricsContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lyricsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    lineHeight: 24,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalFooterContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  albumArtLarge: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  modalTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalArtist: {
    fontSize: 16,
    color: "#666",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
  },
  playPauseButton: {
    padding: 10,
  },
});

export default React.memo(FullPlayerModal);
