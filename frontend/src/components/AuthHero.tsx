import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

// Hero artwork (user-designed): a treasure chest overflowing with saved content —
// "everything you save is treasure." Blends into the form via a bottom fade.
export function AuthHero() {
  const { c } = useTheme();

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/auth_hero.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top"
      />
      {/* bottom fade blends the illustration into the form surface */}
      <LinearGradient
        colors={["transparent", c.surface]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "46%",
    overflow: "hidden",
  },
});
