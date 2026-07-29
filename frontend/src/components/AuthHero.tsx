import { LinearGradient } from "expo-linear-gradient";
import { Check } from "phosphor-react-native";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { PlatformBadge } from "@/src/components/PlatformBadge";
import { useTheme } from "@/src/theme/ThemeContext";
import { PLATFORM_COLORS } from "@/src/theme/tokens";

// A softly-floating saved-post card. Communicates the product at a glance.
function FloatCard({
  platform,
  width,
  height,
  style,
  amplitude = 8,
  duration = 2600,
  delay = 0,
}: {
  platform: string;
  width: number;
  height: number;
  style: any;
  amplitude?: number;
  duration?: number;
  delay?: number;
}) {
  const { c, radius, shadow } = useTheme();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [t, duration, delay]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: -amplitude + t.value * amplitude * 2 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width,
          height,
          backgroundColor: c.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: c.border,
          overflow: "hidden",
        },
        shadow.tier1,
        style,
        anim,
      ]}
    >
      <View style={{ height: height * 0.52, backgroundColor: PLATFORM_COLORS[platform] + "22" }}>
        <View style={{ position: "absolute", top: 8, right: 8 }}>
          <PlatformBadge platform={platform} size={14} />
        </View>
      </View>
      <View style={{ padding: 10, gap: 6 }}>
        <View style={{ height: 6, width: "80%", borderRadius: 3, backgroundColor: c.surfaceTertiary }} />
        <View style={{ height: 6, width: "55%", borderRadius: 3, backgroundColor: c.surfaceTertiary }} />
      </View>
    </Animated.View>
  );
}

export function AuthHero() {
  const { c, fonts } = useTheme();

  return (
    <View style={styles.container}>
      {/* warm moss gradient base */}
      <LinearGradient colors={["#3F5143", "#4A5D4E", "#6C8371"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />

      {/* soft bokeh accents for depth */}
      <View style={{ position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "#C26E5D", opacity: 0.18, top: -70, right: -60 }} />
      <View style={{ position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "#FFFFFF", opacity: 0.08, bottom: 10, left: -50 }} />

      {/* floating saved cards */}
      <FloatCard platform="youtube" width={150} height={150} amplitude={9} duration={3000} style={{ left: "6%", top: "16%", transform: [{ rotate: "-7deg" }] }} />
      <FloatCard platform="instagram" width={118} height={118} amplitude={7} duration={2600} delay={300} style={{ right: "6%", top: "9%", transform: [{ rotate: "6deg" }] }} />
      <FloatCard platform="pinterest" width={96} height={112} amplitude={6} duration={2900} delay={600} style={{ right: "9%", top: "54%", transform: [{ rotate: "9deg" }] }} />
      <FloatCard platform="web" width={176} height={120} amplitude={10} duration={3200} delay={150} style={{ left: "20%", top: "52%", transform: [{ rotate: "-3deg" }] }} />

      {/* "Saved" confirmation pill to imply the core action */}
      <View style={{ position: "absolute", left: "16%", top: "44%", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 4 }}>
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#4A5D4E", alignItems: "center", justifyContent: "center" }}>
          <Check size={12} color="#FFFFFF" weight="bold" />
        </View>
        <Text style={{ color: "#1C1C1A", fontFamily: fonts.medium, fontSize: 12 }}>Saved & enriched</Text>
      </View>

      {/* bottom fade blends the hero into the form surface */}
      <LinearGradient colors={["transparent", c.surface]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "42%",
    overflow: "hidden",
  },
});
