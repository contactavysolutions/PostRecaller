import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkle,
  LinkSimple,
  MagnifyingGlass,
  ArrowLeft,
  ArrowRight,
  ChefHat,
  FilmStrip,
  BookOpen,
  ShoppingBag,
  CheckCircle,
  Tag,
  InstagramLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
  Clock,
  Play,
} from "@phosphor-icons/react";

// -----------------------------------------------------------------------------
// Interactive Sandbox Visual for Slide 1: AI Executive Summaries
// -----------------------------------------------------------------------------
const SUMMARIZE_SAMPLES = [
  {
    id: "recipe",
    platform: "Instagram Reel",
    label: "Recipe Post",
    Icon: InstagramLogo,
    title: "15-Minute Creamy Mushroom Pasta",
    author: "@chef_marco",
    takeaway: "15-minute skillet dinner. Sauté wild mushrooms in butter & shallots, deglaze with white wine, and blend with coconut cream.",
    bullets: [
      "Total cook time: ~15 minutes (quick dinner)",
      "Key ingredients: Cremini mushrooms, shallots, white wine, coconut cream",
      "Technique: Deep caramelization before deglazing preserves rich umami",
    ],
    intent: "Try Recipe",
    tags: ["#recipe", "#dinner", "#pasta", "#quickmeals"],
  },
  {
    id: "thread",
    platform: "X Thread",
    label: "Tech Thread",
    Icon: XLogo,
    title: "Distributed Database Consensus Rules",
    author: "@alex_systems",
    takeaway: "Avoid synchronous two-phase commits across WAN regions. Opt for append-only write-ahead logs and asynchronous clock reconciliation.",
    bullets: [
      "Core problem: Two-phase commit causes latency spikes across WAN",
      "Architecture fix: Append-only write-ahead logs + optimistic local consensus",
      "Eventual consistency handled via vector clocks",
    ],
    intent: "Learn",
    tags: ["#systemdesign", "#architecture", "#databases", "#engineering"],
  },
  {
    id: "article",
    platform: "Web Article",
    label: "Science Guide",
    Icon: BookOpen,
    title: "The Neurobiology of Deep Sleep",
    author: "hubermanlab.com",
    takeaway: "Optimize deep sleep stages with 15 minutes of outdoor sunlight within 60 minutes of waking and a cool bedroom temperature (<68°F).",
    bullets: [
      "Action 1: 15 min outdoor morning sunlight anchors circadian rhythm",
      "Action 2: Cool room temperature (<68°F) triggers natural core temp drop",
      "Mechanism: Adenosine clearance and slow-wave sleep maximization",
    ],
    intent: "Read Later",
    tags: ["#health", "#habits", "#sleep", "#productivity"],
  },
];

