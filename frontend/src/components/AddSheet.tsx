import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { CheckCircle, ClipboardText, LinkSimple, X } from "phosphor-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/Button";
import { PlatformBadge } from "@/src/components/PlatformBadge";
import { api, Item } from "@/src/lib/api";
import { useAuth } from "@/src/store/auth";
import { useVault } from "@/src/store/vault";
import { useTheme } from "@/src/theme/ThemeContext";

type Stage = "input" | "loading" | "result" | "duplicate" | "error";

function looksLikeUrl(s: string): boolean {
  return /^(https?:\/\/|www\.)\S+\.\S+/.test(s.trim());
}

export function AddSheet() {
  const { c, fonts, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const addSheetOpen = useVault((s) => s.addSheetOpen);
  const closeAddSheet = useVault((s) => s.closeAddSheet);
  const triggerRefresh = useVault((s) => s.triggerRefresh);
  const refreshMe = useAuth((s) => s.refreshMe);

  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<Item | null>(null);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUrl("");
    setStage("input");
    setErrorMsg("");
    setResult(null);
    setClipUrl(null);
  }, []);

  useEffect(() => {
    if (!addSheetOpen) return;
    reset();
    Clipboard.getStringAsync()
      .then((v) => {
        if (v && looksLikeUrl(v)) setClipUrl(v.trim());
      })
      .catch(() => {
        /* clipboard permission denied (common on web) */
      });
  }, [addSheetOpen, reset]);

  const onSave = useCallback(
    async (targetUrl: string) => {
      const clean = targetUrl.trim();
      if (!looksLikeUrl(clean)) {
        setErrorMsg("Enter a valid link (https://…)");
        return;
      }
      setErrorMsg("");
      setStage("loading");
      try {
        const res = await api.createItem(clean);
        setResult(res.item);
        if (res.duplicate) {
          setStage("duplicate");
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setStage("result");
          triggerRefresh();
          refreshMe();
        }
      } catch (e: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrorMsg(e?.detail || "Something went wrong");
        setStage("error");
      }
    },
    [triggerRefresh, refreshMe],
  );

  const openResult = useCallback(() => {
    if (result) {
      closeAddSheet();
      setTimeout(() => router.push(`/item/${result.id}`), 250);
    }
  }, [result, router, closeAddSheet]);

  return (
    <Modal
      visible={addSheetOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={closeAddSheet}
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Pressable testID="add-sheet-backdrop" style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={closeAddSheet} />
        <View
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.md,
            maxHeight: "86%",
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: c.borderStrong, marginBottom: spacing.md }} />
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.lg }}>
            {/* header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg }}>
              <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize["2xl"] }}>Save Link</Text>
              <Pressable testID="add-sheet-close" onPress={closeAddSheet} hitSlop={12}>
                <X size={24} color={c.onSurfaceSecondary} />
              </Pressable>
            </View>

            {(stage === "input" || stage === "loading" || stage === "error") && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: c.surfaceSecondary,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: errorMsg ? c.error : c.border,
                    paddingHorizontal: 14,
                    gap: 10,
                  }}
                >
                  <LinkSimple size={20} color={c.onSurfaceSecondary} />
                  <TextInput
                    testID="add-url-input"
                    value={url}
                    onChangeText={setUrl}
                    editable={stage !== "loading"}
                    placeholder="Paste a link from anywhere"
                    placeholderTextColor={c.onSurfaceSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    onSubmitEditing={() => onSave(url)}
                    style={{ flex: 1, minHeight: 52, color: c.onSurface, fontFamily: fonts.regular, fontSize: fontSize.lg }}
                  />
                </View>
                {errorMsg ? (
                  <Text style={{ color: c.error, fontFamily: fonts.regular, fontSize: fontSize.sm, marginTop: 6 }}>
                    {errorMsg}
                  </Text>
                ) : null}

                {clipUrl && clipUrl !== url && stage === "input" ? (
                  <Pressable
                    testID="add-clipboard-chip"
                    onPress={() => setUrl(clipUrl)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: c.brandTertiary,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: radius.md,
                      marginTop: spacing.md,
                    }}
                  >
                    <ClipboardText size={18} color={c.onBrandTertiary} />
                    <Text numberOfLines={1} style={{ flex: 1, color: c.onBrandTertiary, fontFamily: fonts.medium, fontSize: fontSize.base }}>
                      Paste copied link?
                    </Text>
                  </Pressable>
                ) : null}

                {stage === "loading" ? (
                  <View style={{ alignItems: "center", paddingVertical: spacing.xl, gap: 12 }}>
                    <ActivityIndicator color={c.brand} />
                    <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base }}>
                      AI is reading…
                    </Text>
                  </View>
                ) : (
                  <Button testID="add-save-button" label="Save to Vault" onPress={() => onSave(url)} style={{ marginTop: spacing.xl }} />
                )}
              </>
            )}

            {(stage === "result" || stage === "duplicate") && result ? (
              <View style={{ gap: spacing.lg }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <CheckCircle size={22} color={c.brand} weight="fill" />
                  <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.lg }}>
                    {stage === "duplicate" ? "Already in your vault" : "Saved & enriched"}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: spacing.md, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.md }}>
                  {result.thumbnail_url ? (
                    <Image source={{ uri: result.thumbnail_url }} style={{ width: 64, height: 64, borderRadius: radius.sm }} contentFit="cover" />
                  ) : (
                    <View style={{ width: 64, height: 64, borderRadius: radius.sm, backgroundColor: c.brandTertiary, alignItems: "center", justifyContent: "center" }}>
                      <PlatformBadge platform={result.platform} size={22} />
                    </View>
                  )}
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text numberOfLines={2} style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.base }}>
                      {result.title}
                    </Text>
                    <Text numberOfLines={2} style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.sm }}>
                      {result.summary}
                    </Text>
                  </View>
                </View>

                <Button testID="add-view-item" label="View item" onPress={openResult} />
                <Button testID="add-save-another" label="Save another" variant="ghost" onPress={reset} />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
