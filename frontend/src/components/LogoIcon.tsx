import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

interface LogoIconProps {
  size?: number;
}

// Option B1: Bookmark Notch 'P' + AI Sparkle logo for React Native / Expo
export function LogoIcon({ size = 36 }: LogoIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Background squircle tile */}
      <Rect width="48" height="48" rx="13" fill="#4A5D4E" />

      {/* 'P' with Bookmark V-notch at bottom of stem */}
      <Path
        d="M16 11C16 9.89543 16.8954 9 18 9H27C31.9706 9 36 13.0294 36 18C36 22.9706 31.9706 28 27 28H22V37L19 34L16 37V11Z"
        fill="#FBFBF9"
      />
      {/* Inner cutout */}
      <Path
        d="M22 14H26.5C28.7091 14 30.5 15.7909 30.5 18C30.5 20.2091 28.7091 22 26.5 22H22V14Z"
        fill="#4A5D4E"
      />
      {/* AI Sparkle star */}
      <Path
        d="M32 8C32 10.2091 30.2091 12 28 12C30.2091 12 32 13.7909 32 16C32 13.7909 33.7909 12 36 12C33.7909 12 32 10.2091 32 8Z"
        fill="#C26E5D"
      />
    </Svg>
  );
}
