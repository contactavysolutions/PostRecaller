import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { useVault } from "@/src/store/vault";
import { useAuth } from "@/src/store/auth";
import { extractAndCleanUrl } from "@/src/utils/urlCleaner";

export default function ShareRoute() {
  const params = useLocalSearchParams<{ url?: string; text?: string }>();
  const router = useRouter();
  const openAddSheet = useVault((s) => s.openAddSheet);
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    // Dismiss native splash screen immediately when share route mounts
    SplashScreen.hideAsync().catch(() => {});

    if (!hydrated) return;

    const raw = params.url || params.text;
    if (raw) {
      const clean = extractAndCleanUrl(raw);
      if (clean) {
        openAddSheet(clean);
      }
    }

    if (token) {
      router.replace("/(tabs)");
    } else {
      router.replace("/auth");
    }
  }, [params.url, params.text, token, hydrated, router, openAddSheet]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0E1210",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={{ color: "#9ca3af", fontSize: 14 }}>
        Opening PostRecaller…
      </Text>
    </View>
  );
}
