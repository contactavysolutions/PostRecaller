import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  ArrowSquareOut,
  Check,
  PencilSimple,
  ShareNetwork,
  Sparkle,
  Trash,
  X,
} from "phosphor-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/Button";
import { PlatformBadge } from "@/src/components/PlatformBadge";
import { api, Item } from "@/src/lib/api";
import { useVault } from "@/src/store/vault";
import { useTheme } from "@/src/theme/ThemeContext";

const INTENTS = ["Read Later", "Try Recipe", "Watch", "Shop", "Learn"];

export default function ItemDetail() {
  const { c, mode, fonts, fontSize, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const triggerRefresh = useVault((s) => s.triggerRefresh);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);

  // editable fields
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [intent, setIntent] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const it = await api.getItem(id);
      setItem(it);
      setTitle(it.title);
      setSummary(it.summary);
      setContent(it.content);
      setTags(it.tags);
      setIntent(it.intent);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.updateItem(id, { title, summary, content, tags, intent });
      setItem(updated);
      setEditing(false);
      triggerRefresh();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setSaving(false);
    }
  };

  const onRetryEnrich = async () => {
    setEnriching(true);
    try {
      const updated = await api.retryEnrich(id);
      setItem(updated);
      setTitle(updated.title);
      setSummary(updated.summary);
      setTags(updated.tags);
      setIntent(updated.intent);
      triggerRefresh();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setEnriching(false);
    }
  };

  const onDelete = async () => {
    await api.deleteItem(id);
    triggerRefresh();
    router.back();
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const onShare = async () => {
    if (!item?.original_url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({ message: `${item.title}\n${item.original_url}` });
  };

  const openLink = () => {
    if (item?.original_url) Linking.openURL(item.original_url);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={c.brand} />
      </View>
    );
  }
  if (error || !item) {
    return (
      <View style={{ flex: 1, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.lg }}>Couldn’t load item</Text>
        <Text onPress={load} style={{ color: c.brand, fontFamily: fonts.medium }}>Retry</Text>
      </View>
    );
  }

  const heroH = 300;
  const needsEnrich = item.enrichment_status === "pending" || item.enrichment_status === "failed" || item.enrichment_status === "manual";

  const CircleBtn = ({ children, onPress, testID }: any) => (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}
    >
      {children}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.surface }}>
      <StatusBar style="light" />
      <KeyboardAwareScrollView bottomOffset={100} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ height: heroH }}>
          {item.thumbnail_url ? (
            <Image source={{ uri: item.thumbnail_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          ) : (
            <View style={{ flex: 1, backgroundColor: c.brand }} />
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]}
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: heroH * 0.7 }}
          />
          <View style={{ position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg, gap: spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <PlatformBadge platform={item.platform} size={18} />
              {item.author ? (
                <Text style={{ color: "rgba(255,255,255,0.9)", fontFamily: fonts.regular, fontSize: fontSize.sm }}>{item.author}</Text>
              ) : null}
            </View>
            {!editing ? (
              <Text style={{ color: "#fff", fontFamily: fonts.medium, fontSize: fontSize["2xl"], lineHeight: 30 }}>{item.title}</Text>
            ) : null}
          </View>
        </View>

        {/* Body */}
        <View style={{ padding: spacing.lg, gap: spacing.xl }}>
          {editing ? (
            <View style={{ gap: spacing.sm }}>
              <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.base }}>Title</Text>
              <TextInput
                testID="edit-title"
                value={title}
                onChangeText={setTitle}
                style={{ backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: 14, color: c.onSurface, fontFamily: fonts.regular, fontSize: fontSize.lg, borderWidth: 1, borderColor: c.border }}
              />
            </View>
          ) : null}

          {needsEnrich ? (
            <Button
              testID="retry-enrich"
              label={enriching ? "Enriching…" : "Enrich with AI"}
              variant="secondary"
              loading={enriching}
              onPress={onRetryEnrich}
            />
          ) : null}

          {/* Summary */}
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Sparkle size={16} color={c.brand} weight="fill" />
              <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.base }}>AI Summary</Text>
            </View>
            {editing ? (
              <TextInput
                testID="edit-summary"
                value={summary}
                onChangeText={setSummary}
                multiline
                style={{ backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.lg, color: c.onSurface, fontFamily: fonts.regular, fontSize: fontSize.base, minHeight: 90, borderWidth: 1, borderColor: c.border, textAlignVertical: "top" }}
              />
            ) : (
              <View style={{ backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.lg }}>
                <Text style={{ color: c.onSurface, fontFamily: fonts.regular, fontSize: fontSize.base, lineHeight: 21 }}>
                  {item.summary || "No summary yet."}
                </Text>
              </View>
            )}
          </View>

          {/* Intent */}
          {editing ? (
            <View style={{ gap: spacing.sm }}>
              <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.base }}>Collection</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                {INTENTS.map((it) => (
                  <Pressable
                    key={it}
                    testID={`intent-${it}`}
                    onPress={() => setIntent(it)}
                    style={{ backgroundColor: intent === it ? c.brand : c.brandTertiary, borderRadius: radius.pill, paddingHorizontal: 14, height: 36, justifyContent: "center" }}
                  >
                    <Text style={{ color: intent === it ? c.onBrand : c.onBrandTertiary, fontFamily: fonts.medium, fontSize: fontSize.sm }}>{it}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : item.intent ? (
            <View style={{ flexDirection: "row" }}>
              <View style={{ backgroundColor: c.brandTertiary, borderRadius: radius.pill, paddingHorizontal: 14, height: 34, justifyContent: "center" }}>
                <Text style={{ color: c.onBrandTertiary, fontFamily: fonts.medium, fontSize: fontSize.sm }}>{item.intent}</Text>
              </View>
            </View>
          ) : null}

          {/* Tags */}
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.base }}>Tags</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {(editing ? tags : item.tags).map((t) => (
                <Pressable
                  key={t}
                  disabled={!editing}
                  onPress={() => editing && setTags(tags.filter((x) => x !== t))}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.brandTertiary, borderRadius: radius.pill, paddingHorizontal: 12, height: 34 }}
                >
                  <Text style={{ color: c.onBrandTertiary, fontFamily: fonts.medium, fontSize: fontSize.sm }}>{t}</Text>
                  {editing ? <X size={13} color={c.onBrandTertiary} /> : null}
                </Pressable>
              ))}
              {!editing && item.tags.length === 0 ? (
                <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base }}>No tags</Text>
              ) : null}
            </View>
            {editing ? (
              <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
                <TextInput
                  testID="tag-input"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  placeholder="Add a tag"
                  placeholderTextColor={c.onSurfaceSecondary}
                  autoCapitalize="none"
                  style={{ flex: 1, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, paddingHorizontal: 14, height: 44, color: c.onSurface, fontFamily: fonts.regular, fontSize: fontSize.base, borderWidth: 1, borderColor: c.border }}
                />
                <Pressable testID="add-tag" onPress={addTag} style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: c.brand, alignItems: "center", justifyContent: "center" }}>
                  <Check size={20} color={c.onBrand} />
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* Notes */}
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.base }}>Notes</Text>
            {editing ? (
              <TextInput
                testID="edit-notes"
                value={content}
                onChangeText={setContent}
                multiline
                placeholder="Add your own notes…"
                placeholderTextColor={c.onSurfaceSecondary}
                style={{ backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.lg, color: c.onSurface, fontFamily: fonts.regular, fontSize: fontSize.base, minHeight: 90, borderWidth: 1, borderColor: c.border, textAlignVertical: "top" }}
              />
            ) : (
              <Text style={{ color: item.content ? c.onSurface : c.onSurfaceSecondary, fontFamily: fonts.regular, fontSize: fontSize.base, lineHeight: 21 }}>
                {item.content || "No notes."}
              </Text>
            )}
          </View>

          {editing ? (
            <Pressable testID="detail-delete" onPress={onDelete} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: spacing.md }}>
              <Trash size={18} color={c.error} />
              <Text style={{ color: c.error, fontFamily: fonts.medium, fontSize: fontSize.base }}>Delete this item</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      {/* Floating top controls */}
      <View style={{ position: "absolute", top: insets.top + 8, left: spacing.lg, right: spacing.lg, flexDirection: "row", justifyContent: "space-between" }}>
        <CircleBtn testID="detail-back" onPress={() => router.back()}>
          <ArrowLeft size={22} color="#fff" />
        </CircleBtn>
        {editing ? (
          <CircleBtn testID="detail-cancel-edit" onPress={() => { setEditing(false); load(); }}>
            <X size={22} color="#fff" />
          </CircleBtn>
        ) : (
          <CircleBtn testID="detail-edit" onPress={() => setEditing(true)}>
            <PencilSimple size={20} color="#fff" />
          </CircleBtn>
        )}
      </View>

      {/* Sticky bottom actions */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: insets.bottom + spacing.md, backgroundColor: c.surface, borderTopWidth: 0.5, borderTopColor: c.border, flexDirection: "row", gap: spacing.md }}>
        {editing ? (
          <Button testID="detail-save" label="Save changes" onPress={save} loading={saving} style={{ flex: 1 }} />
        ) : (
          <>
            {item.original_url ? (
              <Pressable testID="detail-share" onPress={onShare} style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: c.surfaceTertiary, alignItems: "center", justifyContent: "center" }}>
                <ShareNetwork size={22} color={c.onSurface} />
              </Pressable>
            ) : null}
            <Button testID="detail-open" label="Open Link" onPress={openLink} style={{ flex: 1 }} />
          </>
        )}
      </View>
    </View>
  );
}
