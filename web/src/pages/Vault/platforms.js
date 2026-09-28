// Platform label + tint for badges — matches design guidelines colour intent.
export const PLATFORM_META = {
  facebook: { label: "Facebook", tint: "bg-[#1877F2]/90 text-white" },
  pinterest: { label: "Pinterest", tint: "bg-[#E60023]/90 text-white" },
  instagram: { label: "Instagram", tint: "bg-brand-secondary/85 text-on-brand-secondary" },
  tiktok: { label: "TikTok", tint: "bg-on-surface/85 text-surface" },
  youtube: { label: "YouTube", tint: "bg-ds-error/85 text-white" },
  x: { label: "X", tint: "bg-on-surface/85 text-surface" },
  twitter: { label: "X", tint: "bg-on-surface/85 text-surface" },
  reddit: { label: "Reddit", tint: "bg-brand-secondary/85 text-on-brand-secondary" },
  linkedin: { label: "LinkedIn", tint: "bg-[#0A66C2]/90 text-white" },
  substack: { label: "Substack", tint: "bg-brand-secondary/85 text-on-brand-secondary" },
  article: { label: "Article", tint: "bg-brand/85 text-on-brand" },
  web: { label: "Web", tint: "bg-brand/85 text-on-brand" },
  threads: { label: "Threads", tint: "bg-on-surface/85 text-surface" },
};

export function platformOf(item) {
  return item?.platform || "web";
}
