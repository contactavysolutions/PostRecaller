import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle, CircleNotch, Sparkle, X } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";

interface FloatingSaveToastProps {
  visible: boolean;
  type: "saving" | "saved" | "duplicate" | "detected" | "error";
  title: string;
  subtitle?: string;
  onAction?: () => void;
  actionLabel?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function FloatingSaveToast({
  visible,
  type,
  title,
  subtitle,
  onAction,
  actionLabel = "Save",
  onDismiss,
  autoDismissMs = 4000,
}: FloatingSaveToastProps) {
  const { c, fonts, fontSize, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible || type === "detected" || type === "saving") return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [visible, type, autoDismissMs, onDismiss]);

  if (!visible) return null;

  const topOffset = Math.max(insets.top + 8, Platform.OS === "android" ? 44 : 20);

  return (
    <Animated.View
      entering={FadeInUp.duration(240).springify()}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.container,
        {
          top: topOffset,
          backgroundColor: c.surface,
          borderColor: c.borderStrong,
          borderRadius: radius.lg,
          shadowColor: "#000",
          shadowOpacity: 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Icon */}
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor:
                type === "saved"
                  ? c.brandTertiary
                  : type === "error"
                  ? "rgba(239, 68, 68, 0.15)"
                  : c.surfaceSecondary,
            },
          ]}
        >
          {type === "saving" ? (
            <CircleNotch size={20} color={c.brand} />
          ) : type === "saved" ? (
            <CheckCircle size={20} color={c.brand} weight="fill" />
          ) : type === "detected" ? (
            <Sparkle size={20} color={c.brand} weight="fill" />
          ) : (
            <CheckCircle size={20} color={c.onSurfaceSecondary} />
          )}
        </View>

        {/* Text */}
        <View style={styles.textColumn}>
          <Text
            numberOfLines={1}
            style={{
              color: c.onSurface,
              fontFamily: fonts.medium,
              fontSize: fontSize.base,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={{
                color: c.onSurfaceSecondary,
                fontFamily: fonts.regular,
                fontSize: fontSize.sm,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Action Button (e.g. Save) */}
        {type === "detected" && onAction ? (
          <Pressable
            testID="toast-action-btn"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onAction();
            }}
            style={[
              styles.actionButton,
              { backgroundColor: c.brand, borderRadius: radius.pill },
            ]}
          >
            <Text
              style={{
                color: c.onBrand,
                fontFamily: fonts.medium,
                fontSize: fontSize.sm,
              }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}

        {/* Dismiss Button */}
        <Pressable
          testID="toast-dismiss-btn"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDismiss();
          }}
          hitSlop={10}
          style={styles.closeBtn}
        >
          <X size={18} color={c.onSurfaceSecondary} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textColumn: {
    flex: 1,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    padding: 4,
  },
});
