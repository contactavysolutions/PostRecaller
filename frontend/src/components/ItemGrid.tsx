import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, Text, View } from "react-native";

import { MasonryCard } from "@/src/components/MasonryCard";
import { SkeletonTile } from "@/src/components/SkeletonTile";
import { api, Item } from "@/src/lib/api";
import { useTheme } from "@/src/theme/ThemeContext";

type Params = { tag?: string; intent?: string };

export function ItemGrid({
  params,
  refreshKey,
  onData,
  bottomInset = 24,
  topInset = 12,
}: {
  params: Params;
  refreshKey: number;
  onData?: (items: Item[]) => void;
  bottomInset?: number;
  topInset?: number;
}) {
  const { c, fonts, fontSize, spacing } = useTheme();
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      setError(false);
      try {
        const res = await api.listItems({ ...params, limit: 20 });
        setItems(res.items);
        setCursor(res.next_cursor);
        setHasMore(res.has_more);
        onData?.(res.items);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [params.tag, params.intent], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    load("initial");
  }, [load, refreshKey]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      const res = await api.listItems({ ...params, cursor, limit: 20 });
      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.next_cursor);
      setHasMore(res.has_more);
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, cursor, params.tag, params.intent]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <View style={{ flexDirection: "row", paddingHorizontal: 10, paddingTop: topInset }} testID="vault-loading">
        {[0, 1].map((col) => (
          <View key={col} style={{ flex: 1, paddingHorizontal: 6 }}>
            {[0, 1, 2].map((i) => (
              <SkeletonTile key={i} height={col === 0 ? (i % 2 ? 200 : 150) : i % 2 ? 150 : 200} />
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }} testID="vault-error">
        <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.lg, marginBottom: 8 }}>
          Failed to load vault
        </Text>
        <Text
          testID="vault-retry"
          onPress={() => load("initial")}
          style={{ color: c.brand, fontFamily: fonts.medium, fontSize: fontSize.base }}
        >
          Tap to retry
        </Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }} testID="vault-empty">
        <Image
          source={{ uri: "https://images.pexels.com/photos/28456460/pexels-photo-28456460.jpeg?auto=compress&cs=tinysrgb&w=600" }}
          style={{ width: 200, height: 200, borderRadius: 20, marginBottom: spacing.xl }}
          contentFit="cover"
        />
        <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.xl, marginBottom: 6 }}>
          {params.tag || params.intent ? "Nothing here yet" : "Your vault is empty"}
        </Text>
        <Text
          style={{
            color: c.onSurfaceSecondary,
            fontFamily: fonts.regular,
            fontSize: fontSize.base,
            textAlign: "center",
          }}
        >
          Save your first post with the + button below.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      testID="vault-grid"
      data={items}
      masonry
      numColumns={2}
      keyExtractor={(it) => it.id}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 6 }}>
          <MasonryCard item={item} onPress={() => router.push(`/item/${item.id}`)} />
        </View>
      )}
      contentContainerStyle={{ paddingHorizontal: 10, paddingTop: topInset, paddingBottom: bottomInset }}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load("refresh")} tintColor={c.brand} />
      }
      ListFooterComponent={
        loadingMore ? <ActivityIndicator color={c.brand} style={{ marginVertical: 20 }} /> : null
      }
    />
  );
}
