import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MagnifyingGlass } from "phosphor-react-native";
import React, { useCallback, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ItemGrid } from "@/src/components/ItemGrid";
import { TagPill } from "@/src/components/TagPill";
import { Item } from "@/src/lib/api";
import { useAuth } from "@/src/store/auth";
import { useVault } from "@/src/store/vault";
import { useTheme } from "@/src/theme/ThemeContext";

export default function VaultHome() {
  const { c, mode, fonts, fontSize, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const refreshKey = useVault((s) => s.refreshKey);
  const user = useAuth((s) => s.user);

  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const onData = useCallback(
    (items: Item[]) => {
      if (selectedTag) return; // keep full tag set when filtering
      const set = new Set<string>();
      items.forEach((i) => i.tags.forEach((t) => set.add(t)));
      setTags(Array.from(set).slice(0, 25));
    },
    [selectedTag],
  );

  const initials = (user?.email?.[0] || "?").toUpperCase();
  const tabBottom = 58 + insets.bottom;
  const topPadding = Math.max(insets.top, Platform.OS === "android" ? 38 : 16) + spacing.xs;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      {/* Primary search header — solid, properly padded below status bar */}
      <View
        style={{
          paddingTop: topPadding,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.sm,
          backgroundColor: c.surface,
          zIndex: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          <Pressable
            testID="vault-search-bar"
            onPress={() => router.push("/search")}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 23,
              backgroundColor: c.surfaceSecondary,
              borderWidth: 1,
              borderColor: c.border,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              gap: 10,
            }}
          >
            <MagnifyingGlass size={20} color={c.onSurfaceSecondary} />
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base }}>
              Search your vault…
            </Text>
          </Pressable>
          <Pressable
            testID="vault-avatar"
            onPress={() => router.push("/profile")}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.brand, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: c.onBrand, fontFamily: fonts.medium, fontSize: fontSize.lg }}>{initials}</Text>
          </Pressable>
        </View>
      </View>

      {/* Tag rail — sits cleanly below the search bar */}
      {tags.length > 0 ? (
        <View style={{ height: 50, borderBottomWidth: 0.5, borderBottomColor: c.border, backgroundColor: c.surface }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: "center" }}
          >
            <TagPill label="All" selected={selectedTag === null} onPress={() => setSelectedTag(null)} testID="tag-all" />
            {tags.map((t) => (
              <TagPill
                key={t}
                label={t}
                selected={selectedTag === t}
                onPress={() => setSelectedTag((cur) => (cur === t ? null : t))}
                testID={`tag-${t}`}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        <ItemGrid
          params={{ tag: selectedTag || undefined }}
          refreshKey={refreshKey}
          onData={onData}
          bottomInset={tabBottom + 24}
          topInset={spacing.md}
        />
      </View>
    </View>
  );
}
