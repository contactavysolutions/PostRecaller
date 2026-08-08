import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "phosphor-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";

const SECTIONS: { h: string; b: string }[] = [
  { h: "Acceptance of Terms", b: "By using PostRecaller you agree to these terms. PostRecaller is provided as-is to help you save and organize online content." },
  { h: "Your content", b: "You are responsible for the links and notes you save. Do not use PostRecaller to store or distribute unlawful content." },
  { h: "Free & Pro plans", b: "The free plan includes unlimited saves and 5 AI enrichments per day. PostRecaller Pro unlocks unlimited AI enrichments. You can cancel anytime." },
  { h: "Acceptable use", b: "Automated abuse, scraping of the service, or exceeding fair-use limits (200 saves/day) may result in rate limiting." },
  { h: "Termination", b: "You may delete your account at any time from the Profile screen, which permanently removes your data." },
  { h: "Contact", b: "Questions about these terms? Email support@postrecaller.com." },
];

export default function Terms() {
  const { c, mode, fonts, fontSize, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: insets.top }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Pressable testID="terms-back" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={26} color={c.onSurface} />
        </Pressable>
        <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.xl }}>Terms of Service</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 40, gap: spacing.xl }} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((s) => (
          <View key={s.h} style={{ gap: spacing.sm }}>
            <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.lg }}>{s.h}</Text>
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base, lineHeight: 21 }}>{s.b}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
