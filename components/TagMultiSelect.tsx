import { useTheme } from "@/context/ThemeContext";
import Apis from "@/utils/Apis";
import { GetTagGenreIncludeTagsResponse } from "@/utils/Apis/Sqlite/TagGenre/type";
import { Entypo } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type Props = {
  selected: Set<number>;
  onPress: (id: number) => void;
};

const TagMultiSelect = ({ selected, onPress }: Props) => {
  const { colors } = useTheme();
  const [tagGenres, setTagGenres] = useState<GetTagGenreIncludeTagsResponse[]>();
  const [isExtends, setIsExtends] = useState<boolean>(false);

  useEffect(() => {
    try {
      (async () => {
        const list = await Apis.sqlite?.tagGenre.getTagGenresIncludeTags();
        if (!list) throw new Error("Failed to get tag genres");
        setTagGenres(list);
      })();
    } catch (error) {
      console.error("Error getting tag genres:", error);
    }
  }, []);

  return (
    <View style={{ gap: 10 }}>
      <TouchableOpacity
        onPress={() => setIsExtends((prev) => !prev)}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontWeight: "bold", fontSize: 20, color: colors.text }}>標籤</Text>
        <Entypo name={!isExtends ? "chevron-up" : "chevron-down"} size={24} color={colors.text} />
      </TouchableOpacity>

      {isExtends && (
        <View style={{ gap: 10 }}>
          {tagGenres?.map((tagGenre) => (
            <View key={tagGenre.id} style={{ gap: 5 }}>
              <Text style={{ fontWeight: "bold", fontSize: 18, color: colors.text }}>{tagGenre.name}</Text>
              <FlatList
                data={tagGenre.tags}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View key={item.id}>
                    <TouchableOpacity
                      onPress={() => onPress(item.id)}
                      style={[
                        { padding: 5, borderRadius: 5, borderWidth: 1, borderColor: colors.border },
                        selected.has(item.id) && { borderColor: colors.tint },
                      ]}>
                      <Text style={{ color: colors.tint }}>{item.name}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                horizontal
                contentContainerStyle={{ gap: 5 }}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default React.memo(TagMultiSelect);
