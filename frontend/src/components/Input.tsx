import React, { useState } from "react";
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  containerStyle,
  testID,
  ...props
}: TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const { c, radius, fonts, fontSize, spacing } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: spacing.xs + 2 }}>
      {label ? (
        <Text style={{ color: c.onSurface, fontFamily: fonts.medium, fontSize: fontSize.base - 1 }}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: c.surfaceSecondary,
            borderColor: error ? c.error : focused ? c.brand : c.border,
            borderRadius: radius.md,
          },
          containerStyle,
        ]}
      >
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <TextInput
          testID={testID}
          placeholderTextColor={c.onSurfaceSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            {
              color: c.onSurface,
              fontFamily: fonts.regular,
              fontSize: fontSize.base + 1,
            },
          ]}
          {...props}
        />
        {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
      </View>
      {error ? (
        <Text style={{ color: c.error, fontFamily: fonts.regular, fontSize: fontSize.sm }}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    minHeight: 50,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  iconLeft: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRight: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 12,
  },
});
