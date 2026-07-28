import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { useAuth } from "@/src/store/auth";
import { useTheme } from "@/src/theme/ThemeContext";

export default function AuthScreen() {
  const { c, mode, fonts, fontSize, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setLoading(true);
    try {
      if (isRegister) await register(email.trim().toLowerCase(), password);
      else await login(email.trim().toLowerCase(), password);
      router.replace("/");
    } catch (e: any) {
      setError(e?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1581084324492-c8076f130f86?auto=format&fit=crop&w=900&q=80" }}
        style={{ width: "100%", height: "40%" }}
        contentFit="cover"
      />
      <KeyboardAwareScrollView
        bottomOffset={90}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: 40, marginTop: spacing.sm }}>
          PostRecaller
        </Text>
        <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.lg, marginBottom: spacing.xl }}>
          Everything you save, finally findable.
        </Text>

        <View style={{ gap: spacing.lg }}>
          <Input
            testID="auth-email-input"
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <Input
            testID="auth-password-input"
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={error || undefined}
          />
        </View>

        <Pressable testID="auth-toggle" onPress={() => { setIsRegister((v) => !v); setError(""); }} style={{ marginTop: spacing.xl }}>
          <Text style={{ color: c.brand, fontFamily: fonts.medium, fontSize: fontSize.base }}>
            {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <View style={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface }}>
          <Button
            testID="auth-submit"
            label={isRegister ? "Create account" : "Log in"}
            onPress={submit}
            loading={loading}
          />
        </View>
      </KeyboardStickyView>
    </View>
  );
}
