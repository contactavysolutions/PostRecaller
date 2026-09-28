import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CaretRight,
  FileText,
  ShieldCheck,
  SignOut,
  Trash,
} from "phosphor-react-native";
import React, { useCallback, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { Button } from "@/src/components/Button";
import { useAuth } from "@/src/store/auth";
import { useTheme } from "@/src/theme/ThemeContext";

function UsageRing({ used, limit }: { used: number; limit: number }) {
  const { c, fonts, fontSize } = useTheme();
  const size = 96;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(used / limit, 1);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.surfaceTertiary} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={pct >= 1 ? c.brandSecondary : c.brand}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.xl }}>{used}/{limit}</Text>
    </View>
  );
}

export default function Profile() {
  const { c, mode, fonts, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const refreshMe = useAuth((s) => s.refreshMe);
  const deleteAccount = useAuth((s) => s.deleteAccount);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshMe();
    }, [refreshMe]),
  );

  const onLogout = async () => {
    await logout();
    router.replace("/auth");
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      router.replace("/auth");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const tabBottom = 58 + insets.bottom;
  const initials = (user?.email?.[0] || "?").toUpperCase();

  const MenuRow = ({ icon, label, onPress, tint, testID }: any) => (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        backgroundColor: c.surfaceSecondary,
        borderRadius: radius.md,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {icon}
      <Text style={{ flex: 1, color: tint || c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.lg }}>{label}</Text>
      <CaretRight size={18} color={c.onSurfaceSecondary} />
    </Pressable>
  );

  const topPadding = Math.max(insets.top, Platform.OS === "android" ? 38 : 16) + spacing.xs;

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: topPadding }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: tabBottom + 24, gap: spacing.xl }} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <View style={{ alignItems: "center", gap: spacing.md, marginTop: spacing.md }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.brand, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: c.onBrand, fontFamily: fonts.medium, fontSize: 28 }}>{initials}</Text>
          </View>
          <Text testID="profile-email" style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.xl }}>{user?.email}</Text>
          <View style={{ backgroundColor: user?.plan === "pro" ? c.brand : c.surfaceTertiary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ color: user?.plan === "pro" ? c.onBrand : c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.sm }}>
              {user?.plan === "pro" ? "PostRecaller Pro" : "Free plan"}
            </Text>
          </View>
        </View>

        {/* Usage */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xl, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.lg }}>
          <UsageRing used={user?.ai_used_today ?? 0} limit={user?.ai_limit ?? 5} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.lg }}>Daily AI usage</Text>
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base }}>
              {user?.ai_used_today ?? 0} of {user?.ai_limit ?? 5} enrichments used today. Resets at midnight UTC.
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={{ gap: spacing.md }}>
          <MenuRow testID="profile-privacy" icon={<ShieldCheck size={22} color={c.onSurface} />} label="Privacy Policy" onPress={() => router.push("/legal/privacy")} />
          <MenuRow testID="profile-terms" icon={<FileText size={22} color={c.onSurface} />} label="Terms of Service" onPress={() => router.push("/legal/terms")} />
          <MenuRow testID="profile-logout" icon={<SignOut size={22} color={c.onSurface} />} label="Log out" onPress={onLogout} />
          <MenuRow testID="profile-delete" icon={<Trash size={22} color={c.error} />} label="Delete account" tint={c.error} onPress={() => setConfirmDelete(true)} />
        </View>
      </ScrollView>

      {/* Delete confirm */}
      <Modal visible={confirmDelete} transparent animationType="fade" onRequestClose={() => setConfirmDelete(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: spacing.xl }}>
          <View style={{ backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg }}>
            <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.xl }}>Delete account?</Text>
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base }}>
              This permanently deletes your account and every saved item. This cannot be undone.
            </Text>
            <Button testID="confirm-delete" label="Delete forever" onPress={onDelete} loading={deleting} style={{ backgroundColor: c.error }} />
            <Button testID="cancel-delete" label="Cancel" variant="ghost" onPress={() => setConfirmDelete(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
