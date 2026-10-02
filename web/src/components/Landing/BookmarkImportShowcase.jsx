import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadSimple,
  CheckCircle,
  Sparkle,
  BookmarkSimple,
  Globe,
  InstagramLogo,
  TiktokLogo,
  XLogo,
  ArrowRight,
  FileArchive,
  Tag,
  ChefHat,
  FilmStrip,
  BookOpen,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const IMPORT_PRESETS = [
  {
    id: "browser",
    title: "Browser Bookmarks",
    format: ".html",
    sourceName: "Chrome / Safari / Firefox",
    fileName: "bookmarks_chrome_export.html",
    fileSize: "1.2 MB",
    Icon: Globe,
    stats: { links: 482, duplicatesSkipped: 34, duration: "1.2s" },
    sampleCards: [
      {
        title: "Modern Distributed Systems in Go",
        source: "github.com/practical-go",
        category: "Tech Guide",
        takeaway: "Mastering concurrent worker pools and channel backpressure without race conditions.",
        tags: ["#golang", "#concurrency", "#systems"],
        intentIcon: BookOpen,
      },
      {
        title: "The Ultimate Guide to Espresso Extraction",
        source: "baristahustle.com",
        category: "Article",
        takeaway: "Dialing grind size by TDS ratio rather than time alone for balanced sweetness.",
        tags: ["#coffee", "#espresso", "#technique"],
        intentIcon: BookOpen,
      },
    ],
  },
  {
    id: "instagram",
    title: "Instagram Saves",
    format: ".zip",
    sourceName: "Instagram Data Export",
    fileName: "instagram_saved_posts.zip",
    fileSize: "8.4 MB",
    Icon: InstagramLogo,
    stats: { links: 245, duplicatesSkipped: 18, duration: "0.8s" },
    sampleCards: [
      {
        title: "15-Min Creamy Tuscan Garlic Gnocchi",
        source: "Instagram Reel · @pastachef",
        category: "Recipe",
        takeaway: "Quick skillet dinner with sun-dried tomatoes, baby spinach, heavy cream & parmesan.",
        tags: ["#gnocchi", "#dinner", "#recipe", "#quickmeals"],
        intentIcon: ChefHat,
      },
      {
        title: "Hidden Modernist Architecture in Kyoto",
        source: "Instagram Carousel · @kyotospaces",
        category: "Travel",
        takeaway: "Four brutalist tea houses tucked away in northern Kyoto open to the public on weekends.",
        tags: ["#travel", "#japan", "#architecture"],
        intentIcon: BookmarkSimple,
      },
    ],
  },
  {
    id: "tiktok",
    title: "TikTok Favorites",
    format: ".json",
    sourceName: "TikTok Data Export",
    fileName: "tiktok_user_data.json",
    fileSize: "3.1 MB",
    Icon: TiktokLogo,
    stats: { links: 184, duplicatesSkipped: 12, duration: "0.6s" },
    sampleCards: [
      {
        title: "5 Hidden iPhone Settings That Save Battery",
        source: "TikTok Video · @techwithsam",
        category: "Tutorial",
        takeaway: "Turn off background app refresh for social apps and toggle off 5G standalone when on Wi-Fi.",
        tags: ["#ios", "#iphone", "#battery", "#tips"],
        intentIcon: FilmStrip,
      },
      {
        title: "Crispy Smashed Fingerling Potatoes",
        source: "TikTok Video · @crispyeats",
        category: "Recipe",
        takeaway: "Parboil in baking soda water first to create micro-cracks before baking at 425°F.",
        tags: ["#cooking", "#potatoes", "#sidekick"],
        intentIcon: ChefHat,
      },
    ],
  },
  {
    id: "twitter",
    title: "X / Twitter Bookmarks",
    format: ".js",
    sourceName: "X Archive Bookmarks",
    fileName: "twitter_bookmarks.js",
    fileSize: "640 KB",
    Icon: XLogo,
    stats: { links: 128, duplicatesSkipped: 9, duration: "0.4s" },
    sampleCards: [
      {
        title: "How to Build a High-Converting Landing Page",
        source: "X Thread · @robabor",
        category: "Marketing",
        takeaway: "Focus headline on user transformation rather than features. Cut copy by 40% on mobile.",
        tags: ["#copywriting", "#saas", "#growth"],
        intentIcon: BookOpen,
      },
      {
        title: "LLM Fine-Tuning Benchmarks on Consumer GPUs",
        source: "X Thread · @ai_dev",
        category: "Engineering",
        takeaway: "QLoRA 4-bit quantization achieves 98% of full precision performance on RTX 4090.",
        tags: ["#ai", "#llm", "#deeplearning"],
        intentIcon: BookOpen,
      },
    ],
  },
];

