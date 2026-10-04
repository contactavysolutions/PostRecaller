import { Image } from "expo-image";
import { WarningCircle } from "phosphor-react-native";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { PlatformBadge } from "@/src/components/PlatformBadge";
import { Item } from "@/src/lib/api";
import { useTheme } from "@/src/theme/ThemeContext";
import { PLATFORM_COLORS } from "@/src/theme/tokens";

const HEIGHTS = [150, 200, 168, 220, 176, 158];

function imgHeight(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return HEIGHTS[h % HEIGHTS.length];
}

export function MasonryCard({ item, onPress }: { item: Item; onPress: () => void }) {
  const { c, radius, fonts, fontSize, spacing, shadow } = useTheme();
  const height = imgHeight(item.id);
  const isPending = item.enrichment_status === "pending";
  const isFailed = item.enrichment_status === "failed" || item.enrichment_status === "manual";

  return (
    <Pressable
      testID={`vault-card-${item.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadow.tier1,
        {
          backgroundColor: c.surfaceSecondary,
          borderRadius: radius.md,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={{ height, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, overflow: "hidden" }}>
        {item.thumbnail_url ? (
          <Image
            source={{ uri: item.thumbnail_url }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: c.brandTertiary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlatformBadge platform={item.platform} size={34} />
          </View>
        )}
        <View style={{ position: "absolute", top: spacing.sm, right: spacing.sm }}>
          <PlatformBadge platform={item.platform} size={18} />
        </View>
      </View>

      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <Text
          numberOfLines={2}
          style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.lg, lineHeight: 21 }}
        >
          {item.title}
        </Text>
        {item.summary ? (
          <Text
            numberOfLines={3}
            style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base, lineHeight: 19 }}
          >
            {item.summary}
          </Text>
        ) : null}

        {isPending ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
              backgroundColor: c.brandTertiary,
              paddingHorizontal: 8,
              paddingVertical: 3.5,
              borderRadius: radius.pill,
              alignSelf: "flex-start",
            }}
          >
            <ActivityIndicator size={11} color={c.brand} />
            <Text style={{ color: c.brand, fontFamily: fonts.medium, fontSize: 11 }}>
              Processing AI…
            </Text>
          </View>
        ) : isFailed ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
            <WarningCircle size={15} color={c.warning} weight="fill" />
            <Text style={{ color: c.warning, fontFamily: fonts.regular, fontSize: fontSize.sm }}>
              Tap to enrich
            </Text>
          </View>
        ) : item.tags.length ? (
          <View style={styles.tagRow}>
            {item.tags.slice(0, 3).map((t) => (
              <View
                key={t}
                style={{
                  backgroundColor: c.brandTertiary,
                  borderRadius: radius.pill,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: c.onBrandTertiary, fontFamily: fonts.medium, fontSize: 11 }}>{t}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    overflow: "hidden",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
});
