import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  BookmarkSimple,
  CheckCircle,
  CircleNotch,
  ClipboardText,
  FileArchive,
  Globe,
  InstagramLogo,
  LinkSimple,
  RedditLogo,
  Sparkle,
  TiktokLogo,
  TwitterLogo,
  UploadSimple,
  X,
  YoutubeLogo,
} from "phosphor-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
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
import { extractAndCleanUrl } from "@/src/utils/urlCleaner";

type Stage = "input" | "loading" | "result" | "duplicate" | "error";

interface ImportStats {
  status: string;
  platform: string;
  platform_display: string;
  total_found: number;
  unique_valid: number;
  imported: number;
  skipped_duplicate: number;
  ai_enrichment_queued: number;
  source_files?: string[];
}

const PLATFORM_GUIDES = [
  { id: "instagram", name: "Instagram", icon: InstagramLogo, tip: "Profile → Menu → Your Activity → Download info → Saved → JSON" },
  { id: "tiktok", name: "TikTok", icon: TiktokLogo, tip: "Profile → Menu → Settings → Download data → Select JSON" },
  { id: "youtube", name: "YouTube", icon: YoutubeLogo, tip: "Google Takeout → YouTube watch-history / playlists" },
  { id: "reddit", name: "Reddit", icon: RedditLogo, tip: "Settings → Request data → saved_posts.csv" },
  { id: "x", name: "X", icon: TwitterLogo, tip: "Settings → Your Account → Download archive → bookmarks.js" },
  { id: "browser", name: "Browser", icon: Globe, tip: "Bookmarks Manager → Export bookmarks to HTML" },
];

