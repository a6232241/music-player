import { useTheme } from "@/context/ThemeContext";
import Apis from "@/utils/Apis";
import { GetTagGenreIncludeTagsResponse } from "@/utils/Apis/Sqlite/TagGenre/type";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  selected: Set<number>;
  onPress: (id: number) => void;
};

const TagMultiSelect = ({ selected, onPress }: Props) => {
  const { colors } = useTheme();
  const [tagGenres, setTagGenres] = useState<GetTagGenreIncludeTagsResponse[]>();
  const [isExtends, setIsExtends] = useState<boolean>(true);

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
      <TouchableOpacity onPress={() => setIsExtends((prev) => !prev)}>
        <Text style={{ fontWeight: "bold", fontSize: 20, color: colors.text }}>標籤</Text>
      </TouchableOpacity>
      {isExtends && (
        <View style={{ gap: 10 }}>
          {tagGenres?.map((tagGenre) => (
            <View key={tagGenre.id} style={{ gap: 5 }}>
              <Text style={{ fontWeight: "bold", fontSize: 18, color: colors.text }}>{tagGenre.name}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
                {tagGenre.tags.map((tag) => (
                  <View key={tag.id}>
                    <TouchableOpacity
                      onPress={() => onPress(tag.id)}
                      style={[
                        { padding: 10, borderRadius: 5, borderWidth: 1, borderColor: colors.border },
                        selected.has(tag.id) && { borderColor: colors.tint },
                      ]}>
                      <Text style={{ color: selected.has(tag.id) ? colors.tint : colors.text }}>{tag.name}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default React.memo(TagMultiSelect);
