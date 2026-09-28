import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MagnifyingGlass, X } from "phosphor-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlatformBadge } from "@/src/components/PlatformBadge";
import { api, Item } from "@/src/lib/api";
import { useVault } from "@/src/store/vault";
import { useTheme } from "@/src/theme/ThemeContext";

const EXAMPLES = ["that pasta recipe", "productivity tips", "travel ideas", "design inspiration"];

export default function SearchScreen() {
  const { c, mode, fonts, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const refreshKey = useVault((s) => s.refreshKey);

  const [all, setAll] = useState<Item[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.listItems({ limit: 50 }).then((r) => setAll(r.items)).catch(() => {});
  }, [refreshKey]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return all.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        i.tags.some((t) => t.includes(q)),
    );
  }, [query, all]);

  const tabBottom = 58 + insets.bottom;
  const topPadding = Math.max(insets.top, Platform.OS === "android" ? 38 : 16) + spacing.xs;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: topPadding }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <View
          style={{
            flex: 1,
            height: 48,
            borderRadius: radius.md,
            backgroundColor: c.surfaceSecondary,
            borderWidth: 1,
            borderColor: c.border,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            gap: 8,
          }}
        >
          <MagnifyingGlass size={20} color={c.onSurfaceSecondary} />
          <TextInput
            testID="search-input"
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Search your vault…"
            placeholderTextColor={c.onSurfaceSecondary}
            style={{ flex: 1, color: c.onSurface, fontFamily: fonts.regular, fontSize: fontSize.lg }}
          />
          {query ? (
            <Pressable testID="search-clear" onPress={() => setQuery("")} hitSlop={10}>
              <X size={18} color={c.onSurfaceSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: tabBottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!query ? (
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base }}>
              Try searching for…
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {EXAMPLES.map((e) => (
                <Pressable
                  key={e}
                  testID={`search-example-${e}`}
                  onPress={() => setQuery(e)}
                  style={{ backgroundColor: c.brandTertiary, borderRadius: radius.pill, paddingHorizontal: 14, height: 36, justifyContent: "center" }}
                >
                  <Text style={{ color: c.onBrandTertiary, fontFamily: fonts.medium, fontSize: fontSize.sm }}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : results.length === 0 ? (
          <Text testID="search-noresults" style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base, marginTop: spacing.xl, textAlign: "center" }}>
            No matches for “{query}”.
          </Text>
        ) : (
          <View style={{ gap: spacing.md }}>
            {results.map((item) => (
              <Pressable
                key={item.id}
                testID={`search-result-${item.id}`}
                onPress={() => router.push(`/item/${item.id}`)}
                style={{ flexDirection: "row", gap: spacing.md, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.md }}
              >
                <View style={{ width: 20, paddingTop: 2 }}>
                  <PlatformBadge platform={item.platform} size={18} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text numberOfLines={1} style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.lg }}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={2} style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base }}>
                    {item.summary}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
