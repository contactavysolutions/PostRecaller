import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { ThemeProvider } from "@/src/theme/ThemeContext";
import { useAuth } from "@/src/store/auth";

LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until fonts register.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [iconsLoaded, iconsError] = useIconFonts();
  const [fontsLoaded, fontsError] = useFonts({
    "Satoshi-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Satoshi-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
  });
  const hydrate = useAuth((s) => s.hydrate);
  const hydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const ready = (iconsLoaded || iconsError) && (fontsLoaded || fontsError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider>
            <BottomSheetModalProvider>
              <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="auth" options={{ animation: "fade" }} />
          <Stack.Screen name="forgot-password" />
                  <Stack.Screen name="item/[id]" />
                  <Stack.Screen name="collection/[intent]" />
                  <Stack.Screen name="legal/privacy" />
                  <Stack.Screen name="legal/terms" />
                </Stack>
              </View>
            </BottomSheetModalProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
