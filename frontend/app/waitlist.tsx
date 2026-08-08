import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  Check,
  LinkSimple,
  MagnifyingGlass,
  Sparkle,
  Stack as StackIcon,
} from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/lib/api";
import { useTheme } from "@/src/theme/ThemeContext";
import { LogoIcon } from "@/src/components/LogoIcon";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_W = 1120;

// ---------------- Waitlist form ----------------
function WaitlistForm({
  onBrand,
  onCount,
}: {
  onBrand?: boolean;
  onCount?: (n: number) => void;
}) {
  const { c, fonts, fontSize, spacing, radius } = useTheme();
  const { width } = useWindowDimensions();
  const inline = width >= 620;

  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fg = onBrand ? c.onBrand : c.onSurface;
  const fieldBg = onBrand ? "rgba(255,255,255,0.16)" : c.surfaceSecondary;
  const fieldBorder = onBrand ? "rgba(255,255,255,0.28)" : c.border;
  const placeholder = onBrand ? "rgba(255,255,255,0.7)" : c.onSurfaceSecondary;
  const btnBg = onBrand ? "#FFFFFF" : c.brand;
  const btnFg = onBrand ? c.brand : c.onBrand;

  const submit = async () => {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setState("loading");
    try {
      const res = await api.joinWaitlist(clean);
      setPosition(res.position);
      onCount?.(res.count);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setState("done");
    } catch {
      setState("error");
      setError("Something went wrong — try again");
    }
  };

  if (state === "done") {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          backgroundColor: onBrand ? "rgba(255,255,255,0.16)" : c.brandTertiary,
          borderRadius: radius.md,
          padding: spacing.lg,
        }}
      >
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: onBrand ? "#fff" : c.brand, alignItems: "center", justifyContent: "center" }}>
          <Check size={20} color={onBrand ? c.brand : c.onBrand} weight="bold" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: fg, fontFamily: fonts.medium, fontSize: fontSize.lg }}>
            You're #{position} on the list
          </Text>
          <Text style={{ color: onBrand ? "rgba(255,255,255,0.8)" : c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base }}>
            We'll email you the moment your invite is ready.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: inline ? "row" : "column", gap: spacing.md }}>
        <TextInput
          testID="waitlist-email-input"
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={submit}
          placeholder="you@example.com"
          placeholderTextColor={placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={{
            flex: inline ? 1 : undefined,
            minHeight: 54,
            paddingHorizontal: 18,
            borderRadius: radius.md,
            backgroundColor: fieldBg,
            borderWidth: 1,
            borderColor: error ? c.error : fieldBorder,
            color: fg,
            fontFamily: fonts.regular,
            fontSize: fontSize.lg,
          }}
        />
        <Pressable
          testID="waitlist-join-button"
          onPress={submit}
          disabled={state === "loading"}
          style={({ pressed }) => ({
            minHeight: 54,
            paddingHorizontal: 26,
            borderRadius: radius.md,
            backgroundColor: btnBg,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ color: btnFg, fontFamily: fonts.medium, fontSize: fontSize.lg }}>
            {state === "loading" ? "Joining…" : "Join the waitlist"}
          </Text>
          {state !== "loading" ? <ArrowRight size={18} color={btnFg} weight="bold" /> : null}
        </Pressable>
      </View>
      <Text style={{ color: error ? c.error : onBrand ? "rgba(255,255,255,0.75)" : c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.sm }}>
        {error || "No spam. Just one email when we launch."}
      </Text>
    </View>
  );
}

// ---------------- Chest artwork ----------------
function ChestArt({ isWide }: { isWide: boolean }) {
  const { c } = useTheme();
  const size = isWide ? 460 : 300;
  return (
    <View
      style={{
        borderRadius: 28,
        backgroundColor: c.surface,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.18,
        shadowRadius: 36,
        elevation: 10,
      }}
    >
      <Image
        source={require("@/assets/images/auth_hero.png")}
        style={{ width: size, height: size, borderRadius: 28 }}
        contentFit="cover"
        contentPosition="top"
      />
    </View>
  );
}

