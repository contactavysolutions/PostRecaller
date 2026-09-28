import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkle,
  MagnifyingGlass,
  Tag,
  Waveform,
  ChefHat,
  FilmStrip,
  BookOpen,
  ShoppingBag,
  CheckCircle,
  LinkSimple,
  InstagramLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";

// Specular card container with subtle dynamic cursor lighting
function BentoCard({ children, className = "", spotlightColor = "rgba(74, 93, 78, 0.12)" }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-[20px] md:rounded-[24px] border border-ds-border/70 dark:border-white/10 bg-surface/80 dark:bg-zinc-900/60 backdrop-blur-xl shadow-tier-1 transition-all duration-300 hover:border-brand/40 dark:hover:border-brand/50 hover:shadow-lg ${className}`}
    >
      {/* Specular spotlight following cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 -z-0"
        style={{
          opacity: mousePos.opacity,
          background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
        }}
        aria-hidden
      />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Bento Card 1: AI Audio & Video Transcript Extraction (Large 2-col)
// -----------------------------------------------------------------------------
function TranscriptExtractionCard() {
  const [playbackProgress, setPlaybackProgress] = useState(48);

  return (
    <BentoCard className="md:col-span-2 p-6 md:p-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start justify-between">
        <div className="max-w-[340px]">
          <div className="flex items-center gap-2 text-brand-secondary text-ds-sm uppercase tracking-wider font-semibold">
            <Sparkle size={18} weight="bold" />
            <span>AI Executive Summaries</span>
          </div>
          <h3 className="mt-2 text-ds-2xl md:text-[26px] font-medium text-on-surface tracking-tight leading-snug">
            Get the signal without reading the noise.
          </h3>
          <p className="mt-2 text-on-surface-secondary text-ds-base leading-relaxed">
            Posts, threads, and articles are automatically distilled into 2-sentence key takeaways and actionable bullets the instant you save them.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["#quickmeals", "#caramelized", "#shallots", "#dinner"].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-ds-pill bg-brand-tertiary/70 dark:bg-brand/20 text-brand text-[12px] font-medium border border-brand/20 flex items-center gap-1"
              >
                <Tag size={12} weight="bold" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Live Audio / Transcript Visualizer Panel */}
        <div className="w-full lg:w-[320px] rounded-ds-md border border-ds-border/60 bg-surface-secondary/70 dark:bg-black/40 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-ds-border/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] font-mono text-on-surface-secondary">
                AI Model · 0.8s extraction
              </span>
            </div>
            <span className="text-[11px] font-mono text-brand font-semibold px-2 py-0.5 rounded bg-brand/10">
              Executive Summary
            </span>
          </div>

          {/* Key takeaway note */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-on-surface-secondary font-mono">
              <span className="text-brand font-semibold">Key Takeaway</span>
              <span>0.8s</span>
            </div>
            <div
              className="relative h-9 rounded bg-surface/90 dark:bg-zinc-800/80 border border-ds-border/50 flex items-center px-2 cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                setPlaybackProgress(pos);
              }}
            >
              {/* Fake Audio Bars */}
              <div className="w-full flex items-center justify-between gap-[2px] h-6 overflow-hidden">
                {[18, 35, 60, 40, 85, 95, 70, 45, 65, 80, 50, 30, 90, 100, 75, 55, 40, 60, 80, 70, 90, 65, 45, 30].map(
                  (height, i) => {
                    const barPercent = (i / 24) * 100;
                    const isPlayed = barPercent <= playbackProgress;
                    return (
                      <div
                        key={i}
                        className={`w-full rounded-full transition-colors duration-150 ${
                          isPlayed ? "bg-brand" : "bg-on-surface-secondary/25"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  }
                )}
              </div>
              {/* Playhead marker */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-brand-secondary shadow-[0_0_8px_rgba(194,110,93,0.8)]"
                style={{ left: `${playbackProgress}%` }}
              />
            </div>
          </div>

          {/* Live transcript snippet */}
          <div className="p-2.5 rounded bg-surface/80 dark:bg-zinc-800/60 border border-ds-border/40 text-[12px] text-on-surface leading-relaxed">
            <span className="text-on-surface-secondary font-medium mr-1.5">[0:14]</span>
            "...let those chanterelles get deeply caramelized, then deglaze with a splash of dry white wine and heavy cream..."
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

// -----------------------------------------------------------------------------
// Bento Card 2: Smart Intent Classifier (1-col)
// -----------------------------------------------------------------------------
const INTENTS = [
  { id: "recipe", label: "Recipe", Icon: ChefHat, count: "42 saves" },
  { id: "watch", label: "Watch Later", Icon: FilmStrip, count: "18 saves" },
  { id: "read", label: "Article", Icon: BookOpen, count: "65 saves" },
  { id: "shop", label: "Gear & Goods", Icon: ShoppingBag, count: "12 saves" },
];

function IntentClassifierCard() {
  const [selectedIntent, setSelectedIntent] = useState("recipe");

  return (
    <BentoCard className="p-6 md:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-brand-secondary text-ds-sm uppercase tracking-wider font-semibold">
          <Sparkle size={18} weight="bold" />
          <span>Intent Classification</span>
        </div>
        <h3 className="mt-2 text-ds-xl font-medium text-on-surface tracking-tight">
          Never file into folders again.
        </h3>
        <p className="mt-1 text-on-surface-secondary text-ds-sm leading-relaxed">
          AI detects whether a post is a dinner idea, a tutorial to study, or gear to purchase.
        </p>
      </div>

      <div className="mt-6 space-y-2">
        {INTENTS.map((intent) => {
          const isSelected = selectedIntent === intent.id;
          const { Icon } = intent;
          return (
            <button
              key={intent.id}
              onClick={() => setSelectedIntent(intent.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-ds-sm transition-all duration-200 text-left ${
                isSelected
                  ? "bg-surface dark:bg-zinc-800 border border-brand/40 shadow-sm"
                  : "bg-surface-secondary/50 dark:bg-white/[0.02] border border-transparent hover:border-ds-border/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    isSelected ? "bg-brand text-on-brand" : "bg-surface-secondary text-on-surface-secondary"
                  }`}
                >
                  <Icon size={15} weight="bold" />
                </span>
                <span className={`text-ds-sm font-medium ${isSelected ? "text-on-surface" : "text-on-surface-secondary"}`}>
                  {intent.label}
                </span>
              </div>
              <span className="text-[11px] font-mono text-on-surface-secondary">
                {intent.count}
              </span>
            </button>
          );
        })}
      </div>
    </BentoCard>
  );
}

// -----------------------------------------------------------------------------
// Bento Card 3: Universal Platform Intake Engine (1-col)
// -----------------------------------------------------------------------------
const PLATFORM_PREVIEWS = [
  { name: "Instagram", Icon: InstagramLogo, url: "instagram.com/reel/C7x...", status: "Metadata & Audio stripped" },
  { name: "TikTok", Icon: TiktokLogo, url: "tiktok.com/@chef/video/...", status: "Captions & Audio OCR" },
  { name: "X", Icon: XLogo, url: "x.com/levelsio/status/...", status: "Full Thread Unrolled" },
  { name: "YouTube", Icon: YoutubeLogo, url: "youtu.be/dQw4w9Wg...", status: "Timestamps & Chapters" },
];

function UniversalIntakeCard() {
  const [activePlatform, setActivePlatform] = useState(0);

  return (
    <BentoCard className="p-6 md:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-brand-secondary text-ds-sm uppercase tracking-wider font-semibold">
          <LinkSimple size={18} weight="bold" />
          <span>Universal Feed Parser</span>
        </div>
        <h3 className="mt-2 text-ds-xl font-medium text-on-surface tracking-tight">
          Drop any URL. We handle the rest.
        </h3>
        <p className="mt-1 text-on-surface-secondary text-ds-sm leading-relaxed">
          Tracking parameters like <code className="text-xs bg-surface-secondary px-1 py-0.5 rounded">?igsh=...</code> are stripped, anti-scraping paywalls resolved, and clean content preserved forever.
        </p>
      </div>

      <div className="mt-6 rounded-ds-md border border-ds-border/60 bg-surface-secondary/60 dark:bg-black/40 p-3.5 space-y-3">
        {/* Platform icon selector */}
        <div className="flex items-center justify-between gap-1 pb-2 border-b border-ds-border/40">
          {PLATFORM_PREVIEWS.map((plat, idx) => {
            const { Icon } = plat;
            const isSelected = idx === activePlatform;
            return (
              <button
                key={plat.name}
                onClick={() => setActivePlatform(idx)}
                className={`p-2 rounded-md transition-all ${
                  isSelected
                    ? "bg-brand text-on-brand shadow-sm scale-105"
                    : "text-on-surface-secondary hover:text-on-surface hover:bg-surface"
                }`}
                title={plat.name}
              >
                <Icon size={18} weight="bold" />
              </button>
            );
          })}
        </div>

        {/* Selected platform detail */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-on-surface-secondary">
            <span>Canonical Source</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
              <CheckCircle size={12} weight="bold" />
              Sanitized
            </span>
          </div>
          <div className="p-2 rounded bg-surface/80 dark:bg-zinc-800/80 font-mono text-[11px] text-on-surface truncate border border-ds-border/40">
            {PLATFORM_PREVIEWS[activePlatform].url}
          </div>
          <p className="text-[11px] text-brand font-medium">
            → {PLATFORM_PREVIEWS[activePlatform].status}
          </p>
        </div>
      </div>
    </BentoCard>
  );
}

// -----------------------------------------------------------------------------
// Bento Card 4: Semantic Omnisearch Interactive Playground (2-col)
// -----------------------------------------------------------------------------
const SAMPLE_QUERIES = [
  {
    query: "that creamy pasta from 3 weeks ago",
    resultTitle: "Authentic Carbonara with Guanciale & Pecorino",
    source: "Instagram Reel · @pastawhisperer",
    relevance: "98% match",
    highlight: "Matched concepts: egg emulsion, black pepper, Roman technique",
  },
  {
    query: "minimalist desk setup monitor arm",
    resultTitle: "The Ultimate Cableless Floating Desk Guide",
    source: "YouTube · Ali Abdaal",
    relevance: "96% match",
    highlight: "Matched concepts: Ergotron LX, under-desk cable trunking, walnut top",
  },
  {
    query: "growth strategy framework for b2b saas",
    resultTitle: "How Figma Built Their Product-Led Flywheel",
    source: "X Thread · @lennysan",
    relevance: "94% match",
    highlight: "Matched concepts: bottom-up viral loops, org team licenses, pricing tiers",
  },
];

function SemanticSearchCard() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = SAMPLE_QUERIES[selectedIdx];

  return (
    <BentoCard className="md:col-span-2 p-6 md:p-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start justify-between">
        <div className="max-w-[340px]">
          <div className="flex items-center gap-2 text-brand-secondary text-ds-sm uppercase tracking-wider font-semibold">
            <MagnifyingGlass size={18} weight="bold" />
            <span>Semantic Vector Retrieval</span>
          </div>
          <h3 className="mt-2 text-ds-2xl md:text-[26px] font-medium text-on-surface tracking-tight leading-snug">
            Forget exact keywords. Search like you think.
          </h3>
          <p className="mt-2 text-on-surface-secondary text-ds-base leading-relaxed">
            PostRecaller converts your queries into vector embeddings. Even if you don't remember the creator's username or title, the semantic meaning connects immediately.
          </p>

          <div className="mt-5 space-y-1.5">
            <p className="text-[11px] font-mono uppercase tracking-wider text-on-surface-secondary">
              Try simulated queries:
            </p>
            <div className="flex flex-col gap-1.5">
              {SAMPLE_QUERIES.map((sample, i) => (
                <button
                  key={sample.query}
                  onClick={() => setSelectedIdx(i)}
                  className={`text-left text-ds-sm px-3 py-1.5 rounded-ds-sm transition-all border ${
                    selectedIdx === i
                      ? "bg-brand text-on-brand border-brand font-medium shadow-sm"
                      : "bg-surface-secondary/70 dark:bg-white/[0.03] text-on-surface-secondary hover:text-on-surface border-ds-border/60"
                  }`}
                >
                  "{sample.query}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Vector Match Simulation Display */}
        <div className="w-full lg:w-[350px] rounded-ds-md border border-ds-border/60 bg-surface-secondary/70 dark:bg-black/40 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-ds-border/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
              <span className="text-[12px] font-mono text-on-surface-secondary">
                Embedding Distance: 0.14
              </span>
            </div>
            <span className="text-[11px] font-mono text-brand font-semibold px-2 py-0.5 rounded bg-brand/10">
              {current.relevance}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.query}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="p-3.5 rounded-ds-sm bg-surface dark:bg-zinc-800 border border-brand/30 shadow-sm space-y-2">
                <span className="text-[11px] text-brand-secondary font-medium block">
                  {current.source}
                </span>
                <h4 className="text-ds-base font-semibold text-on-surface leading-snug">
                  {current.resultTitle}
                </h4>
                <div className="p-2 rounded bg-surface-secondary/60 dark:bg-black/30 border border-ds-border/30 text-[11px] text-on-surface-secondary font-mono leading-relaxed">
                  💡 {current.highlight}
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-on-surface-secondary">Vector latency</span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  18ms lookup
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </BentoCard>
  );
}

// -----------------------------------------------------------------------------
// Bento Grid Main Section Container
// -----------------------------------------------------------------------------
export function BentoFeatures() {
  return (
    <section className="container-page px-5 md:px-12 pt-28 md:pt-40" id="features">
      <div className="max-w-[720px] flex flex-col gap-4">
        <p className="text-brand-secondary text-ds-sm md:text-ds-base uppercase tracking-[0.2em] font-semibold">
          Engineered for Instant Recall
        </p>
        <h2 className="text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.03em] text-on-surface font-medium">
          A second brain that works{" "}
          <span className="text-brand-secondary italic font-serif">automatically</span>.
        </h2>
        <p className="text-on-surface-secondary text-ds-lg md:text-[18px] leading-[1.6] max-w-[620px]">
          Traditional bookmark managers hoard dead URLs. PostRecaller transforms raw video feeds, audio transcripts, and social threads into an interactive, lightning-fast knowledge network.
        </p>
      </div>

      <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <TranscriptExtractionCard />
        <IntentClassifierCard />
        <UniversalIntakeCard />
        <SemanticSearchCard />
      </div>
    </section>
  );
}
