import { LegalPage } from "@/components/LegalPage";

const SECTIONS = [
  { h: "Privacy Policy", b: "PostRecaller stores the links and notes you choose to save, along with your email address for authentication. We use AI services to generate summaries and tags for your saved content." },
  { h: "What we collect", b: "Your email, a securely hashed password, and the items (URLs, notes, AI-generated titles/summaries/tags) you save. We never sell your data." },
  { h: "AI processing", b: "When you save a link, its public metadata is sent to our AI provider to generate a summary and tags. We log token usage to monitor service costs." },
  { h: "Your control", b: "You can edit or delete any item at any time. Deleting your account removes your profile and all saved items from active service; data is retained in cold backups only as long as required by law." },
  { h: "Contact", b: "For any privacy questions, reach us at support@postrecaller.com." },
];

export default function Privacy() {
  return <LegalPage title="Privacy Policy" sections={SECTIONS} testIdPrefix="privacy" />;
}
