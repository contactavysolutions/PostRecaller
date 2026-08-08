import { LegalPage } from "@/components/LegalPage";

const SECTIONS = [
  { h: "Acceptance of Terms", b: "By using PostRecaller you agree to these terms. PostRecaller is provided as-is to help you save and organize online content." },
  { h: "Your content", b: "You are responsible for the links and notes you save. Do not use PostRecaller to store or distribute unlawful content." },
  { h: "Free & Pro plans", b: "The free plan includes unlimited saves and 5 AI enrichments per day. PostRecaller Pro unlocks unlimited AI enrichments. You can cancel anytime." },
  { h: "Acceptable use", b: "Automated abuse, scraping of the service, or exceeding fair-use limits (200 saves/day) may result in rate limiting." },
  { h: "Termination", b: "You may delete your account at any time from the Profile screen, which removes your profile and saved items from active service." },
  { h: "Contact", b: "Questions about these terms? Email support@postrecaller.com." },
];

export default function Terms() {
  return <LegalPage title="Terms of Service" sections={SECTIONS} testIdPrefix="terms" />;
}
