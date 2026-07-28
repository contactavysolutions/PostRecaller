// Glean design tokens — honoring the provided "iOS-Native Clean" system.
export type Mode = "light" | "dark";

const raw = {
  surface: { light: "#FBFBF9", dark: "#161615" },
  onSurface: { light: "#1C1C1A", dark: "#FBFBF9" },
  surfaceSecondary: { light: "#F3F3F0", dark: "#232322" },
  onSurfaceSecondary: { light: "#4E4E4A", dark: "#D4D4D2" },
  surfaceTertiary: { light: "#EBEBE6", dark: "#2C2C2A" },
  onSurfaceTertiary: { light: "#1C1C1A", dark: "#FBFBF9" },
  surfaceInverse: { light: "#161615", dark: "#FBFBF9" },
  onSurfaceInverse: { light: "#FBFBF9", dark: "#161615" },
  brand: { light: "#4A5D4E", dark: "#8FA693" },
  onBrand: { light: "#FBFBF9", dark: "#161615" },
  brandSecondary: { light: "#C26E5D", dark: "#D89083" },
  onBrandSecondary: { light: "#FBFBF9", dark: "#161615" },
  brandTertiary: { light: "#E4E7E1", dark: "#354238" },
  onBrandTertiary: { light: "#4A5D4E", dark: "#8FA693" },
  warning: { light: "#D99B41", dark: "#D99B41" },
  error: { light: "#B34A4A", dark: "#B34A4A" },
  border: { light: "#EBEBE6", dark: "#2C2C2A" },
  borderStrong: { light: "#D1D1CB", dark: "#40403D" },
  divider: { light: "#F3F3F0", dark: "#232322" },
} as const;

export type ColorName = keyof typeof raw;

export function resolveColors(mode: Mode) {
  const out = {} as Record<ColorName, string>;
  (Object.keys(raw) as ColorName[]).forEach((k) => {
    out[k] = raw[k][mode];
  });
  return out;
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 };
export const radius = { sm: 6, md: 12, lg: 20, pill: 999 };
export const fontSize = { sm: 12, base: 14, lg: 16, xl: 20, "2xl": 24 };

// Weight cap is strictly 500 — hierarchy via size, not heavy weights.
export const fonts = {
  regular: "Satoshi-Regular",
  medium: "Satoshi-Medium",
};

export const shadow = {
  tier1: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000",
  instagram: "#E1306C",
  tiktok: "#010101",
  x: "#000000",
  reddit: "#FF4500",
  linkedin: "#0A66C2",
  pinterest: "#E60023",
  vimeo: "#1AB7EA",
  soundcloud: "#FF5500",
  threads: "#000000",
  facebook: "#1877F2",
  web: "#4A5D4E",
};
