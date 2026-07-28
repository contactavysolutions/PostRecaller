import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

export function TagPill({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}) {
  const { c, radius, fonts, fontSize } = useTheme();

  const content = (
    <Text
      numberOfLines={1}
      style={{
        color: selected ? c.onBrand : c.onBrandTertiary,
        fontFamily: fonts.medium,
        fontSize: fontSize.sm,
      }}
    >
      {label}
    </Text>
  );

  const styleBase = {
    height: 36,
    paddingHorizontal: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: radius.pill,
    backgroundColor: selected ? c.brand : c.brandTertiary,
    flexShrink: 0,
  };

  if (!onPress) {
    return (
      <Pressable testID={testID} style={styleBase} disabled>
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styleBase, { opacity: pressed ? 0.8 : 1 }]}
    >
      {content}
    </Pressable>
  );
}
