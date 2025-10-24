import Apis from "@/utils/Apis";
import { GetTagGenreIncludeTagsResponse } from "@/utils/Apis/Sqlite/TagGenre/type";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  selected: Set<number>;
  onPress: (id: number) => void;
};

const TagFilter = ({ selected, onPress }: Props) => {
  const [tagGenres, setTagGenres] = useState<GetTagGenreIncludeTagsResponse[]>();

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
      {tagGenres?.map((tagGenre) => (
        <View key={tagGenre.id} style={{ gap: 5 }}>
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>{tagGenre.name}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
            {tagGenre.tags.map((tag) => (
              <View key={tag.id}>
                <TouchableOpacity
                  onPress={() => onPress(tag.id)}
                  style={[
                    { padding: 10, borderRadius: 5, borderWidth: 1, borderColor: "transparent" },
                    selected.has(tag.id) && { borderColor: "#007AFF" },
                  ]}>
                  <Text style={{ color: "#007AFF" }}>{tag.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export default TagFilter;
