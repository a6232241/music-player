import { useTheme } from "@/context/ThemeContext";
import { MusicType } from "@/utils/Apis/Sqlite/Music/type";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Footer from "./Footer";

type Props = {
  track?: MusicType & { isExist?: boolean };
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
};

const Player: React.FC<Props> = ({ track, isPlaying, onPlayPause, onNext, onPrev }) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  if (!track) return null;

  const title = track.title || track.fileName;
  const artist = track.artist || "Unknown Artist";

  return (
    <>
      {/* Mini Player (Visible when modal is closed) */}
      {!modalVisible && (
        <TouchableOpacity
          style={[styles.miniPlayer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
          onPress={() => setModalVisible(true)}>
          <Footer track={track} title={title} artist={artist} />
          <View style={styles.miniControls}>
            <TouchableOpacity onPress={onPlayPause}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Full Player Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <SafeAreaProvider>
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="chevron-down" size={30} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Lyrics Section */}
            <View style={styles.lyricsContainer}>
              <ScrollView contentContainerStyle={styles.lyricsContent}>
                <Text style={[styles.lyricsText, { color: colors.text }]}>{track.lyrics ? track.lyrics : "not find lyrics"}</Text>
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
    </>
  );
};

const styles = StyleSheet.create({
  miniPlayer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    height: 70,
  },
  albumArtSmall: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  artist: {
    fontSize: 12,
    color: "#666",
  },
  miniControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
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

export default React.memo(Player);