export function BookmarkImportShowcase() {
  const [activeTab, setActiveTab] = useState("browser");
  const activePreset = IMPORT_PRESETS.find((p) => p.id === activeTab) || IMPORT_PRESETS[0];

  return (
    <section className="container-page px-5 md:px-12 pt-28 md:pt-40" id="import-backlog">
      {/* Section Header */}
      <div className="max-w-[760px] flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-ds-pill bg-brand-tertiary text-brand text-ds-xs md:text-ds-sm font-semibold tracking-wider uppercase self-start">
          <UploadSimple size={15} weight="bold" />
          <span>Universal Backlog Importer</span>
        </div>

        <h2 className="text-[32px] md:text-[50px] leading-[1.04] tracking-[-0.03em] text-on-surface font-medium">
          Don’t start from scratch.
          <br />
          Bring years of buried saves{" "}
          <span className="text-brand-secondary italic font-serif">in 60 seconds</span>.
        </h2>

        <p className="text-on-surface-secondary text-ds-base md:text-ds-lg leading-relaxed max-w-[660px]">
          Already have hundreds of saved reels, TikTok favorites, and forgotten browser folders? Drop your export file. PostRecaller strips dead tracking junk, extracts AI takeaways, and makes your entire backlog searchable on Day 1.
        </p>
      </div>

      {/* Preset Source Tabs */}
      <div className="mt-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {IMPORT_PRESETS.map((preset) => {
          const isSelected = preset.id === activeTab;
          const { Icon } = preset;
          return (
            <button
              key={preset.id}
              onClick={() => setActiveTab(preset.id)}
              className={`px-4 py-2.5 rounded-ds-pill text-ds-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap border shrink-0 ${
                isSelected
                  ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-sm font-semibold scale-[1.02]"
                  : "bg-surface-secondary/70 border-ds-border/70 text-on-surface-secondary hover:text-on-surface hover:bg-surface-secondary"
              }`}
            >
              <Icon size={16} weight="bold" />
              <span>{preset.title}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                isSelected ? "bg-white/20 text-white" : "bg-ds-border/50 text-on-surface-secondary"
              }`}>
                {preset.format}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Import Stage Canvas */}
      <div className="mt-6 rounded-[24px] md:rounded-[32px] border border-ds-border/80 dark:border-white/10 bg-surface/90 dark:bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-tier-2 overflow-hidden relative">
        {/* Subtle Ambient Backlight */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand/10 blur-3xl -z-0" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-brand-secondary/10 blur-3xl -z-0" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activePreset.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-[1.1fr_1.4fr] gap-8 lg:gap-12 items-center relative z-10"
          >
            {/* Left Column: Dropzone Simulation & Telemetry */}
            <div className="flex flex-col gap-5">
              {/* Simulated File Drop Target */}
              <div className="rounded-2xl border-2 border-dashed border-[#4A5D4E]/60 bg-[#4A5D4E]/5 dark:bg-[#4A5D4E]/10 p-5 sm:p-6 text-center space-y-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-[#4A5D4E] text-white flex items-center justify-center mx-auto shadow-sm">
                  <FileArchive size={26} weight="duotone" />
                </div>
                <div>
                  <h4 className="text-ds-base font-semibold text-on-surface">
                    {activePreset.fileName}
                  </h4>
                  <p className="text-ds-xs text-on-surface-secondary mt-0.5 font-mono">
                    {activePreset.fileSize} · Ready for instant parsing
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
                  <CheckCircle size={14} weight="fill" />
                  <span>Verified {activePreset.sourceName} Format</span>
                </div>
              </div>

              {/* Ingestion Telemetry Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-ds-md bg-surface-secondary/70 dark:bg-black/30 border border-ds-border/60 text-center">
                  <span className="text-[10px] font-mono text-on-surface-secondary uppercase tracking-wider block">
                    Extracted
                  </span>
                  <span className="text-ds-lg sm:text-ds-xl font-bold text-brand">
                    +{activePreset.stats.links}
                  </span>
                  <span className="text-[10px] text-on-surface-secondary block">active links</span>
                </div>

                <div className="p-3 rounded-ds-md bg-surface-secondary/70 dark:bg-black/30 border border-ds-border/60 text-center">
                  <span className="text-[10px] font-mono text-on-surface-secondary uppercase tracking-wider block">
                    Cleaned
                  </span>
                  <span className="text-ds-lg sm:text-ds-xl font-bold text-on-surface">
                    {activePreset.stats.duplicatesSkipped}
                  </span>
                  <span className="text-[10px] text-on-surface-secondary block">dupes skipped</span>
                </div>

                <div className="p-3 rounded-ds-md bg-surface-secondary/70 dark:bg-black/30 border border-ds-border/60 text-center">
                  <span className="text-[10px] font-mono text-on-surface-secondary uppercase tracking-wider block">
                    Speed
                  </span>
                  <span className="text-ds-lg sm:text-ds-xl font-bold text-emerald-500">
                    {activePreset.stats.duration}
                  </span>
                  <span className="text-[10px] text-on-surface-secondary block">import time</span>
                </div>
              </div>

              <p className="text-ds-xs text-on-surface-secondary leading-relaxed">
                💡 <span className="font-semibold text-on-surface">How it works:</span> Export your data from {activePreset.sourceName}, drop the file in PostRecaller, and watch your links auto-populate with full AI takeaways. Zero manual filing.
              </p>
            </div>

            {/* Right Column: Resulting Vault Cards Instant Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-mono uppercase tracking-wider text-on-surface-secondary font-semibold flex items-center gap-1.5">
                  <Sparkle size={13} weight="fill" className="text-brand" />
                  Instant Vault Result on Day 1
                </span>
                <span className="text-[11px] font-mono text-brand font-semibold bg-brand-tertiary px-2 py-0.5 rounded">
                  Search Ready
                </span>
              </div>

              {/* Sample Cards from Import */}
              <div className="space-y-3">
                {activePreset.sampleCards.map((card, idx) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="p-4 sm:p-4.5 rounded-ds-md bg-surface dark:bg-zinc-800/90 border border-ds-border/80 shadow-sm space-y-2 hover:border-brand/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-ds-border/50 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-brand-tertiary text-brand flex items-center justify-center shrink-0">
                          <card.intentIcon size={12} weight="bold" />
                        </span>
                        <h5 className="text-ds-sm font-semibold text-on-surface truncate">
                          {card.title}
                        </h5>
                      </div>
                      <span className="text-[10px] font-mono text-on-surface-secondary shrink-0">
                        {card.source}
                      </span>
                    </div>

                    <p className="text-ds-xs sm:text-ds-sm text-on-surface leading-snug">
                      "{card.takeaway}"
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-ds-pill bg-surface-secondary text-brand text-[11px] font-mono font-medium border border-ds-border/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Instant Search Bar Demonstration */}
              <div className="p-3 rounded-ds-md bg-surface-secondary/70 dark:bg-black/30 border border-brand/20 flex items-center justify-between text-xs text-on-surface-secondary">
                <span className="font-mono">
                  🔍 Type <span className="text-brand font-semibold">"gnocchi"</span> or <span className="text-brand font-semibold">"concurrency"</span> → instant match
                </span>
                <Link
                  to="/register"
                  className="font-semibold text-brand hover:underline inline-flex items-center gap-1"
                >
                  Import yours <ArrowRight size={12} weight="bold" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default BookmarkImportShowcase;
