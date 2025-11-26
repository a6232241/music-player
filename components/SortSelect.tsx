import { useTheme } from "@/context/ThemeContext";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export enum SortType {
  DEFAULT,
  DATE_ASC,
  DATE_DESC,
}

const options = ["預設", "日期(由舊到新)", "日期(由新到舊)", "取消"];
const cancelButtonIndex = options.length - 1;

type Props = {
  selected: SortType;
  onPress: (i?: number | undefined) => void | Promise<void>;
};

const SortSelect: React.FC<Props> = ({ selected, onPress }: Props) => {
  const { colors } = useTheme();
  const { showActionSheetWithOptions } = useActionSheet();

  const handlePress = () => {
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        containerStyle: { backgroundColor: colors.background },
        textStyle: { color: colors.text },
      },
      onPress,
    );
  };

  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <TouchableOpacity onPress={handlePress} style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
          <FontAwesome name="sort" size={24} color={colors.text} />
          <Text style={{ color: colors.text }}>{options[selected]}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default React.memo(SortSelect);
