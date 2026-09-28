import { useEffect, useRef, useState, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

import { api } from "@/src/lib/api";
import { useAuth } from "@/src/store/auth";
import { useVault } from "@/src/store/vault";
import { detectSocialPlatform, extractAndCleanUrl } from "@/src/utils/urlCleaner";

export interface QuickToastState {
  visible: boolean;
  type: "saving" | "saved" | "duplicate" | "detected" | "error";
  title: string;
  subtitle?: string;
  detectedUrl?: string;
}

export function useQuickShareHandler() {
  const token = useAuth((s) => s.token);
  const triggerRefresh = useVault((s) => s.triggerRefresh);
  const refreshMe = useAuth((s) => s.refreshMe);

  const [toast, setToast] = useState<QuickToastState>({
    visible: false,
    type: "saved",
    title: "",
  });

  const lastProcessedUrl = useRef<string | null>(null);
  const dismissedUrl = useRef<string | null>(null);

  const dismissToast = useCallback(() => {
    if (toast.detectedUrl) {
      dismissedUrl.current = toast.detectedUrl;
    }
    setToast((prev) => ({ ...prev, visible: false }));
  }, [toast.detectedUrl]);

  const saveUrl = useCallback(
    async (rawUrl: string, auto = false) => {
      const cleaned = extractAndCleanUrl(rawUrl);
      if (!cleaned) return;

      const platformInfo = detectSocialPlatform(cleaned);

      setToast({
        visible: true,
        type: "saving",
        title: "Saving to PostRecaller…",
        subtitle: `${platformInfo.name}: ${cleaned}`,
      });

      try {
        const res = await api.createItem(cleaned);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        triggerRefresh();
        refreshMe();

        if (res.duplicate) {
          setToast({
            visible: true,
            type: "duplicate",
            title: "Already in your vault!",
            subtitle: `${platformInfo.name} save was already recorded`,
          });
        } else {
          setToast({
            visible: true,
            type: "saved",
            title: "Saved to PostRecaller!",
            subtitle: `${platformInfo.name} post added & AI queued`,
          });
        }
      } catch (err: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setToast({
          visible: true,
          type: "error",
          title: "Failed to save link",
          subtitle: err?.detail || "Please try again",
        });
      }
    },
    [triggerRefresh, refreshMe]
  );

  // Check incoming URL from deep link / intent
  const handleIncomingUrl = useCallback(
    (url: string | null) => {
      if (!url) return;
      try {
        const parsed = Linking.parse(url);
        const target =
          (parsed.queryParams?.url as string) ||
          (parsed.queryParams?.text as string) ||
          (parsed.path?.startsWith("http") ? parsed.path : null);

        if (target) {
          const cleaned = extractAndCleanUrl(target);
          if (cleaned && cleaned !== lastProcessedUrl.current) {
            lastProcessedUrl.current = cleaned;
            saveUrl(cleaned, true);
          }
        }
      } catch {
        /* ignore invalid linking payload */
      }
    },
    [saveUrl]
  );

  // Check clipboard whenever the app is active
  const checkClipboard = useCallback(async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) return;

      const clipText = await Clipboard.getStringAsync();
      if (!clipText) return;

      const cleaned = extractAndCleanUrl(clipText);
      if (!cleaned) return;

      // Don't reprompt if user already explicitly dismissed this exact URL
      if (cleaned === dismissedUrl.current) return;

      const platformInfo = detectSocialPlatform(cleaned);

      setToast({
        visible: true,
        type: "detected",
        title: `${platformInfo.name} link copied`,
        subtitle: cleaned,
        detectedUrl: cleaned,
      });
    } catch {
      /* clipboard read permission not granted */
    }
  }, []);

  useEffect(() => {
    // 1. Initial check on launch / mount
    const timer = setTimeout(() => {
      checkClipboard();
    }, 400);

    // 2. Initial URL on launch
    Linking.getInitialURL().then(handleIncomingUrl);

    // 3. Listener for URLs while app is open or backgrounded
    const sub = Linking.addEventListener("url", (e) => handleIncomingUrl(e.url));

    // 4. Listener for app foregrounding (e.g. user returns from Instagram)
    const appStateSub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        checkClipboard();
      }
    });

    return () => {
      clearTimeout(timer);
      sub.remove();
      appStateSub.remove();
    };
  }, [handleIncomingUrl, checkClipboard]);

  // Re-check when token becomes available (after auth hydrate)
  useEffect(() => {
    if (token) {
      checkClipboard();
    }
  }, [token, checkClipboard]);

  return {
    toast,
    dismissToast,
    saveDetectedUrl: () => {
      if (toast.detectedUrl) {
        saveUrl(toast.detectedUrl);
      }
    },
  };
}
