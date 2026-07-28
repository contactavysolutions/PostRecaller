import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

export function Input({
  label,
  error,
  style,
  testID,
  ...props
}: TextInputProps & { label?: string; error?: string; testID?: string }) {
  const { c, radius, fonts, fontSize, spacing } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: spacing.sm }}>
      {label ? (
        <Text style={{ color: c.onSurfaceSecondary, fontFamily: fonts.medium, fontSize: fontSize.base }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        testID={testID}
        placeholderTextColor={c.onSurfaceSecondary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: c.surfaceSecondary,
            borderColor: error ? c.error : focused ? c.brand : c.border,
            borderRadius: radius.md,
            color: c.onSurface,
            fontFamily: fonts.regular,
            fontSize: fontSize.lg,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={{ color: c.error, fontFamily: fonts.regular, fontSize: fontSize.sm }}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
});
