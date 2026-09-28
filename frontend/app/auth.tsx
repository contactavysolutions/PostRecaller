import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  EnvelopeSimple,
  Eye,
  EyeSlash,
  LockSimple,
  Sparkle,
} from "phosphor-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { LogoIcon } from "@/src/components/LogoIcon";
import { useAuth } from "@/src/store/auth";
import { useTheme } from "@/src/theme/ThemeContext";

export default function AuthScreen() {
  const { c, mode, fonts, fontSize, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      if (isRegister) await register(email.trim().toLowerCase(), password);
      else await login(email.trim().toLowerCase(), password);
      router.replace("/");
    } catch (e: any) {
      setError(e?.detail || "Something went wrong. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.surface }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 16) + 12,
              paddingHorizontal: spacing.lg,
              paddingBottom: Math.max(insets.bottom, 16) + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardContainer}>
            {/* Executive Minimalist Brand Header */}
            <View style={styles.sectionHeaderMinimal}>
              {/* Glowing Concentric Brand Emblem */}
              <View style={[styles.minimalEmblemRing, { borderColor: c.borderStrong, backgroundColor: c.surfaceSecondary }]}>
                <View style={[styles.minimalEmblemInner, { backgroundColor: c.surface, shadowColor: c.brand }]}>
                  <LogoIcon size={32} />
                </View>
              </View>

              {/* App Name Lockup with Category Badge */}
              <View style={styles.brandTitleRow}>
                <Text style={[styles.brandNameText, { fontFamily: fonts.medium, color: c.onSurface }]}>
                  PostRecaller
                </Text>
                <View style={[styles.categoryBadge, { backgroundColor: c.surfaceSecondary, borderColor: c.border }]}>
                  <Sparkle size={11} color={c.brand} weight="fill" />
                  <Text style={[styles.categoryBadgeText, { fontFamily: fonts.medium, color: c.brand }]}>
                    AI VAULT
                  </Text>
                </View>
              </View>

              {/* Typographic Title */}
              <Text style={[styles.minimalHeading, { fontFamily: fonts.medium, color: c.onSurface }]}>
                {isRegister ? "Create your vault" : "Welcome back"}
              </Text>
              <Text style={[styles.minimalSubtitle, { fontFamily: fonts.regular, color: c.onSurfaceSecondary }]}>
                Everything you save, finally findable.
              </Text>
            </View>

            {/* Segmented Mode Switcher (Log in | Create account) */}
            <View style={[styles.segmentContainer, { backgroundColor: c.surfaceSecondary, borderColor: c.border }]}>
              <Pressable
                testID="tab-login"
                onPress={() => {
                  setIsRegister(false);
                  setError("");
                }}
                style={[
                  styles.segmentTab,
                  !isRegister && [styles.segmentTabActive, { backgroundColor: c.surface }],
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      fontFamily: fonts.medium,
                      color: !isRegister ? c.onSurface : c.onSurfaceSecondary,
                    },
                  ]}
                >
                  Log in
                </Text>
              </Pressable>

              <Pressable
                testID="tab-register"
                onPress={() => {
                  setIsRegister(true);
                  setError("");
                }}
                style={[
                  styles.segmentTab,
                  isRegister && [styles.segmentTabActive, { backgroundColor: c.surface }],
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      fontFamily: fonts.medium,
                      color: isRegister ? c.onSurface : c.onSurfaceSecondary,
                    },
                  ]}
                >
                  Create account
                </Text>
              </Pressable>
            </View>

            {/* Form Fields: Fully Visible Above The Fold */}
            <View style={styles.formFields}>
              <Input
                testID="auth-email-input"
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                leftIcon={<EnvelopeSimple size={18} color={c.onSurfaceSecondary} />}
              />

              <Input
                testID="auth-password-input"
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                error={error || undefined}
                leftIcon={<LockSimple size={18} color={c.onSurfaceSecondary} />}
                rightIcon={
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={8}
                    style={{ padding: 4 }}
                  >
                    {showPassword ? (
                      <EyeSlash size={19} color={c.onSurfaceSecondary} />
                    ) : (
                      <Eye size={19} color={c.onSurfaceSecondary} />
                    )}
                  </Pressable>
                }
              />
            </View>

            {/* Forgot Password Row */}
            {!isRegister ? (
              <View style={styles.forgotRow}>
                <Pressable
                  testID="auth-forgot"
                  onPress={() => router.push("/forgot-password")}
                  hitSlop={6}
                >
                  <Text style={[styles.forgotText, { fontFamily: fonts.medium, color: c.onSurfaceSecondary }]}>
                    Forgot password?
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* Primary Action Button */}
            <View style={styles.ctaWrapper}>
              <Button
                testID="auth-submit"
                label={isRegister ? "Create account" : "Log in"}
                onPress={submit}
                loading={loading}
              />
            </View>

            {/* Minimalist Feature Strip */}
            <View style={styles.minimalFeaturesRow}>
              <Text style={[styles.minimalFeatureItem, { fontFamily: fonts.regular, color: c.onSurfaceSecondary }]}>
                ⚡ Instant Recall  •  🔒 Private Vault  •  🌐 10+ Platforms
              </Text>
            </View>

            {/* Secondary Option: Explore Waitlist / Demo */}
            <View style={styles.footerRow}>
              <Pressable
                testID="auth-preview-waitlist"
                onPress={() => router.push("/waitlist")}
                style={({ pressed }) => [styles.previewLink, { opacity: pressed ? 0.75 : 1 }]}
              >
                <Text style={[styles.previewText, { fontFamily: fonts.medium, color: c.brand }]}>
                  Explore preview & waitlist →
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    width: "100%",
    maxWidth: 390,
  },
  sectionHeaderMinimal: {
    alignItems: "center",
    marginBottom: 14,
    paddingTop: 6,
  },
  minimalEmblemRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  minimalEmblemInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  brandNameText: {
    fontSize: 22,
    letterSpacing: 0.3,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  minimalHeading: {
    fontSize: 22,
    letterSpacing: -0.3,
    textAlign: "center",
    marginTop: 2,
  },
  minimalSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
    maxWidth: 300,
  },
  segmentContainer: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 14,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentTabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
  },
  formFields: {
    gap: 12,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginTop: 6,
  },
  forgotText: {
    fontSize: 12,
  },
  ctaWrapper: {
    marginTop: 16,
  },
  minimalFeaturesRow: {
    alignItems: "center",
    marginTop: 14,
  },
  minimalFeatureItem: {
    fontSize: 11,
    opacity: 0.8,
  },
  footerRow: {
    alignItems: "center",
    marginTop: 16,
  },
  previewLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  previewText: {
    fontSize: 13,
  },
});
