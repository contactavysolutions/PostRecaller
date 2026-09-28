import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

// Hero artwork: compact, floating illuminated card that frames the treasure chest & social badges
// perfectly without eating excessive viewport height or clipping.
export function AuthHero() {
  const { c, fonts } = useTheme();

  return (
    <View style={styles.wrapper}>
      {/* Floating glass illustration card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: c.surfaceSecondary,
            borderColor: c.border,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/auth_hero.png")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="center"
        />

        {/* Soft bottom vignette overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Floating pill badge */}
        <View style={styles.badge}>
          <View style={[styles.badgeInner, { backgroundColor: c.surface }]}>
            <Text style={[styles.badgeText, { fontFamily: fonts.medium, color: c.onSurface }]}>
              ✨ Universal AI Vault
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  card: {
    width: "100%",
    height: 136,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    justifyContent: "flex-end",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    overflow: "hidden",
  },
  badgeInner: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
