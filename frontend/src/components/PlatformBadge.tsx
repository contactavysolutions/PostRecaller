import {
  Globe,
  IconProps,
  InstagramLogo,
  LinkedinLogo,
  PinterestLogo,
  RedditLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
} from "phosphor-react-native";
import React from "react";
import { View } from "react-native";

import { PLATFORM_COLORS } from "@/src/theme/tokens";

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  youtube: YoutubeLogo,
  instagram: InstagramLogo,
  tiktok: TiktokLogo,
  x: XLogo,
  reddit: RedditLogo,
  linkedin: LinkedinLogo,
  pinterest: PinterestLogo,
  web: Globe,
};

export function PlatformBadge({ platform, size = 22 }: { platform: string; size?: number }) {
  const Icon = ICONS[platform] || Globe;
  const color = PLATFORM_COLORS[platform] || PLATFORM_COLORS.web;
  const pad = Math.round(size * 0.35);

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        padding: pad / 2,
        width: size + pad,
        height: size + pad,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <Icon size={size} color={color} weight="fill" />
    </View>
  );
}
