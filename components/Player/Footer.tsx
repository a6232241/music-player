import { MusicType } from "@/utils/Apis/Sqlite/Music/type";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  track?: MusicType & { isExist?: boolean };
  title: string;
  artist: string;
};

const Footer = ({ track, title, artist }: Props) => (
  <View style={styles.footerContent}>
    <Image source={track?.albumArt} style={styles.albumArtSmall} contentFit="cover" />
    <View style={styles.textContainer}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {artist}
      </Text>
    </View>
  </View>
);

export default React.memo(Footer);

const styles = StyleSheet.create({
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  albumArtSmall: {
    width: 50,
    height: 50,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  artist: {
    fontSize: 14,
    color: "#666",
  },
});
