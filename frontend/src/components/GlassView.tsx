import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

// Glass surface — ONLY for tab bar, sticky search header, add-sheet handle.
export function GlassView({
  children,
  style,
  intensity = 40,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}) {
  const { mode, c } = useTheme();

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          { backgroundColor: mode === "dark" ? "rgba(22,22,21,0.85)" : "rgba(251,251,249,0.85)" },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={mode === "dark" ? "dark" : "light"}
      experimentalBlurMethod="dimezisBlurView"
      style={[{ backgroundColor: "transparent" }, style]}
    >
      <View style={{ backgroundColor: mode === "dark" ? "rgba(22,22,21,0.35)" : "rgba(251,251,249,0.35)", flex: 1 }}>
        {children}
      </View>
    </BlurView>
  );
}
