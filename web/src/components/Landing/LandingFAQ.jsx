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
    id: "save-mobile",
    icon: ShareNetwork,
    question: "1. How do I save a post from Instagram, Facebook, TikTok, or Reddit on my phone?",
    answer:
      "Whenever you see a post, Reel, tutorial, or video you want to keep, tap your app's Share button (the paper airplane on Instagram, arrow on TikTok, or Share on Facebook/Reddit) and select 'PostRecaller'. Our app captures the link, cleans tracking junk (?igsh=..., ?utm_source=...), and queues it into your private vault. You can also tap 'Copy Link' and open PostRecaller—it will auto-detect the clipboard link and prompt to save in 1 tap.",
    guideLink: "/faq#save-from-apps",
    guideLabel: "View Mobile Sharing Guide",
  },
  {
    id: "how-enrichment-works",
    icon: Sparkle,
    question: "2. What happens after I save a link? How does AI enrichment work?",
    answer:
      "The moment you tap Save, the post is added to your vault and immediately starts background AI enrichment. The post card shows an active 'Processing AI…' badge while our AI extracts the executive summary, transcripts key takeaways, and assigns smart tags. Within seconds, the card updates automatically in real-time.",
    guideLink: "/faq",
    guideLabel: "Learn More in Help Center",
  },
  {
    id: "import-social",
    icon: UploadSimple,
    question: "3. How do I import my existing saved posts from Instagram, TikTok, or Facebook?",
    answer:
      "You can export your saved posts directly from each app's official settings. In Instagram and Facebook, go to Profile > Menu (☰) > Accounts Center > Your information and permissions > Export your information, select 'Saved posts', and choose JSON format. In TikTok, go to Settings & privacy > Account > Download your data. Once you have the file, simply drag and drop it into PostRecaller's Importer.",
    guideLink: "/faq#export-instagram",
    guideLabel: "View Instagram & TikTok Export Guide",
  },
  {
    id: "import-browser",
    icon: Globe,
    question: "4. How do I import my bookmarks from Chrome, Safari, Edge, or Firefox?",
    answer:
      "In Google Chrome, Edge, or Brave, press Ctrl+Shift+O (Cmd+Option+B on Mac), click the three dots (⋮) in the top-right corner, and select 'Export bookmarks'. In Safari, click File > Export > Bookmarks. This produces an .html file. Drop this file into PostRecaller, and all your browser links will be cataloged with smart tags and searchable summaries.",
    guideLink: "/faq#export-browsers",
    guideLabel: "View Browser Bookmarks Guide",
  },
  {
    id: "beta-limits",
    icon: ShieldCheck,
    question: "5. What are the usage limits during the Public Beta?",
    answer:
      "To ensure fast performance and protect our shared infrastructure, PostRecaller provides generous fair-use allowances: up to 200 saved links per day, up to 1,000 links per bookmark file import (25MB max file size), and daily free AI enrichments that reset every night at midnight UTC. All accounts created during beta are 100% free with no credit card required.",
    guideLink: "/register",
    guideLabel: "Claim Free Beta Access",
  },
  {
    id: "deleted-posts",
    icon: ShieldCheck,
    question: "6. What happens if a creator deletes a post or makes their account private?",
    answer:
      "Traditional bookmarks break when a creator deletes a video, removes an article, or sets their profile to private ('link rot'). PostRecaller extracts the executive summary, key takeaways, and tags the moment you save it. Even if the original post disappears from the internet, your knowledge vault preserves the takeaways forever.",
    guideLink: null,
  },
  {
    id: "passwords",
    icon: Question,
    question: "7. Does PostRecaller ever ask for or store my social media passwords?",
    answer:
      "Never. PostRecaller is 100% passwordless and never requests access to your Instagram, TikTok, Facebook, or Reddit accounts. Intake works purely through standard mobile share links and official data files exported by you.",
    guideLink: null,
  },
  {
    id: "export-data",
    icon: Question,
    question: "8. Can I export my data if I ever want to switch tools?",
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
