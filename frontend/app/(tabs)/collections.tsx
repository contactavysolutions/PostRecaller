import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  BookOpen,
  CaretRight,
  CookingPot,
  GraduationCap,
  IconProps,
  PlayCircle,
  ShoppingBag,
} from "phosphor-react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/lib/api";
import { useVault } from "@/src/store/vault";
import { useTheme } from "@/src/theme/ThemeContext";

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  "Read Later": BookOpen,
  "Try Recipe": CookingPot,
  Watch: PlayCircle,
  Shop: ShoppingBag,
  Learn: GraduationCap,
};

export default function Collections() {
  const { c, mode, fonts, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const refreshKey = useVault((s) => s.refreshKey);
  const [data, setData] = useState<{ intent: string; count: number }[]>([]);

  const fetchData = useCallback(() => {
    api.collections().then((r) => setData(r.collections)).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData, refreshKey]),
  );

  const tabBottom = 58 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: insets.top }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize["2xl"] }}>Collections</Text>
        <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base, marginTop: 2 }}>
          Organized by what you intend to do.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: tabBottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {data.map(({ intent, count }) => {
          const Icon = ICONS[intent] || BookOpen;
          return (
            <Pressable
              key={intent}
              testID={`collection-${intent}`}
              onPress={() => router.push(`/collection/${encodeURIComponent(intent)}`)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                backgroundColor: c.surfaceSecondary,
                borderRadius: radius.md,
                padding: spacing.lg,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View style={{ width: 46, height: 46, borderRadius: radius.md, backgroundColor: c.brandTertiary, alignItems: "center", justifyContent: "center" }}>
                <Icon size={24} color={c.brand} weight="regular" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.lg }}>{intent}</Text>
                <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.sm }}>
                  {count} {count === 1 ? "item" : "items"}
                </Text>
              </View>
              <CaretRight size={20} color={c.onSurfaceSecondary} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
