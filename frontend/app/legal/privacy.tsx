import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "phosphor-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";

const SECTIONS: { h: string; b: string }[] = [
  { h: "Privacy Policy", b: "PostRecaller stores the links and notes you choose to save, along with your email address for authentication. We use AI services to generate summaries and tags for your saved content." },
  { h: "What we collect", b: "Your email, a securely hashed password, and the items (URLs, notes, AI-generated titles/summaries/tags) you save. We never sell your data." },
  { h: "AI processing", b: "When you save a link, its public metadata is sent to our AI provider to generate a summary and tags. We log token usage to monitor service costs." },
  { h: "Your control", b: "You can edit or delete any item at any time. Deleting your account permanently removes your profile and all saved items from our database." },
  { h: "Contact", b: "For any privacy questions, reach us at contactavysolutions@gmail.com." },
];

export default function Privacy() {
  const { c, mode, fonts, fontSize, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: insets.top }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Pressable testID="privacy-back" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={26} color={c.onSurface} />
        </Pressable>
        <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.xl }}>Privacy Policy</Text>
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
