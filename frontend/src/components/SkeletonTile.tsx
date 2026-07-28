import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/src/theme/ThemeContext";

export function SkeletonTile({ height }: { height: number }) {
  const { c, radius, spacing } = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.ease }), -1, true);
  }, [opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: c.surfaceSecondary,
          borderRadius: radius.md,
          overflow: "hidden",
          marginBottom: spacing.md,
        },
        anim,
      ]}
    >
      <View style={{ height, backgroundColor: c.surfaceTertiary }} />
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <View style={{ height: 12, borderRadius: 4, backgroundColor: c.surfaceTertiary, width: "80%" }} />
        <View style={{ height: 12, borderRadius: 4, backgroundColor: c.surfaceTertiary, width: "55%" }} />
      </View>
    </Animated.View>
  );
}