// ---------------- Landing page ----------------
export default function Waitlist() {
  const { c, mode, fonts, fontSize, spacing, radius } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWide = width >= 980;

  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    api.waitlistCount().then((r) => setCount(r.count)).catch(() => {});
  }, []);

  const social =
    count !== null && count >= 25
      ? `${count.toLocaleString()} early savers already joined`
      : "Private beta • Limited early invites";

  const h1 = isWide ? 60 : width >= 500 ? 46 : 36;

  const pad = isWide ? 48 : 20;

  const features = [
    { Icon: LinkSimple, title: "Save from anywhere", body: "Instagram, TikTok, YouTube, X, Reddit, articles — any link, one tap." },
    { Icon: Sparkle, title: "AI reads it for you", body: "Every save gets an instant summary, smart tags, and the right collection." },
    { Icon: MagnifyingGlass, title: "Actually findable", body: "Search the way you think — by phrase, topic, or intent. It just surfaces." },
  ];

  const steps = [
    { n: "1", title: "Paste or share a link", body: "Send anything to PostRecaller from any app." },
    { n: "2", title: "AI enriches it", body: "Title, summary, and tags are added automatically." },
    { n: "3", title: "Find it in seconds", body: "Your searchable vault, beautifully organized." },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Top bar */}
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: pad }}>
          <View style={{ width: "100%", maxWidth: MAX_W, alignSelf: "center", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <LogoIcon size={32} />
              <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: 22 }}>PostRecaller</Text>
            </View>
            <Pressable testID="landing-login" onPress={() => router.push("/auth")} hitSlop={10}>
              <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.base }}>Log in</Text>
            </Pressable>
          </View>
        </View>

        {/* Hero */}
        <View style={{ paddingHorizontal: pad, paddingTop: isWide ? 48 : 32 }}>
          <View
            style={{
              width: "100%",
              maxWidth: MAX_W,
              alignSelf: "center",
              flexDirection: isWide ? "row" : "column",
              alignItems: isWide ? "center" : "stretch",
              gap: isWide ? 56 : 40,
            }}
          >
            {/* left */}
            <Animated.View entering={FadeInDown.duration(500)} style={{ flex: isWide ? 1 : undefined, gap: spacing.xl }}>
              <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.brandTertiary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.brandSecondary }} />
                <Text style={{ color: c.onBrandTertiary, fontFamily: fonts.medium, fontSize: fontSize.sm }}>{social}</Text>
              </View>

              <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: h1, lineHeight: h1 * 1.05, letterSpacing: -0.5 }}>
                Everything you save,{"\n"}
                <Text style={{ color: c.brandSecondary }}>finally findable.</Text>
              </Text>

              <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: isWide ? 20 : 17, lineHeight: isWide ? 30 : 26, maxWidth: 520 }}>
                Stop losing the posts, videos, and articles you swear you'll come back to. PostRecaller drops every link into one AI-organized vault you can actually search.
              </Text>

              <View style={{ maxWidth: 520, width: "100%" }}>
                <WaitlistForm onCount={setCount} />
              </View>
            </Animated.View>

            {/* right — phone mock */}
            <Animated.View entering={FadeInDown.duration(600).delay(120)} style={{ alignItems: "center", justifyContent: "center" }}>
              <ChestArt isWide={isWide} />
            </Animated.View>
          </View>
        </View>

        {/* Features */}
        <View style={{ paddingHorizontal: pad, paddingTop: isWide ? 96 : 64 }}>
          <View style={{ width: "100%", maxWidth: MAX_W, alignSelf: "center" }}>
            <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: isWide ? 34 : 26, marginBottom: spacing.xl, letterSpacing: -0.3 }}>
              A memory for your internet.
            </Text>
            <View style={{ flexDirection: isWide ? "row" : "column", gap: spacing.xl }}>
              {features.map(({ Icon, title, body }) => (
                <View key={title} style={{ flex: isWide ? 1 : undefined, gap: spacing.md }}>
                  <View style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: c.brandTertiary, alignItems: "center", justifyContent: "center" }}>
                    <Icon size={26} color={c.brand} weight="regular" />
                  </View>
                  <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.xl }}>{title}</Text>
                  <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.lg, lineHeight: 24, maxWidth: 340 }}>{body}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={{ paddingHorizontal: pad, paddingTop: isWide ? 96 : 64 }}>
          <View style={{ width: "100%", maxWidth: MAX_W, alignSelf: "center" }}>
            <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: isWide ? 34 : 26, marginBottom: spacing.xl, letterSpacing: -0.3 }}>
              How it works
            </Text>
            <View style={{ flexDirection: isWide ? "row" : "column", gap: spacing.xl }}>
              {steps.map(({ n, title, body }) => (
                <View key={n} style={{ flex: isWide ? 1 : undefined, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md }}>
                  <Text style={{ color: c.brandSecondary, fontFamily: fonts.medium, fontSize: 28 }}>{n}</Text>
                  <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.xl }}>{title}</Text>
                  <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.lg, lineHeight: 24 }}>{body}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Closing CTA band */}
        <View style={{ paddingHorizontal: pad, paddingTop: isWide ? 96 : 64 }}>
          <View style={{ width: "100%", maxWidth: MAX_W, alignSelf: "center" }}>
            <View style={{ backgroundColor: c.brand, borderRadius: radius.lg, padding: isWide ? 56 : 28, gap: spacing.xl, overflow: "hidden" }}>
              <StackIcon size={40} color={c.onBrand} weight="fill" />
              <Text style={{ color: c.onBrand, fontFamily: fonts.medium, fontSize: isWide ? 36 : 26, lineHeight: isWide ? 42 : 32, letterSpacing: -0.3, maxWidth: 620 }}>
                Get early access to your findable vault.
              </Text>
              <View style={{ maxWidth: 560, width: "100%" }}>
                <WaitlistForm onBrand onCount={setCount} />
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: pad, paddingTop: isWide ? 64 : 48 }}>
          <View style={{ width: "100%", maxWidth: MAX_W, alignSelf: "center", borderTopWidth: 1, borderTopColor: c.border, paddingTop: spacing.xl, flexDirection: isWide ? "row" : "column", justifyContent: "space-between", gap: spacing.md }}>
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base }}>
              © 2026 PostRecaller · Everything you save, finally findable.
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.xl }}>
              <Pressable onPress={() => router.push("/legal/privacy")}>
                <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.base }}>Privacy</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/legal/terms")}>
                <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.base }}>Terms</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
