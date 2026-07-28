import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "phosphor-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ItemGrid } from "@/src/components/ItemGrid";
import { useVault } from "@/src/store/vault";
import { useTheme } from "@/src/theme/ThemeContext";

export default function CollectionScreen() {
  const { c, mode, fonts, fontSize, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { intent } = useLocalSearchParams<{ intent: string }>();
  const refreshKey = useVault((s) => s.refreshKey);
  const name = decodeURIComponent(intent || "");

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: insets.top }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Pressable testID="collection-back" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={26} color={c.onSurface} />
        </Pressable>
        <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.xl }}>{name}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <ItemGrid params={{ intent: name }} refreshKey={refreshKey} bottomInset={insets.bottom + 24} topInset={spacing.md} />
      </View>
    </View>
  );
}
