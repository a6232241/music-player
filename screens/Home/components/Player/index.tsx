import { useTheme } from "@/context/ThemeContext";
import { MusicType } from "@/utils/Apis/Sqlite/Music/type";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Footer from "./Footer";
import FullPlayerModal from "./FullPlayerModal";

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
      <FullPlayerModal
        track={track}
        isPlaying={isPlaying}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onPlayPause={onPlayPause}
        onNext={onNext}
        onPrev={onPrev}
      />
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
  miniControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
});

export default React.memo(Player);
