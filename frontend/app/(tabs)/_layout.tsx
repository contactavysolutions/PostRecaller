import { Redirect, Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  House,
  MagnifyingGlass,
  Plus,
  Stack as StackIcon,
  User,
} from "phosphor-react-native";
import React from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddSheet } from "@/src/components/AddSheet";
import { GlassView } from "@/src/components/GlassView";
import { useAuth } from "@/src/store/auth";
import { useVault } from "@/src/store/vault";
import { useTheme } from "@/src/theme/ThemeContext";

export default function TabsLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const token = useAuth((s) => s.token);
  const openAddSheet = useVault((s) => s.openAddSheet);

  if (!token) return <Redirect href="/auth" />;

  const tabBarHeight = 58 + insets.bottom;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.brand,
          tabBarInactiveTintColor: c.onSurfaceSecondary,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            height: tabBarHeight,
            paddingTop: 8,
            paddingBottom: insets.bottom,
            borderTopColor: c.border,
            borderTopWidth: Platform.OS === "web" ? 1 : 0.5,
            backgroundColor: Platform.OS === "web" ? c.surface : "transparent",
            elevation: 0,
          },
          tabBarBackground:
            Platform.OS === "web"
              ? undefined
              : () => <GlassView intensity={60} style={{ flex: 1 }} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <House size={26} color={color} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <MagnifyingGlass size={26} color={color} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            tabBarButton: () => (
              <Pressable
                testID="add-tab-button"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  openAddSheet();
                }}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: c.brand,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: -14,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Plus size={28} color={c.onBrand} weight="bold" />
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="collections"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <StackIcon size={26} color={color} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <User size={26} color={color} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
      </Tabs>
      <AddSheet />
    </>
  );
}
