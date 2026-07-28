import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, CheckCircle } from "phosphor-react-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { api } from "@/src/lib/api";
import { useTheme } from "@/src/theme/ThemeContext";

type Step = "email" | "code" | "done";

export default function ForgotPassword() {
  const { c, mode, fonts, fontSize, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setError("");
    if (!email.trim()) {
      setError("Enter your email");
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(email.trim().toLowerCase());
      setStep("code");
    } catch (e: any) {
      setError(e?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const doReset = async () => {
    setError("");
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(email.trim().toLowerCase(), code.trim(), password);
      setStep("done");
    } catch (e: any) {
      setError(e?.detail || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const primary = step === "email" ? sendCode : doReset;
  const primaryLabel = step === "email" ? "Send code" : "Reset password";

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: insets.top }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Pressable testID="forgot-back" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={26} color={c.onSurface} />
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={90}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {step === "done" ? (
          <View style={{ alignItems: "center", marginTop: spacing["3xl"], gap: spacing.lg }}>
            <CheckCircle size={64} color={c.brand} weight="fill" />
            <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize["2xl"], textAlign: "center" }}>
              Password updated
            </Text>
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.lg, textAlign: "center" }}>
              You can now log in with your new password.
            </Text>
            <Button testID="forgot-goto-login" label="Back to log in" onPress={() => router.replace("/auth")} style={{ alignSelf: "stretch", marginTop: spacing.lg }} />
          </View>
        ) : (
          <>
            <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: 28, marginTop: spacing.sm }}>
              Reset password
            </Text>
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.lg, marginTop: spacing.sm, marginBottom: spacing.xl }}>
              {step === "email"
                ? "Enter your email and we'll send you a 6-digit code."
                : `Enter the 6-digit code sent to ${email} and choose a new password.`}
            </Text>

            <View style={{ gap: spacing.lg }}>
              {step === "email" ? (
                <Input
                  testID="forgot-email-input"
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  error={error || undefined}
                />
              ) : (
                <>
                  <Input
                    testID="forgot-code-input"
                    label="6-digit code"
                    value={code}
                    onChangeText={(t) => setCode(t.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <Input
                    testID="forgot-new-password"
                    label="New password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    error={error || undefined}
                  />
                  <Pressable testID="forgot-resend" onPress={sendCode} disabled={loading}>
                    <Text style={{ color: c.brand, fontFamily: fonts.medium, fontSize: fontSize.base }}>
                      Didn't get it? Resend code
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </>
        )}
      </KeyboardAwareScrollView>

      {step !== "done" ? (
        <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
          <View style={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface }}>
            <Button testID="forgot-submit" label={primaryLabel} onPress={primary} loading={loading} />
          </View>
        </KeyboardStickyView>
      ) : null}
    </View>
  );
}
