import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Sparkle,
  BookmarkSimple,
  MagnifyingGlass,
  ArrowRight,
  Clock,
  ShieldCheck,
  Devices,
  Play,
  CheckCircle,
  Tag,
  InstagramLogo,
  TiktokLogo,
  XLogo,
  ChefHat,
} from "@phosphor-icons/react";
import { WaitlistForm } from "@/components/WaitlistForm";
import { IS_WAITLIST_MODE } from "@/constants/config";

// -----------------------------------------------------------------------------
// Visual for Step 1: Share to Capture
// -----------------------------------------------------------------------------
function StepOneVisual() {
  return (
    <div className="relative w-full h-[470px] rounded-[24px] bg-surface dark:bg-zinc-900 border border-ds-border/90 dark:border-white/10 p-5 sm:p-7 flex flex-col justify-between overflow-hidden shadow-tier-1">
      {/* Subtle warm backdrop glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 rounded-full bg-brand-secondary/8 blur-3xl -z-0" />

      {/* Header Badge & Title */}
      <div className="relative z-10 space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-ds-pill bg-brand-tertiary text-brand text-[12px] font-semibold tracking-wide uppercase">
          <BookmarkSimple size={14} weight="bold" />
          <span>Step 01 · Instant Capture</span>
        </div>
        <h3 className="text-ds-xl sm:text-[22px] font-medium text-on-surface tracking-tight">
          Drop any link from any app.
        </h3>
        <p className="text-on-surface-secondary text-ds-sm leading-relaxed max-w-[420px]">
          Tap "Share" on Instagram, TikTok, X, or YouTube. PostRecaller captures the title, author, and source metadata instantly.
        </p>
      </div>

      {/* Visual Centerpiece: Floating Cards into Vault */}
      <div className="relative z-10 my-auto py-2">
        {/* Floating Social Source Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          {/* Instagram Reel */}
          <div className="rounded-ds-md bg-surface dark:bg-zinc-800/90 border border-ds-border/80 dark:border-white/10 p-2.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center text-white">
                <InstagramLogo size={13} weight="bold" />
              </span>
              <span className="text-[10px] font-mono text-on-surface-secondary">Reel</span>
            </div>
            <div className="h-12 rounded bg-surface-secondary overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=240&q=80"
                alt="Soup thumbnail"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Play size={10} weight="fill" className="text-white" />
              </div>
            </div>
            <p className="text-[11px] font-medium text-on-surface truncate">@culinary_arts</p>
          </div>

          {/* TikTok Hack */}
          <div className="rounded-ds-md bg-surface dark:bg-zinc-800/90 border border-ds-border/80 dark:border-white/10 p-2.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-md bg-black flex items-center justify-center text-white">
                <TiktokLogo size={13} weight="bold" />
              </span>
              <span className="text-[10px] font-mono text-on-surface-secondary">TikTok</span>
            </div>
            <div className="h-12 rounded bg-surface-secondary p-1.5 flex flex-col justify-end text-[10px] text-on-surface-secondary font-medium leading-tight">
              <span className="text-brand font-semibold text-[9px] uppercase font-mono">15m recipe</span>
              <span className="truncate">Velvety mushroom soup</span>
            </div>
            <p className="text-[11px] font-medium text-on-surface truncate">@theepicchef</p>
          </div>

          {/* X Thread */}
          <div className="rounded-ds-md bg-surface dark:bg-zinc-800/90 border border-ds-border/80 dark:border-white/10 p-2.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-md bg-zinc-900 flex items-center justify-center text-white">
                <XLogo size={13} weight="bold" />
              </span>
              <span className="text-[10px] font-mono text-on-surface-secondary">Thread</span>
            </div>
            <div className="h-12 rounded bg-surface-secondary p-1.5 flex flex-col justify-center text-[10px] text-on-surface-secondary leading-snug">
              <span>"The secret to restaurant soup..."</span>
              <span className="text-[9px] text-brand font-mono mt-0.5">🧵 6 posts</span>
            </div>
            <p className="text-[11px] font-medium text-on-surface truncate">@chefalex</p>
          </div>
        </div>

        {/* Dynamic Curved SVG Conduit Cables */}
        <div className="my-1 flex justify-center">
          <svg viewBox="0 0 340 50" className="w-full h-10 overflow-visible" fill="none">
            <path d="M 60 0 C 60 25, 170 15, 170 48" stroke="rgb(var(--brand))" strokeWidth="1.8" strokeDasharray="4 4" opacity="0.6" />
            <path d="M 170 0 C 170 20, 170 30, 170 48" stroke="rgb(var(--brand-secondary))" strokeWidth="2" opacity="0.8" />
            <path d="M 280 0 C 280 25, 170 15, 170 48" stroke="rgb(var(--brand))" strokeWidth="1.8" strokeDasharray="4 4" opacity="0.6" />
          </svg>
        </div>

        {/* Central Intake Vault Target */}
        <div className="rounded-ds-md bg-surface dark:bg-zinc-800 border border-brand/40 p-3 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-md bg-brand text-on-brand flex items-center justify-center">
              <Sparkle size={16} weight="fill" />
            </span>
            <div>
              <p className="text-ds-sm font-semibold text-on-surface leading-tight">
                PostRecaller Private Vault
              </p>
              <p className="text-[11px] font-mono text-on-surface-secondary">
                URL canonicalized &amp; queued for enrichment
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
            0.4s Ingestion
          </span>
        </div>
      </div>

      {/* Footer reassurance */}
      <div className="relative z-10 pt-2 border-t border-ds-border/60 flex items-center justify-between text-[11px] text-on-surface-secondary">
        <span>Tracking parameters removed</span>
        <span className="text-brand font-medium">Ready for AI processing ↓</span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Visual for Step 2: AI Enriches with Tags & Transcripts
// -----------------------------------------------------------------------------
function StepTwoVisual() {
  return (
    <div className="relative w-full h-[470px] rounded-[24px] bg-surface dark:bg-zinc-900 border border-ds-border/90 dark:border-white/10 p-5 sm:p-7 flex flex-col justify-between overflow-hidden shadow-tier-1">
      {/* Subtle sage backdrop glow */}
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-brand/10 blur-3xl -z-0" />

      {/* Header Badge & Title */}
      <div className="relative z-10 space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-ds-pill bg-brand-tertiary text-brand text-[12px] font-semibold tracking-wide uppercase">
          <Sparkle size={14} weight="bold" />
          <span>Step 02 · AI Key Takeaways</span>
        </div>
        <h3 className="text-ds-xl sm:text-[22px] font-medium text-on-surface tracking-tight">
          AI reads, summarizes, and auto-tags.
        </h3>
        <p className="text-on-surface-secondary text-ds-sm leading-relaxed max-w-[420px]">
          AI distills chaotic posts, Reddit threads, and article links into clear executive takeaways, while taxonomy models assign clean tags.
        </p>
      </div>

      {/* Visual Centerpiece: Extraction Card with Summary & Tags */}
      <div className="relative z-10 my-auto py-2 space-y-3">
        {/* AI Summary & Takeaways Panel */}
        <div className="rounded-ds-md bg-surface-secondary/70 dark:bg-zinc-800/80 border border-ds-border p-3.5 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-ds-border/60 pb-2">
            <div className="flex items-center gap-2">
              <Sparkle size={16} weight="fill" className="text-brand" />
              <span className="text-ds-sm font-semibold text-on-surface">AI Executive Summary</span>
            </div>
            <span className="text-[11px] font-mono text-brand font-semibold px-2 py-0.5 rounded bg-brand-tertiary">
              0.8s analysis
            </span>
          </div>

          {/* Bulleted Key Takeaways */}
          <div className="p-2.5 rounded bg-surface dark:bg-black/30 text-[12px] text-on-surface leading-relaxed border border-ds-border/40 space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="text-brand font-bold">•</span>
              <span>15-minute quick skillet recipe using fresh cremini mushrooms &amp; shallots.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand font-bold">•</span>
              <span>Deglaze with dry white wine and blend with coconut cream for a silky finish.</span>
            </div>
          </div>

          {/* Intent Classification Strip */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-brand/5 border border-brand/20 text-[11px]">
            <span className="text-on-surface-secondary font-mono uppercase tracking-wider text-[10px]">Detected Intent</span>
            <span className="text-brand font-semibold flex items-center gap-1.5">
              <ChefHat size={13} weight="bold" />
              Try Recipe
            </span>
          </div>
        </div>

        {/* Dynamic Tag Extraction Pill Stack */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-on-surface-secondary uppercase tracking-wider mr-1">
            Generated Tags:
          </span>
          {[
            { name: "#recipe", bg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" },
            { name: "#mushrooms", bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" },
            { name: "#quickdinner", bg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" },
            { name: "#culinary", bg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20" },
          ].map((tag) => (
            <span
              key={tag.name}
              className={`px-2.5 py-1 rounded-ds-pill text-[12px] font-medium border flex items-center gap-1 ${tag.bg}`}
            >
              <Tag size={12} weight="bold" />
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Footer reassurance */}
      <div className="relative z-10 pt-2 border-t border-ds-border/60 flex items-center justify-between text-[11px] text-on-surface-secondary">
        <span>Zero manual filing required</span>
        <span className="text-brand font-medium">Saved to your private vault ↓</span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Visual for Step 3: Find Instantly with Semantic Search
// -----------------------------------------------------------------------------
function StepThreeVisual() {
  const [typed, setTyped] = useState("creamy mushroom soup");

  return (
    <div className="relative w-full h-[470px] rounded-[24px] bg-surface dark:bg-zinc-900 border border-ds-border/90 dark:border-white/10 p-5 sm:p-7 flex flex-col justify-between overflow-hidden shadow-tier-1">
      {/* Subtle brand backdrop glow */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-64 h-64 rounded-full bg-brand-secondary/10 blur-3xl -z-0" />

      {/* Header Badge & Title */}
      <div className="relative z-10 space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-ds-pill bg-brand-tertiary text-brand text-[12px] font-semibold tracking-wide uppercase">
          <MagnifyingGlass size={14} weight="bold" />
          <span>Step 03 · Instant Vault Search</span>
        </div>
        <h3 className="text-ds-xl sm:text-[22px] font-medium text-on-surface tracking-tight">
          Find it by ingredient, topic, or phrase.
        </h3>
        <p className="text-on-surface-secondary text-ds-sm leading-relaxed max-w-[420px]">
          Even if you forgot the creator's username or title, search the way you think. PostRecaller searches titles, AI takeaways, and tags simultaneously.
        </p>
      </div>

      {/* Visual Centerpiece: Search Input + Result Card */}
      <div className="relative z-10 my-auto py-2 space-y-3">
        {/* Search Bar with live typed query */}
        <div className="w-full px-4 py-2.5 rounded-ds-md bg-surface dark:bg-zinc-800 border border-brand/50 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-on-surface text-ds-sm font-medium">
            <MagnifyingGlass size={16} weight="bold" className="text-brand" />
            <span>{typed}</span>
            <span className="w-1.5 h-4 bg-brand animate-pulse inline-block" />
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
            0.18s lookup
          </span>
        </div>

        {/* Surfaced Result Card */}
        <div className="rounded-ds-md bg-surface dark:bg-zinc-800 border border-brand/30 p-3.5 shadow-md space-y-2.5">
          <div className="flex items-center justify-between border-b border-ds-border/60 pb-2">
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=100&q=80"
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
              <div>
                <p className="text-ds-sm font-semibold text-on-surface leading-tight flex items-center gap-1">
                  <span>@theepicchef</span>
                  <CheckCircle size={13} weight="fill" className="text-brand" />
                </p>
                <p className="text-[10px] text-on-surface-secondary font-mono">Instagram Reel · 0:48</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-brand font-semibold px-2 py-0.5 rounded bg-brand-tertiary">
              Top Match
            </span>
          </div>

          <h4 className="text-ds-base font-semibold text-on-surface leading-snug">
            Creamy Mushroom &amp; Spinach Soup Recipe
          </h4>

          {/* AI Summary Box */}
          <div className="p-2 rounded bg-surface-secondary/80 dark:bg-black/30 border border-ds-border/40 text-[11px] text-on-surface-secondary leading-relaxed">
            <span className="font-semibold text-brand mr-1">💡 AI Summary:</span>
            "15-minute quick dinner recipe using blended coconut milk, sautéed oyster mushrooms, and cracked black pepper."
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-brand-tertiary text-brand text-[10px] font-medium">#recipe</span>
              <span className="px-2 py-0.5 rounded bg-brand-tertiary text-brand text-[10px] font-medium">#mushrooms</span>
              <span className="px-2 py-0.5 rounded bg-brand-tertiary text-brand text-[10px] font-medium">#healthy</span>
            </div>
            <button className="text-[12px] font-medium text-brand hover:underline flex items-center gap-1">
              <span>Open Link</span>
              <ArrowRight size={12} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer reassurance */}
      <div className="relative z-10 pt-2 border-t border-ds-border/60 flex items-center justify-between text-[11px] text-on-surface-secondary">
        <span>Filtered across your entire vault</span>
        <span className="text-brand font-medium">Found in seconds ✓</span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT: StickyHeroWorkflow
// Left Column: Pristine editorial copy from your image, sticky on desktop
// Right Column: Smoothly crossfading How It Works steps driven by scroll
// -----------------------------------------------------------------------------
export function StickyHeroWorkflow({ socialProof, onWaitlistCount }) {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(1);

  // Measure scroll progress through the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track active step based on scroll threshold
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.35) {
        setActiveStep(1);
      } else if (latest < 0.70) {
        setActiveStep(2);
      } else {
        setActiveStep(3);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section ref={containerRef} className="relative w-full" id="hero-workflow">
      {/* ========================================================================= */}
      {/* DESKTOP VIEW: Tall scroll track with sticky pinned split-screen           */}
      {/* ========================================================================= */}
      <div className="hidden lg:block relative h-[210vh]">
        <div className="sticky top-6 pt-4 pb-8 w-full container-page px-5 md:px-12">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-10 lg:gap-14 items-center">
            {/* ---------------- Left Column: Exactly matching your image ---------------- */}
            <div className="flex flex-col gap-6 max-w-[560px]">
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
                <span
                  className="text-brand-secondary text-ds-sm md:text-ds-base uppercase tracking-[0.2em] font-semibold"
                  data-testid="landing-social-proof"
                >
                  {socialProof}
                </span>
              </div>

              {/* Exact Headline from attached image */}
              <h1
                className="text-[48px] xl:text-[62px] leading-[0.98] tracking-[-0.035em] text-on-surface font-medium"
                data-testid="landing-headline"
              >
                A quiet vault
                <br />
                for a{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-brand-secondary italic font-serif">
                    loud
                  </span>
                  <span
                    className="absolute left-0 right-0 bottom-[6px] h-[8px] bg-brand-tertiary/80 -z-0 rounded-sm"
                    aria-hidden
                  />
                </span>{" "}
                internet.
              </h1>

              {/* Subheadline from attached image */}
              <p className="text-on-surface-secondary text-ds-xl md:text-[20px] leading-[1.55] max-w-[540px]">
                PostRecaller quietly organizes every link you save — cleans tracking junk, extracts key AI takeaways, and hands them back the instant you search.
              </p>

              {/* CTA Buttons matching attached image: sage pill primary + clean outline secondary */}
              <div className="max-w-[520px] w-full pt-1">
                {IS_WAITLIST_MODE ? (
                  <WaitlistForm onCount={onWaitlistCount} testIdPrefix="waitlist-hero" />
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to="/register"
                      data-testid="hero-get-started"
                      className="px-7 py-3.5 rounded-ds-md bg-[#4A5D4E] text-white text-ds-lg font-medium shadow-[0_4px_14px_rgba(74,93,78,0.3)] hover:bg-[#3e4f42] active:scale-[0.985] transition-all flex items-center gap-2"
                    >
                      <span>Create Free Account</span>
                      <ArrowRight size={18} weight="bold" />
                    </Link>
                    <Link
                      to="/login"
                      data-testid="hero-login"
                      className="px-6 py-3.5 rounded-ds-md border border-ds-border/90 bg-surface text-on-surface hover:bg-surface-secondary transition-all text-ds-lg font-medium shadow-sm"
                    >
                      Log In
                    </Link>
                  </div>
                )}
              </div>

              {/* Trust Strip from attached image */}
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { Icon: Clock, label: "Sub-Second Ingestion" },
                  { Icon: Sparkle, label: "AI Key Takeaways" },
                  { Icon: ShieldCheck, label: "Private & Secure" },
                  { Icon: Devices, label: "Cloud Vault Anywhere" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-on-surface-secondary">
                    <Icon size={18} weight="regular" className="text-brand" />
                    <span className="text-ds-base font-medium">{label}</span>
                  </div>
                ))}
              </div>

              {/* Interactive Step Indicator Tracker with Click Selection */}
              <div className="mt-4 pt-4 border-t border-ds-border/70 flex items-center gap-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-secondary mr-1">
                  How it works:
                </span>
                {[
                  { n: 1, label: "01 Capture" },
                  { n: 2, label: "02 AI Enrich" },
                  { n: 3, label: "03 Search" },
                ].map((s) => (
                  <button
                    key={s.n}
                    onClick={() => setActiveStep(s.n)}
                    className={`px-3 py-1 rounded-ds-pill text-[12px] font-medium transition-all ${
                      activeStep === s.n
                        ? "bg-[#4A5D4E] text-white shadow-sm scale-105"
                        : "bg-surface-secondary/80 text-on-surface-secondary hover:text-on-surface hover:bg-surface-secondary"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ---------------- Right Column: Smooth Step Morph ---------------- */}
            <div className="relative w-full max-w-[580px] min-h-[470px]">
              <AnimatePresence mode="wait">
                {activeStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <StepOneVisual />
                  </motion.div>
                )}
                {activeStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <StepTwoVisual />
                  </motion.div>
                )}
                {activeStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <StepThreeVisual />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE / TABLET VIEW: No scroll hijacking; clean interactive tabbed deck  */}
      {/* ========================================================================= */}
      <div className="block lg:hidden container-page px-5 pt-8 pb-12 space-y-10">
        {/* Left Column Copy (Normal Flow on Mobile) */}
        <div className="flex flex-col gap-6 max-w-[560px]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
            <span className="text-brand-secondary text-ds-sm uppercase tracking-[0.2em] font-semibold">
              {socialProof}
            </span>
          </div>

          <h1 className="text-[42px] sm:text-[52px] leading-[1.02] tracking-[-0.035em] text-on-surface font-medium">
            A quiet vault
            <br />
            for a{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-brand-secondary italic font-serif">
                loud
              </span>
              <span className="absolute left-0 right-0 bottom-[6px] h-[7px] bg-brand-tertiary/80 -z-0 rounded-sm" />
            </span>{" "}
            internet.
          </h1>

          <p className="text-on-surface-secondary text-ds-lg leading-[1.55]">
            PostRecaller quietly organizes every link you save — cleans tracking junk, extracts key AI takeaways, and hands them back the instant you search.
          </p>

          <div className="pt-1">
            {IS_WAITLIST_MODE ? (
              <WaitlistForm onCount={onWaitlistCount} testIdPrefix="waitlist-hero-mobile" />
            ) : (
              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  to="/register"
                  className="px-7 py-3.5 rounded-ds-md bg-[#4A5D4E] text-white text-ds-base font-medium shadow-md flex items-center gap-2"
                >
                  <span>Create Free Account</span>
                  <ArrowRight size={18} weight="bold" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-ds-md border border-ds-border bg-surface text-on-surface text-ds-base font-medium"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { Icon: Clock, label: "Sub-Second Ingestion" },
              { Icon: Sparkle, label: "AI Key Takeaways" },
              { Icon: ShieldCheck, label: "Private & Secure" },
              { Icon: Devices, label: "Cloud Vault Anywhere" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-on-surface-secondary text-ds-sm">
                <Icon size={16} weight="regular" className="text-brand" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Interactive 3-Step Deck */}
        <div className="space-y-4 pt-2">
          {/* Step Selector Pills */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 1, title: "1. Capture" },
              { id: 2, title: "2. Enrich" },
              { id: 3, title: "3. Retrieve" },
            ].map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`py-2 px-2 rounded-ds-sm text-center font-medium text-ds-sm transition-all border ${
                  activeStep === step.id
                    ? "bg-brand text-on-brand border-brand shadow-sm"
                    : "bg-surface-secondary border-transparent text-on-surface-secondary hover:text-on-surface"
                }`}
              >
                {step.title}
              </button>
            ))}
          </div>

          {/* Active Card Body */}
          <div className="min-h-[460px]">
            {activeStep === 1 && <StepOneVisual />}
            {activeStep === 2 && <StepTwoVisual />}
            {activeStep === 3 && <StepThreeVisual />}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StickyHeroWorkflow;
