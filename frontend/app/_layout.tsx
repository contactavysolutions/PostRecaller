// Extension error guard MUST be imported first so its capture-phase listeners
// attach before anything else can throw.
import "@/src/lib/extensionErrorGuard";
import { installExtensionErrorGuard } from "@/src/lib/extensionErrorGuard";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { ThemeProvider } from "@/src/theme/ThemeContext";
import { useAuth } from "@/src/store/auth";
import { FloatingSaveToast } from "@/src/components/FloatingSaveToast";
import { useQuickShareHandler } from "@/src/hooks/useQuickShareHandler";

LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until fonts register.
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { toast, dismissToast, saveDetectedUrl } = useQuickShareHandler();

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="share" options={{ animation: "none" }} />
        <Stack.Screen name="auth" options={{ animation: "fade" }} />
        <Stack.Screen name="waitlist" options={{ animation: "fade" }} />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="item/[id]" />
        <Stack.Screen name="collection/[intent]" />
        <Stack.Screen name="legal/privacy" />
        <Stack.Screen name="legal/terms" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        <FloatingSaveToast
          visible={toast.visible}
          type={toast.type}
          title={toast.title}
          subtitle={toast.subtitle}
          onAction={saveDetectedUrl}
          actionLabel="Save"
          onDismiss={dismissToast}
        />
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [iconsLoaded, iconsError] = useIconFonts();
  const [fontsLoaded, fontsError] = useFonts({
    "Satoshi-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Satoshi-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
  });
  const hydrate = useAuth((s) => s.hydrate);
  const hydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    // Re-install after mount so our wrappers sit in front of LogBox's handlers.
    installExtensionErrorGuard();
    hydrate();

    // Failsafe: hide native splash screen within 2.5 seconds no matter what
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 2500);
    return () => clearTimeout(timer);
  }, [hydrate]);

  const ready = (iconsLoaded || iconsError) && (fontsLoaded || fontsError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider>
            <BottomSheetModalProvider>
              <AppContent />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