export function AddSheet() {
  const { c, fonts, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const addSheetOpen = useVault((s) => s.addSheetOpen);
  const closeAddSheet = useVault((s) => s.closeAddSheet);
  const triggerRefresh = useVault((s) => s.triggerRefresh);
  const refreshMe = useAuth((s) => s.refreshMe);

  // Tab: "single" link vs "import" archive/saves
  const [activeTab, setActiveTab] = useState<"single" | "import">("single");

  // Single link state
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<Item | null>(null);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  // Archive / Social Import state
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [rawTextPayload, setRawTextPayload] = useState("");
  const [filePayloadBlob, setFilePayloadBlob] = useState<Blob | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [clipDetectedText, setClipDetectedText] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUrl("");
    setStage("input");
    setErrorMsg("");
    setResult(null);
    setClipUrl(null);
    setSelectedFileName(null);
    setRawTextPayload("");
    setFilePayloadBlob(null);
    setSelectedGuide(null);
    setImportStats(null);
    setIsImporting(false);
    setImportError("");
    setClipDetectedText(null);
  }, []);

  useEffect(() => {
    if (!addSheetOpen) return;
    reset();
    Clipboard.getStringAsync()
      .then((v) => {
        if (!v) return;
        const trimmed = v.trim();
        const cleaned = extractAndCleanUrl(trimmed);
        if (cleaned) {
          setClipUrl(cleaned);
        } else if (
          trimmed.includes("<DL>") ||
          trimmed.includes("<!DOCTYPE") ||
          trimmed.includes("saved_saved_media") ||
          trimmed.includes("FavoriteVideoList") ||
          trimmed.includes("window.YTD") ||
          trimmed.startsWith("{") ||
          trimmed.startsWith("[")
        ) {
          setClipDetectedText(trimmed);
        }
      })
      .catch(() => {
        /* clipboard permission not granted */
      });
  }, [addSheetOpen, reset]);

  const onSave = useCallback(
    async (targetUrl: string) => {
      const clean = extractAndCleanUrl(targetUrl);
      if (!clean) {
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

  const pickArchiveFile = async () => {
    setImportError("");
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "application/zip",
          "application/x-zip-compressed",
          "application/json",
          "text/csv",
          "text/html",
          "text/plain",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setSelectedFileName(file.name);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const fileRes = await fetch(file.uri);
        const nameLower = file.name.toLowerCase();

        if (nameLower.endsWith(".zip")) {
          const blob = await fileRes.blob();
          setFilePayloadBlob(blob);
          setRawTextPayload("");
        } else {
          const text = await fileRes.text();
          setRawTextPayload(text);
          setFilePayloadBlob(null);
        }
      }
    } catch (e: any) {
      setImportError(e?.message || "Failed to select file");
    }
  };

  const onImport = useCallback(async () => {
    if (!filePayloadBlob && !rawTextPayload.trim()) {
      setImportError("Please choose an export file or paste archive code");
      return;
    }
    setImportError("");
    setIsImporting(true);
    try {
      let res: ImportStats;
      if (filePayloadBlob) {
        res = await api.importArchive("", selectedFileName || "archive.zip", filePayloadBlob);
      } else {
        res = await api.importArchive(rawTextPayload, selectedFileName || "import.json");
      }

      setImportStats(res);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerRefresh();
      refreshMe();
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setImportError(e?.detail || "Failed to import saves. Please check the file format.");
    } finally {
      setIsImporting(false);
    }
  }, [filePayloadBlob, rawTextPayload, selectedFileName, triggerRefresh, refreshMe]);

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
        <Pressable
          testID="add-sheet-backdrop"
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }}
          onPress={closeAddSheet}
        />
        <View
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.md,
            maxHeight: "92%",
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 40,
              height: 5,
              borderRadius: 3,
              backgroundColor: c.borderStrong,
              marginBottom: spacing.md,
            }}
          />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing.lg,
            }}
          >
            {/* Header strip */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: spacing.md,
              }}
            >
              <Text
                style={{
                  color: c.onSurface,
                  fontFamily: fonts.medium,
                  fontSize: fontSize["2xl"],
                }}
              >
                {activeTab === "single" ? "Save Link" : "Universal Importer"}
              </Text>
              <Pressable testID="add-sheet-close" onPress={closeAddSheet} hitSlop={12}>
                <X size={24} color={c.onSurfaceSecondary} />
              </Pressable>
            </View>

            {/* Segmented Mode Switcher */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: c.surfaceSecondary,
                borderRadius: radius.md,
                padding: 3,
                marginBottom: spacing.lg,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <Pressable
                testID="tab-add-single"
                onPress={() => {
                  setActiveTab("single");
                  setErrorMsg("");
                }}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 8,
                  borderRadius: radius.sm,
                  backgroundColor: activeTab === "single" ? c.surface : "transparent",
                }}
              >
                <LinkSimple
                  size={16}
                  color={activeTab === "single" ? c.onSurface : c.onSurfaceSecondary}
                />
                <Text
                  style={{
                    color: activeTab === "single" ? c.onSurface : c.onSurfaceSecondary,
                    fontFamily: fonts.medium,
                    fontSize: fontSize.base,
                  }}
                >
                  Save Link
                </Text>
              </Pressable>

              <Pressable
                testID="tab-add-import"
                onPress={() => {
                  setActiveTab("import");
                  setImportError("");
                }}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 8,
                  borderRadius: radius.sm,
                  backgroundColor: activeTab === "import" ? c.surface : "transparent",
                }}
              >
                <BookmarkSimple
                  size={16}
                  color={activeTab === "import" ? c.onSurface : c.onSurfaceSecondary}
                />
                <Text
                  style={{
                    color: activeTab === "import" ? c.onSurface : c.onSurfaceSecondary,
                    fontFamily: fonts.medium,
                    fontSize: fontSize.base,
                  }}
                >
                  Import Saves
                </Text>
              </Pressable>
            </View>

            {activeTab === "single" ? (
              /* ================= TAB 1: SINGLE LINK ================= */
              <>
                {stage === "input" || stage === "loading" || stage === "error" ? (
                  <>
                    {/* Clipboard quick chip */}
                    {clipUrl && !url ? (
                      <Pressable
                        testID="add-clipboard-chip"
                        onPress={() => {
                          setUrl(clipUrl);
                          onSave(clipUrl);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          backgroundColor: c.brandTertiary,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: radius.md,
                          marginBottom: spacing.md,
                        }}
                      >
                        <ClipboardText size={18} color={c.onBrandTertiary} />
                        <Text
                          numberOfLines={1}
                          style={{
                            flex: 1,
                            color: c.onBrandTertiary,
                            fontFamily: fonts.medium,
                            fontSize: fontSize.base,
                          }}
                        >
                          Paste copied link: {clipUrl}
                        </Text>
                      </Pressable>
                    ) : null}

                    {/* URL Input */}
                    <View
                      style={{
                        backgroundColor: c.surfaceSecondary,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: errorMsg ? c.error : c.border,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                      }}
                    >
                      <TextInput
                        testID="add-url-input"
                        value={url}
                        onChangeText={(t) => {
                          setUrl(t);
                          setErrorMsg("");
                        }}
                        placeholder="https://instagram.com/p/... or youtube.com"
                        placeholderTextColor={c.onSurfaceSecondary}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                        returnKeyType="go"
                        onSubmitEditing={() => onSave(url)}
                        style={{
                          color: c.onSurface,
                          fontFamily: fonts.regular,
                          fontSize: fontSize.base,
                          padding: 0,
                        }}
                      />
                    </View>

                    {errorMsg ? (
                      <Text
                        style={{
                          color: c.error,
                          fontFamily: fonts.regular,
                          fontSize: fontSize.sm,
                          marginTop: 6,
                        }}
                      >
                        {errorMsg}
                      </Text>
                    ) : null}

                    {stage === "loading" ? (
                      <View
                        style={{
                          alignItems: "center",
                          paddingVertical: spacing.xl,
                          gap: 12,
                        }}
                      >
                        <ActivityIndicator color={c.brand} />
                        <Text
                          style={{
                            color: c.onSurfaceSecondary,
                            fontFamily: fonts.regular,
                            fontSize: fontSize.base,
                          }}
                        >
                          AI is reading & organizing…
                        </Text>
                      </View>
                    ) : (
                      <Button
                        testID="add-save-button"
                        label="Save to Vault"
                        onPress={() => onSave(url)}
                        style={{ marginTop: spacing.xl }}
                      />
                    )}
                  </>
                ) : null}

                {(stage === "result" || stage === "duplicate") && result ? (
                  <View style={{ gap: spacing.lg }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <CheckCircle size={22} color={c.brand} weight="fill" />
                      <Text
                        style={{
                          color: c.onSurface,
                          fontFamily: fonts.medium,
                          fontSize: fontSize.lg,
                        }}
                      >
                        {stage === "duplicate" ? "Already in your vault" : "Saved & organized"}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: spacing.md,
                        backgroundColor: c.surfaceSecondary,
                        borderRadius: radius.md,
                        padding: spacing.md,
                      }}
                    >
                      {result.thumbnail_url ? (
                        <Image
                          source={{ uri: result.thumbnail_url }}
                          style={{ width: 64, height: 64, borderRadius: radius.sm }}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: radius.sm,
                            backgroundColor: c.brandTertiary,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PlatformBadge platform={result.platform} size={22} />
                        </View>
                      )}
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text
                          numberOfLines={2}
                          style={{
                            color: c.onSurface,
                            fontFamily: fonts.medium,
                            fontSize: fontSize.base,
                          }}
                        >
                          {result.title}
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={{
                            color: c.onSurfaceSecondary,
                            fontFamily: fonts.regular,
                            fontSize: fontSize.sm,
                          }}
                        >
                          {result.summary}
                        </Text>
                      </View>
                    </View>

                    <Button testID="add-view-item" label="View item" onPress={openResult} />
                    <Button
                      testID="add-save-another"
                      label="Save another"
                      variant="ghost"
                      onPress={reset}
                    />
                  </View>
                ) : null}
              </>
            ) : (
              /* ================= TAB 2: UNIVERSAL SOCIAL & BOOKMARK IMPORT ================= */
              <View style={{ gap: spacing.lg }}>
                {importStats ? (
                  /* Import Result Success Screen */
                  <View style={{ gap: spacing.lg }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <CheckCircle size={30} color={c.brand} weight="fill" />
                      <View>
                        <Text
                          style={{
                            color: c.onSurface,
                            fontFamily: fonts.medium,
                            fontSize: fontSize.xl,
                          }}
                        >
                          {importStats.platform_display} Import Complete!
                        </Text>
                        <Text
                          style={{
                            color: c.onSurfaceSecondary,
                            fontFamily: fonts.regular,
                            fontSize: fontSize.sm,
                          }}
                        >
                          All saves are now searchable in your vault
                        </Text>
                      </View>
                    </View>

                    {/* Stats Grid */}
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 10,
                        backgroundColor: c.surfaceSecondary,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        borderWidth: 1,
                        borderColor: c.border,
                      }}
                    >
                      <View style={{ flex: 1, minWidth: "40%", gap: 2 }}>
                        <Text
                          style={{
                            color: c.onSurfaceSecondary,
                            fontFamily: fonts.regular,
                            fontSize: fontSize.sm,
                          }}
                        >
                          Total Saves Found
                        </Text>
                        <Text
                          style={{
                            color: c.onSurface,
                            fontFamily: fonts.medium,
                            fontSize: fontSize.xl,
                          }}
                        >
                          {importStats.total_found}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: "40%", gap: 2 }}>
                        <Text
                          style={{
                            color: c.brand,
                            fontFamily: fonts.regular,
                            fontSize: fontSize.sm,
                          }}
                        >
                          Added to Vault
                        </Text>
                        <Text
                          style={{
                            color: c.brand,
                            fontFamily: fonts.medium,
                            fontSize: fontSize.xl,
                          }}
                        >
                          {importStats.imported}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: "40%", gap: 2 }}>
                        <Text
                          style={{
                            color: c.onSurfaceSecondary,
                            fontFamily: fonts.regular,
                            fontSize: fontSize.sm,
                          }}
                        >
                          Duplicates Skipped
                        </Text>
                        <Text
                          style={{
                            color: c.onSurface,
                            fontFamily: fonts.medium,
                            fontSize: fontSize.xl,
                          }}
                        >
                          {importStats.skipped_duplicate}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: "40%", gap: 2 }}>
                        <Text
                          style={{
                            color: c.brand,
                            fontFamily: fonts.regular,
                            fontSize: fontSize.sm,
                          }}
                        >
                          AI Enrichment Queued
                        </Text>
                        <Text
                          style={{
                            color: c.brand,
                            fontFamily: fonts.medium,
                            fontSize: fontSize.xl,
                          }}
                        >
                          {importStats.ai_enrichment_queued}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        color: c.onSurfaceSecondary,
                        fontFamily: fonts.regular,
                        fontSize: fontSize.sm,
                        lineHeight: 20,
                      }}
                    >
                      All imported items are saved immediately and searchable by title and URL. AI enrichment is throttled safely to protect API quotas.
                    </Text>

                    <Button
                      testID="import-done-btn"
                      label="View Vault"
                      onPress={() => {
                        closeAddSheet();
                        triggerRefresh();
                      }}
                    />
                    <Button
                      testID="import-another-btn"
                      label="Import another file"
                      variant="ghost"
                      onPress={reset}
                    />
                  </View>
                ) : (
                  /* Import Input Screen */
                  <>
                    {/* Platform Selector Chips */}
                    <View style={{ gap: 8 }}>
                      <Text
                        style={{
                          color: c.onSurface,
                          fontFamily: fonts.medium,
                          fontSize: fontSize.base,
                        }}
                      >
                        Select platform for export instructions:
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
                      >
                        {PLATFORM_GUIDES.map((p) => {
                          const IconComp = p.icon;
                          const active = selectedGuide === p.id;
                          return (
                            <Pressable
                              key={p.id}
                              onPress={() => {
                                Haptics.selectionAsync();
                                setSelectedGuide(active ? null : p.id);
                              }}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: radius.pill,
                                backgroundColor: active ? c.brand : c.surfaceSecondary,
                                borderWidth: 1,
                                borderColor: active ? c.brand : c.border,
                              }}
                            >
                              <IconComp
                                size={16}
                                color={active ? c.onBrand : c.onSurfaceSecondary}
                              />
                              <Text
                                style={{
                                  color: active ? c.onBrand : c.onSurface,
                                  fontFamily: fonts.medium,
                                  fontSize: fontSize.sm,
                                }}
                              >
                                {p.name}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>

                    {/* Collapsible Step Guide for Selected Platform */}
                    {selectedGuide ? (
                      <View
                        style={{
                          padding: spacing.md,
                          backgroundColor: c.brandTertiary,
                          borderRadius: radius.md,
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: c.onBrandTertiary,
                            fontFamily: fonts.medium,
                            fontSize: fontSize.sm,
                          }}
                        >
                          How to export from {PLATFORM_GUIDES.find((g) => g.id === selectedGuide)?.name}:
                        </Text>
                        <Text
                          style={{
                            color: c.onBrandTertiary,
                            fontFamily: fonts.regular,
                            fontSize: fontSize.sm,
                            lineHeight: 18,
                          }}
                        >
                          {PLATFORM_GUIDES.find((g) => g.id === selectedGuide)?.tip}
                        </Text>
                      </View>
                    ) : null}

                    {/* Universal File Picker Card */}
                    <Pressable
                      testID="import-pick-file-btn"
                      onPress={pickArchiveFile}
                      style={{
                        borderWidth: 1.5,
                        borderColor: selectedFileName ? c.brand : c.border,
                        borderStyle: "dashed",
                        borderRadius: radius.md,
                        backgroundColor: selectedFileName
                          ? c.brandTertiary
                          : c.surfaceSecondary,
                        paddingVertical: spacing.xl,
                        paddingHorizontal: spacing.md,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {selectedFileName?.endsWith(".zip") ? (
                        <FileArchive
                          size={28}
                          color={selectedFileName ? c.onBrandTertiary : c.brand}
                        />
                      ) : (
                        <UploadSimple
                          size={28}
                          color={selectedFileName ? c.onBrandTertiary : c.brand}
                        />
                      )}
                      <Text
                        style={{
                          color: selectedFileName ? c.onBrandTertiary : c.onSurface,
                          fontFamily: fonts.medium,
                          fontSize: fontSize.base,
                          textAlign: "center",
                        }}
                      >
                        {selectedFileName
                          ? `Selected: ${selectedFileName}`
                          : "Choose Export Archive or File"}
                      </Text>
                      <Text
                        style={{
                          color: c.onSurfaceSecondary,
                          fontFamily: fonts.regular,
                          fontSize: fontSize.sm,
                          textAlign: "center",
                        }}
                      >
                        Supports .zip, .json, .csv, .html from Instagram, TikTok, YouTube, Reddit, X, Browser
                      </Text>
                    </Pressable>

                    {/* Clipboard Detected Chip */}
                    {clipDetectedText && !rawTextPayload && !filePayloadBlob ? (
                      <Pressable
                        testID="import-clipboard-chip"
                        onPress={() => {
                          setRawTextPayload(clipDetectedText);
                          setSelectedFileName("Clipboard Data");
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          backgroundColor: c.brandTertiary,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: radius.md,
                        }}
                      >
                        <ClipboardText size={18} color={c.onBrandTertiary} />
                        <Text
                          numberOfLines={1}
                          style={{
                            flex: 1,
                            color: c.onBrandTertiary,
                            fontFamily: fonts.medium,
                            fontSize: fontSize.base,
                          }}
                        >
                          Paste export code from clipboard?
                        </Text>
                      </Pressable>
                    ) : null}

                    {/* Or Paste Raw JSON / CSV / HTML */}
                    <View style={{ gap: 6 }}>
                      <Text
                        style={{
                          color: c.onSurfaceSecondary,
                          fontFamily: fonts.medium,
                          fontSize: fontSize.sm,
                        }}
                      >
                        Or paste raw export code (JSON, CSV, or HTML):
                      </Text>
                      <TextInput
                        testID="import-html-input"
                        value={rawTextPayload}
                        onChangeText={(val) => {
                          setRawTextPayload(val);
                          setFilePayloadBlob(null);
                          if (!selectedFileName && val.length > 0) {
                            setSelectedFileName("Pasted Data");
                          }
                        }}
                        placeholder='{"saved_saved_media": [...]} or HTML...'
                        placeholderTextColor={c.onSurfaceSecondary}
                        multiline
                        numberOfLines={4}
                        style={{
                          minHeight: 80,
                          maxHeight: 140,
                          backgroundColor: c.surfaceSecondary,
                          borderRadius: radius.md,
                          borderWidth: 1,
                          borderColor: c.border,
                          padding: 12,
                          color: c.onSurface,
                          fontFamily: fonts.regular,
                          fontSize: fontSize.sm,
                          textAlignVertical: "top",
                        }}
                      />
                    </View>

                    {importError ? (
                      <Text
                        style={{
                          color: c.error,
                          fontFamily: fonts.regular,
                          fontSize: fontSize.sm,
                        }}
                      >
                        {importError}
                      </Text>
                    ) : null}

                    {isImporting ? (
                      <View
                        style={{
                          alignItems: "center",
                          paddingVertical: spacing.lg,
                          gap: 12,
                        }}
                      >
                        <ActivityIndicator color={c.brand} />
                        <Text
                          style={{
                            color: c.onSurfaceSecondary,
                            fontFamily: fonts.regular,
                            fontSize: fontSize.base,
                          }}
                        >
                          Auto-detecting platform & importing saves…
                        </Text>
                      </View>
                    ) : (
                      <Button
                        testID="import-submit-btn"
                        label={
                          selectedFileName
                            ? `Import ${selectedFileName}`
                            : "Import Saves"
                        }
                        onPress={onImport}
                        disabled={!filePayloadBlob && !rawTextPayload.trim()}
                      />
                    )}
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
