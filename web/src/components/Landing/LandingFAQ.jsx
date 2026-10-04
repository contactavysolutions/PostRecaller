import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretDown,
  Question,
  ArrowRight,
  Sparkle,
  UploadSimple,
  ShareNetwork,
  ShieldCheck,
  Globe,
} from "@phosphor-icons/react";

const FAQ_ITEMS = [
  {
    id: "import-social",
    icon: UploadSimple,
    question: "How do I import my existing saves from Instagram, TikTok, or X?",
    answer:
      "You can export your saved posts directly from each app’s official data settings. In Instagram, go to Profile > Menu (☰) > Accounts Center > Your information and permissions > Export your information, select 'Saved posts', and choose JSON format. (You can also go to accountscenter.instagram.com on web). In TikTok, go to Settings & privacy > Account > Download your data. Once you have the file, simply drop it into PostRecaller’s importer. Our parser automatically cleans tracking junk, generates AI summaries, and indexes your entire backlog in seconds.",
    guideLink: "/faq#export-instagram",
    guideLabel: "View Instagram & TikTok Export Guide",
  },
  {
    id: "import-browser",
    icon: Globe,
    question: "How do I import my bookmarks from Chrome, Safari, or Firefox?",
    answer:
      "In Google Chrome, Edge, or Brave, press Ctrl+Shift+O (Cmd+Option+B on Mac), click the three dots (⋮) in the top-right corner, and select 'Export bookmarks'. In Safari, click File > Export > Bookmarks. This saves a clean .html file. Drop this file into PostRecaller, and all your browser links will be instantly cataloged with smart tags and searchable notes.",
    guideLink: "/faq#export-browsers",
    guideLabel: "View Browser Bookmarks Guide",
  },
  {
    id: "save-mobile",
    icon: ShareNetwork,
    question: "How do I save a post from Instagram, Facebook, or Reddit on my phone?",
    answer:
      "Whenever you see a post, Reel, or video you love, tap the Share icon (the paper airplane on Instagram, Share on Facebook/Reddit, or the arrow on TikTok). In your phone's share tray, tap 'PostRecaller'. Our app silently captures the link, cleans tracking parameters, extracts key takeaways in the background, and saves it to your private vault.",
    guideLink: "/faq#save-from-apps",
    guideLabel: "View Mobile Sharing Guide",
  },
  {
    id: "deleted-posts",
    icon: ShieldCheck,
    question: "What happens if a creator deletes a post or makes their account private?",
    answer:
      "Traditional bookmarks break when a creator deletes a video, removes an article, or sets their profile to private ('link rot'). PostRecaller extracts the executive summary, audio/video transcript, and key metadata the moment you save it. Even if the original post disappears from the internet, your knowledge vault preserves the takeaways forever.",
    guideLink: null,
  },
  {
    id: "beta-free",
    icon: Sparkle,
    question: "Is PostRecaller really free during the Public Beta?",
    answer:
      "Yes! During our public beta launch, all Pro features—including unlimited saves, full social archive imports, unlimited AI takeaways, and smart auto-categorization—are 100% unlocked for free for all accounts created during beta. No credit card is required to sign up.",
    guideLink: "/register",
    guideLabel: "Claim Free Beta Access",
  },
  {
    id: "export-data",
    icon: Question,
    question: "Can I export my data if I ever want to switch tools?",
    answer:
      "Absolutely. We believe in zero vendor lock-in. You can export your entire vault at any time in standard JSON or Markdown formats with all summaries, original URLs, and tags intact. Your data belongs entirely to you.",
    guideLink: null,
  },
];

export function LandingFAQ() {
  const [openId, setOpenId] = useState("import-social");

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="container-page px-5 md:px-12 pt-28 md:pt-36" id="faq">
      <div className="max-w-[840px] mx-auto">
        {/* Section Eyebrow & Headline */}
        <div className="text-center space-y-3 mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-ds-pill bg-brand-tertiary text-brand text-ds-xs md:text-ds-sm font-semibold tracking-wider uppercase">
            <Question size={15} weight="bold" />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-[28px] md:text-[42px] leading-[1.08] tracking-[-0.025em] text-on-surface font-medium">
            Everything you need to know about{" "}
            <span className="text-brand-secondary italic font-serif">PostRecaller</span>.
          </h2>

          <p className="text-on-surface-secondary text-ds-base md:text-ds-lg max-w-[560px] mx-auto leading-relaxed">
            Quick answers about importing your backlog, saving from mobile apps, and keeping your vault organized.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            const { icon: ItemIcon } = item;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-surface dark:bg-zinc-900 border-[#4A5D4E]/60 shadow-sm"
                    : "bg-surface/70 dark:bg-zinc-900/50 border-ds-border/70 hover:border-ds-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "bg-[#4A5D4E] text-white"
                          : "bg-surface-secondary text-on-surface-secondary"
                      }`}
                    >
                      <ItemIcon size={18} weight="bold" />
                    </span>
                    <span className="text-ds-base sm:text-[17px] font-semibold text-on-surface">
                      {item.question}
                    </span>
                  </div>

                  <span
                    className={`p-1.5 rounded-full transition-transform duration-200 text-on-surface-secondary shrink-0 ${
                      isOpen ? "rotate-180 text-brand" : ""
                    }`}
                  >
                    <CaretDown size={18} weight="bold" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-ds-sm sm:text-ds-base text-on-surface-secondary leading-relaxed border-t border-ds-border/40 pl-[56px] sm:pl-[64px]">
                        <p>{item.answer}</p>
                        {item.guideLink && (
                          <div className="mt-3.5">
                            <Link
                              to={item.guideLink}
                              className="inline-flex items-center gap-1.5 text-xs sm:text-ds-sm font-semibold text-brand hover:underline"
                            >
                              <span>{item.guideLabel}</span>
                              <ArrowRight size={13} weight="bold" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer Link to Dedicated Visual Guides Page */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-surface-secondary/80 to-surface-secondary/40 border border-ds-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-ds-base font-semibold text-on-surface">
              Need detailed screenshots &amp; step-by-step instructions?
            </h4>
            <p className="text-ds-sm text-on-surface-secondary mt-0.5">
              Browse our complete visual guides for Instagram, TikTok, Facebook, Reddit, Chrome, Safari and more.
            </p>
          </div>

          <Link
            to="/faq"
            className="px-5 py-2.5 rounded-ds-md bg-[#4A5D4E] hover:bg-[#3e4f42] text-white text-ds-sm font-medium transition-all shadow-xs flex items-center gap-2 shrink-0"
          >
            <span>View All Visual Guides</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LandingFAQ;
