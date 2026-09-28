/**
 * URL Cleaner & Platform Detector for Mobile.
 * Cleans marketing & tracking parameters (?igsh=, ?si=, ?utm_*, ?s=, etc.)
 * and extracts URLs embedded in shared strings from Instagram, TikTok, YouTube, Reddit, X.
 */

const TRACKING_PARAMS = new Set([
  "igsh", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "si", "feature", "fbclid", "gclid", "msclkid", "ref", "ref_src", "s", "t",
  "is_from_webapp", "sender_device", "share_app_id", "source", "share_id",
]);

export function extractAndCleanUrl(text: string): string | null {
  if (!text || typeof text !== "string") return null;

  // Regex to extract http/https URL from anywhere in shared text
  const match = text.match(/https?:\/\/[^\s<>"]+/i);
  if (!match) return null;

  let urlStr = match[0].trim();

  try {
    const url = new URL(urlStr);
    const searchParams = new URLSearchParams(url.search);

    const keysToDelete: string[] = [];
    searchParams.forEach((_, key) => {
      const lower = key.toLowerCase();
      if (TRACKING_PARAMS.has(lower) || lower.startsWith("utm_")) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((k) => searchParams.delete(k));

    url.search = searchParams.toString();
    url.hash = ""; // strip tracking hashes

    let cleaned = url.toString();
    // Normalize trailing slash if not root
    if (url.pathname !== "/" && cleaned.endsWith("/")) {
      cleaned = cleaned.slice(0, -1);
    }
    return cleaned;
  } catch {
    return urlStr;
  }
}

export function detectSocialPlatform(url: string): {
  platform: string;
  name: string;
  iconName: string;
  color: string;
} {
  const u = url.toLowerCase();
  if (u.includes("instagram.com") || u.includes("instagr.am")) {
    return { platform: "instagram", name: "Instagram", iconName: "InstagramLogo", color: "#E1306C" };
  }
  if (u.includes("tiktok.com")) {
    return { platform: "tiktok", name: "TikTok", iconName: "TiktokLogo", color: "#00F2FE" };
  }
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    return { platform: "youtube", name: "YouTube", iconName: "YoutubeLogo", color: "#FF0000" };
  }
  if (u.includes("reddit.com") || u.includes("redd.it")) {
    return { platform: "reddit", name: "Reddit", iconName: "RedditLogo", color: "#FF4500" };
  }
  if (u.includes("twitter.com") || u.includes("x.com")) {
    return { platform: "x", name: "Twitter / X", iconName: "TwitterLogo", color: "#1DA1F2" };
  }
  if (u.includes("pinterest.com") || u.includes("pin.it")) {
    return { platform: "pinterest", name: "Pinterest", iconName: "PinterestLogo", color: "#BD081C" };
  }
  if (u.includes("linkedin.com")) {
    return { platform: "linkedin", name: "LinkedIn", iconName: "LinkedinLogo", color: "#0A66C2" };
  }
  if (u.includes("github.com")) {
    return { platform: "github", name: "GitHub", iconName: "GithubLogo", color: "#FFFFFF" };
  }
  return { platform: "web", name: "Web Link", iconName: "Globe", color: "#4F8FFF" };
}