function SummarizationSandbox() {
  const [activeSampleId, setActiveSampleId] = useState("recipe");
  const sample = SUMMARIZE_SAMPLES.find((s) => s.id === activeSampleId) || SUMMARIZE_SAMPLES[0];

  return (
    <div className="w-full rounded-ds-md border border-ds-border/80 bg-surface-secondary/60 dark:bg-black/40 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between border-b border-ds-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-ds-sm font-mono text-on-surface-secondary">
            AI Model · 0.8s extraction
          </span>
        </div>
        <span className="text-[11px] font-mono text-brand font-semibold px-2.5 py-0.5 rounded-ds-pill bg-brand-tertiary">
          Executive Summary
        </span>
      </div>

      {/* Sample Selector Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {SUMMARIZE_SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSampleId(s.id)}
            className={`px-2.5 py-2 rounded-ds-sm text-xs font-medium transition-all flex items-center justify-center gap-1.5 border text-center ${
              s.id === activeSampleId
                ? "bg-brand text-on-brand border-brand shadow-sm font-semibold"
                : "bg-surface dark:bg-zinc-800 text-on-surface-secondary hover:text-on-surface border-ds-border/60"
            }`}
          >
            <s.Icon size={14} weight="bold" />
            <span className="truncate">{s.label}</span>
          </button>
        ))}
      </div>

      {/* AI Key Takeaways Card */}
      <div className="space-y-2">
        <div className="p-3.5 rounded-ds-sm bg-surface dark:bg-zinc-800 border border-brand/30 space-y-2.5 shadow-sm">
          {/* Post Title & Source Pill */}
          <div className="flex items-center justify-between border-b border-ds-border/50 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 h-5 rounded bg-surface-secondary flex items-center justify-center text-on-surface shrink-0">
                <sample.Icon size={12} weight="bold" />
              </span>
              <p className="text-ds-sm font-semibold text-on-surface truncate">
                {sample.title}
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-brand/10 text-brand font-semibold shrink-0">
              {sample.intent}
            </span>
          </div>

          <p className="text-ds-sm font-medium text-on-surface leading-snug">
            "{sample.takeaway}"
          </p>

          <div className="pt-1.5 border-t border-ds-border/50 space-y-1">
            {sample.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-[11.5px] text-on-surface-secondary leading-snug">
                <span className="text-brand font-bold">•</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {sample.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-ds-pill bg-brand-tertiary/70 text-brand text-[11px] font-mono font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Interactive Sandbox Visual for Slide 2: Intent Classifier
// -----------------------------------------------------------------------------
const INTENTS_DATA = [
  { id: "recipe", label: "Recipe", Icon: ChefHat, count: "42 saves", color: "text-amber-500", note: "Ingredients & cook time extracted" },
  { id: "watch", label: "Watch Later", Icon: FilmStrip, count: "18 saves", color: "text-indigo-400", note: "Video preview & creator notes organized" },
  { id: "read", label: "Article", Icon: BookOpen, count: "65 saves", color: "text-emerald-500", note: "Key bullet summaries & read estimate" },
  { id: "shop", label: "Gear & Goods", Icon: ShoppingBag, count: "12 saves", color: "text-rose-400", note: "Price mentions & product names" },
];

function IntentClassifierSandbox() {
  const [activeIntent, setActiveIntent] = useState("recipe");
  const current = INTENTS_DATA.find((i) => i.id === activeIntent) || INTENTS_DATA[0];

  return (
    <div className="w-full rounded-ds-md border border-ds-border/80 bg-surface-secondary/60 dark:bg-black/40 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between border-b border-ds-border/60 pb-2.5">
        <span className="text-ds-sm font-mono text-on-surface-secondary">
          Zero-Shot Intent Classifier
        </span>
        <span className="text-[11px] font-mono text-brand font-semibold px-2.5 py-0.5 rounded-ds-pill bg-brand-tertiary">
          Auto-Categorized
        </span>
      </div>

      {/* Clickable Intent Pills */}
      <div className="grid grid-cols-2 gap-2">
        {INTENTS_DATA.map((intent) => {
          const isSelected = activeIntent === intent.id;
          const { Icon } = intent;
          return (
            <button
              key={intent.id}
              onClick={() => setActiveIntent(intent.id)}
              className={`p-2.5 rounded-ds-sm text-left transition-all border ${
                isSelected
                  ? "bg-surface dark:bg-zinc-800 border-brand shadow-sm"
                  : "bg-surface/50 dark:bg-zinc-900/50 border-ds-border/60 hover:border-ds-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center ${
                      isSelected ? "bg-brand text-on-brand" : "bg-surface-secondary text-on-surface-secondary"
                    }`}
                  >
                    <Icon size={14} weight="bold" />
                  </span>
                  <span className={`text-ds-sm font-medium ${isSelected ? "text-on-surface" : "text-on-surface-secondary"}`}>
                    {intent.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-on-surface-secondary">
                  {intent.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Intent Details Preview */}
      <div className="p-3 rounded-ds-sm bg-surface dark:bg-zinc-800 border border-brand/30 space-y-1">
        <p className="text-xs font-mono uppercase tracking-wider text-brand font-semibold">
          Active Filter: {current.label}
        </p>
        <p className="text-ds-sm text-on-surface leading-snug">
          {current.note}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Interactive Sandbox Visual for Slide 3: Universal Feed Parser
// -----------------------------------------------------------------------------
const PLATFORM_SAMPLES = [
  { name: "Instagram", Icon: InstagramLogo, raw: "https://instagram.com/reel/C7xK89/?igsh=MWFqZ2N1Yg==", clean: "postrecaller.vault/ig/reel/C7xK89", note: "Stripped 42 tracking bytes, clean metadata saved" },
  { name: "TikTok", Icon: TiktokLogo, raw: "https://tiktok.com/@chef/video/738219?is_from_webapp=1", clean: "postrecaller.vault/tt/video/738219", note: "Creator caption, thumbnail & sound metadata captured" },
  { name: "X Thread", Icon: XLogo, raw: "https://x.com/levelsio/status/1782910?s=46&t=9kL2", clean: "postrecaller.vault/x/status/1782910", note: "Clean post content, author & media preserved" },
  { name: "YouTube", Icon: YoutubeLogo, raw: "https://youtu.be/dQw4w9Wg?si=q8z34x1a", clean: "postrecaller.vault/yt/video/dQw4w9Wg", note: "Clean video metadata, channel & thumbnail saved" },
];

function UniversalParserSandbox() {
  const [platformIdx, setPlatformIdx] = useState(0);
  const cur = PLATFORM_SAMPLES[platformIdx];

  return (
    <div className="w-full rounded-ds-md border border-ds-border/80 bg-surface-secondary/60 dark:bg-black/40 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between border-b border-ds-border/60 pb-2.5">
        <div className="flex items-center gap-1.5">
          {PLATFORM_SAMPLES.map((p, idx) => {
            const { Icon } = p;
            const isSel = idx === platformIdx;
            return (
              <button
                key={p.name}
                onClick={() => setPlatformIdx(idx)}
                className={`p-1.5 rounded-md transition-all ${
                  isSel
                    ? "bg-brand text-on-brand shadow-sm scale-105"
                    : "text-on-surface-secondary hover:text-on-surface hover:bg-surface"
                }`}
                title={p.name}
              >
                <Icon size={16} weight="bold" />
              </button>
            );
          })}
        </div>
        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 flex items-center gap-1">
          <CheckCircle size={12} weight="bold" />
          Sanitized
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-[10px] font-mono uppercase text-on-surface-secondary tracking-wider block mb-1">
            Raw Input URL (with tracking junk)
          </span>
          <div className="p-2 rounded bg-surface/60 dark:bg-zinc-800/60 font-mono text-[11px] text-on-surface-secondary truncate line-through opacity-70 border border-ds-border/40">
            {cur.raw}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase text-brand tracking-wider block mb-1 font-semibold">
            Clean Vault Canonical Node
          </span>
          <div className="p-2 rounded bg-surface dark:bg-zinc-800 font-mono text-[11px] text-on-surface font-semibold truncate border border-brand/40 shadow-sm">
            {cur.clean}
          </div>
        </div>

        <p className="text-[11px] text-brand font-medium pt-1">
          → {cur.note}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Interactive Sandbox Visual for Slide 4: Instant Vault Search
// -----------------------------------------------------------------------------
const SEARCH_QUERIES = [
  {
    prompt: "creamy pasta with guanciale",
    result: "Authentic Roman Carbonara with Guanciale",
    source: "Instagram Reel · @pastawhisperer",
    match: "Instant Match",
    notes: "Matched AI summary: egg yolk emulsion, pecorino romano, crispy guanciale.",
  },
  {
    prompt: "desk cable management floating setup",
    result: "The Ultimate Cableless Floating Desk Guide",
    source: "YouTube · Ali Abdaal",
    match: "Instant Match",
    notes: "Matched AI summary: under-desk cable spine, Ergotron LX arm, walnut top.",
  },
  {
    prompt: "seed stage saas pricing model",
    result: "How to Price Your B2B SaaS Product",
    source: "X Thread · @lennysan",
    match: "Instant Match",
    notes: "Matched AI summary: usage-based pricing, seat licenses, expansion revenue.",
  },
];

function InstantSearchSandbox() {
  const [qIdx, setQIdx] = useState(0);
  const current = SEARCH_QUERIES[qIdx];

  return (
    <div className="w-full rounded-ds-md border border-ds-border/80 bg-surface-secondary/60 dark:bg-black/40 p-4 sm:p-5 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between border-b border-ds-border/60 pb-2.5">
        <span className="text-ds-sm font-mono text-on-surface-secondary">
          Search Latency: &lt; 15ms
        </span>
        <span className="text-[11px] font-mono text-brand font-semibold px-2.5 py-0.5 rounded-ds-pill bg-brand-tertiary">
          {current.match}
        </span>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-on-surface-secondary tracking-wider block">
          Simulate Search Query:
        </span>
        <div className="flex flex-col gap-1.5">
          {SEARCH_QUERIES.map((item, idx) => (
            <button
              key={item.prompt}
              onClick={() => setQIdx(idx)}
              className={`text-left text-ds-sm px-3 py-1.5 rounded-ds-sm transition-all border ${
                idx === qIdx
                  ? "bg-brand text-on-brand border-brand font-medium shadow-sm"
                  : "bg-surface dark:bg-zinc-800 text-on-surface-secondary hover:text-on-surface border-ds-border/60"
              }`}
            >
              "{item.prompt}"
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-ds-sm bg-surface dark:bg-zinc-800 border border-brand/30 space-y-1 shadow-sm">
        <span className="text-[10px] font-mono text-brand-secondary block font-semibold">
          {current.source}
        </span>
        <p className="text-ds-base font-semibold text-on-surface leading-tight">
          {current.result}
        </p>
        <p className="text-[11px] text-on-surface-secondary font-mono leading-relaxed pt-1">
          💡 {current.notes}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SLIDE DEFINITIONS
// -----------------------------------------------------------------------------
const CAROUSEL_SLIDES = [
  {
    id: "summary",
    tabTitle: "01 AI Summaries",
    Icon: Sparkle,
    badge: "AI Executive Takeaways",
    headline: "Get the signal without digging through the noise.",
    description:
      "Chaotic captions, multi-post threads, and longform articles are distilled into 2-sentence executive takeaways and key bullet points the moment you save them.",
    tags: ["Executive Takeaways", "AI Summaries", "0.8s Processing", "Auto-Extraction"],
    Sandbox: SummarizationSandbox,
  },
  {
    id: "intent",
    tabTitle: "02 Intent Classifier",
    Icon: ChefHat,
    badge: "Automated Taxonomy",
    headline: "Never file links into dead folders again.",
    description:
      "Traditional bookmarks become graveyards. PostRecaller automatically detects whether a saved post is a dinner recipe, a longform tutorial, a book recommendation, or gear to purchase.",
    tags: ["#recipe", "#watch-later", "#tutorial", "#goods"],
    Sandbox: IntentClassifierSandbox,
  },
  {
    id: "parser",
    tabTitle: "03 Universal Parser",
    Icon: LinkSimple,
    badge: "Lossless Content Intake",
    headline: "Drop any URL. We handle the rest.",
    description:
      "Tracking parameters like ?igsh=... and ?si=... are stripped in sub-second time, and clean canonical post metadata is preserved in your private vault.",
    tags: ["Instagram", "TikTok", "X Threads", "YouTube", "Reddit"],
    Sandbox: UniversalParserSandbox,
  },
  {
    id: "search",
    tabTitle: "04 Instant Search",
    Icon: MagnifyingGlass,
    badge: "Full-Vault Search",
    headline: "Forget exact titles. Search the way you think.",
    description:
      "Search by any ingredient, concept, creator, or topic. PostRecaller scans your saved titles, AI summaries, and tags in real time.",
    tags: ["Full-Text Search", "Sub-15ms Latency", "Search by Concept", "Tags & Summaries"],
    Sandbox: InstantSearchSandbox,
  },
];

// -----------------------------------------------------------------------------
// MAIN COMPONENT: FeaturesCarousel
// Wide landscape canvas, sleek segmented tab navigation, and touch/drag controls
// -----------------------------------------------------------------------------
export function FeaturesCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slide = CAROUSEL_SLIDES[activeIdx];
  const timerRef = useRef(null);

  // Auto-advance every 8 seconds when not hovered/paused
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 8000);

    return () => clearTimeout(timerRef.current);
  }, [activeIdx, isPaused]);

  const handleNext = () => {
    setIsPaused(true);
    setActiveIdx((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handlePrev = () => {
    setIsPaused(true);
    setActiveIdx((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  return (
    <section
      className="container-page px-5 md:px-12 pt-28 md:pt-40"
      id="features-showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="max-w-[720px] flex flex-col gap-4">
        <p className="text-brand-secondary text-ds-sm md:text-ds-base uppercase tracking-[0.2em] font-semibold">
          Engineered for Instant Recall
        </p>
        <h2 className="text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.03em] text-on-surface font-medium">
          A second brain that works{" "}
          <span className="text-brand-secondary italic font-serif">automatically</span>.
        </h2>
        <p className="text-on-surface-secondary text-ds-lg md:text-[18px] leading-[1.6] max-w-[620px]">
          Traditional bookmark managers hoard dead URLs. PostRecaller transforms raw social feeds, video links, and web articles into an interactive knowledge vault.
        </p>
      </div>

      {/* Segmented Navigation Tabs Bar */}
      <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-ds-border/70 pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {CAROUSEL_SLIDES.map((item, idx) => {
            const isSelected = idx === activeIdx;
            const { Icon } = item;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsPaused(true);
                  setActiveIdx(idx);
                }}
                className={`relative px-3.5 py-2 rounded-ds-pill text-ds-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? "bg-brand text-on-brand shadow-sm"
                    : "text-on-surface-secondary hover:text-on-surface hover:bg-surface-secondary"
                }`}
              >
                <Icon size={16} weight={isSelected ? "bold" : "regular"} />
                <span>{item.tabTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel Prev / Next Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs font-mono text-on-surface-secondary mr-2">
            0{activeIdx + 1} / 0{CAROUSEL_SLIDES.length}
          </span>
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full border border-ds-border bg-surface hover:bg-surface-secondary text-on-surface flex items-center justify-center transition-colors shadow-sm"
            aria-label="Previous slide"
          >
            <ArrowLeft size={16} weight="bold" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full border border-ds-border bg-surface hover:bg-surface-secondary text-on-surface flex items-center justify-center transition-colors shadow-sm"
            aria-label="Next slide"
          >
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Wide Landscape Feature Slide Canvas */}
      <div className="mt-8 relative overflow-hidden rounded-[24px] md:rounded-[32px] border border-ds-border/80 dark:border-white/10 bg-surface/90 dark:bg-zinc-900/70 backdrop-blur-xl shadow-tier-1 p-6 md:p-10 lg:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-8 lg:gap-14 items-center"
          >
            {/* Left Column: Rich Editorial Copy */}
            <div className="flex flex-col gap-4 min-w-0">
              <div className="inline-flex items-center gap-2 text-brand-secondary text-ds-sm uppercase tracking-wider font-semibold">
                <slide.Icon size={18} weight="bold" />
                <span>{slide.badge}</span>
              </div>

              <h3 className="text-ds-2xl sm:text-[32px] font-medium text-on-surface tracking-tight leading-snug">
                {slide.headline}
              </h3>

              <p className="text-on-surface-secondary text-ds-base sm:text-ds-lg leading-relaxed">
                {slide.description}
              </p>

              {/* Tag Pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {slide.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-ds-pill bg-brand-tertiary/70 text-brand text-[12px] font-medium border border-brand/20 flex items-center gap-1"
                  >
                    <Tag size={12} weight="bold" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Live Interactive Feature Sandbox */}
            <div className="w-full min-w-0">
              <slide.Sandbox />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default FeaturesCarousel;
