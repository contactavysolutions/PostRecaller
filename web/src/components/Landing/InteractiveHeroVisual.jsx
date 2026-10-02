import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkle,
  MagnifyingGlass,
  ArrowRight,
  Play,
  Pause,
  ArrowClockwise,
  CheckCircle,
  Tag,
  BookmarkSimple,
  Clock,
  InstagramLogo,
  TiktokLogo,
  XLogo,
  ChefHat,
  Lightning,
} from "@phosphor-icons/react";

const DEMO_STEPS = [
  { id: 1, title: "1. Capture", label: "Drop any link from Instagram, TikTok, or X" },
  { id: 2, title: "2. AI Enrichment", label: "Instant summary, transcript & auto-tagging" },
  { id: 3, title: "3. Retrieve", label: "Search by flavor, topic, or half-remembered phrase" },
];

const SEARCH_QUERY = "creamy mushroom soup";

export function InteractiveHeroVisual() {
  const shouldReduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [hoveredTag, setHoveredTag] = useState(null);
  const timerRef = useRef(null);

  // Auto-play loop across the 3 steps
  useEffect(() => {
    if (!isPlaying) return;

    if (activeStep === 1) {
      setTypedText("");
      timerRef.current = setTimeout(() => {
        setActiveStep(2);
      }, 3400);
    } else if (activeStep === 2) {
      timerRef.current = setTimeout(() => {
        setActiveStep(3);
      }, 3800);
    } else if (activeStep === 3) {
      // Typing simulation in step 3
      let currentIdx = 0;
      const typeInterval = setInterval(() => {
        if (currentIdx <= SEARCH_QUERY.length) {
          setTypedText(SEARCH_QUERY.slice(0, currentIdx));
          currentIdx++;
        } else {
          clearInterval(typeInterval);
          // Wait after query typed, then loop back
          timerRef.current = setTimeout(() => {
            setActiveStep(1);
            setTypedText("");
          }, 3200);
        }
      }, 75);

      return () => {
        clearInterval(typeInterval);
        clearTimeout(timerRef.current);
      };
    }

    return () => clearTimeout(timerRef.current);
  }, [activeStep, isPlaying]);

  const handleManualStep = (step) => {
    setIsPlaying(false);
    setActiveStep(step);
    if (step === 3) {
      setTypedText(SEARCH_QUERY);
    } else {
      setTypedText("");
    }
  };

  const handleRestart = () => {
    setActiveStep(1);
    setTypedText("");
    setIsPlaying(true);
  };

  return (
    <div
      className="relative w-full max-w-[640px] mx-auto select-none"
      data-testid="interactive-hero-visual"
    >
      {/* Ambient specular background glow behind the window */}
      <div
        className="pointer-events-none absolute -inset-4 md:-inset-8 rounded-[36px] bg-gradient-to-tr from-brand/20 via-brand-secondary/15 to-transparent blur-3xl opacity-70 -z-10"
        aria-hidden
      />

      {/* Main Glassmorphic Container (Linear/macOS style window) */}
      <div className="relative rounded-[20px] md:rounded-[24px] border border-ds-border-strong/70 dark:border-white/10 bg-surface/90 dark:bg-[#161716]/90 backdrop-blur-2xl shadow-[0_24px_50px_-12px_rgba(28,28,26,0.18),0_0_0_1px_rgba(255,255,255,0.08)_inset] overflow-hidden">
        {/* Top Window Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ds-border/70 dark:border-white/5 bg-surface-secondary/60 dark:bg-white/[0.02]">
          {/* macOS window control pills */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80 border border-[#E0443E]/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80 border border-[#DEA123]/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80 border border-[#1AAB29]/50" />
            <span className="ml-2 text-[11px] font-mono tracking-wider uppercase text-on-surface-secondary/70">
              postrecaller.vault
            </span>
          </div>

          {/* Interactive Play/Pause & Step Status */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause demo" : "Resume demo"}
              aria-label={isPlaying ? "Pause demo" : "Resume demo"}
              className="p-1.5 rounded-ds-pill text-on-surface-secondary hover:text-on-surface hover:bg-surface-tertiary transition-colors"
            >
              {isPlaying ? <Pause size={13} weight="bold" /> : <Play size={13} weight="fill" />}
            </button>
            <button
              onClick={handleRestart}
              title="Restart demo"
              aria-label="Restart demo"
              className="p-1.5 rounded-ds-pill text-on-surface-secondary hover:text-on-surface hover:bg-surface-tertiary transition-colors"
            >
              <ArrowClockwise size={13} weight="bold" />
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Search Bar Mockup */}
        <div className="px-5 pt-4 pb-3 border-b border-ds-border/50 dark:border-white/5">
          <div
            className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-ds-md border transition-all duration-300 ${
              activeStep === 3
                ? "bg-brand/10 border-brand/40 shadow-[0_0_15px_rgba(74,93,78,0.2)]"
                : "bg-surface-secondary/50 dark:bg-white/[0.03] border-ds-border dark:border-white/5"
            }`}
          >
            <MagnifyingGlass
              size={17}
              weight="bold"
              className={activeStep === 3 ? "text-brand" : "text-on-surface-secondary"}
            />
            <div className="flex-1 text-ds-base flex items-center font-normal">
              {activeStep === 3 ? (
                <span className="text-on-surface font-medium">
                  {typedText}
                  <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-brand animate-pulse" />
                </span>
              ) : (
                <span className="text-on-surface-secondary/70">
                  Search by ingredient, half-remembered phrase, or topic…
                </span>
              )}
            </div>
            {activeStep === 3 && typedText.length > 5 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-0.5 rounded-ds-pill bg-brand text-on-brand text-[11px] font-medium flex items-center gap-1 shrink-0"
              >
                <Lightning size={12} weight="fill" />
                <span>0.04s semantic match</span>
              </motion.span>
            )}
          </div>
        </div>

        {/* Main Interactive Stage Area */}
        <div className="p-5 md:p-6 min-h-[340px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* ----------------- STEP 1: DROP SOCIAL LINK ----------------- */}
            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-tertiary text-brand flex items-center justify-center text-[12px] font-bold">
                      1
                    </span>
                    <span className="text-ds-sm font-semibold uppercase tracking-wider text-brand">
                      Incoming Share
                    </span>
                  </div>
                  <span className="text-ds-sm text-on-surface-secondary font-mono">
                    clipboard: detected
                  </span>
                </div>

                {/* Simulated Incoming Link Notification Card */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 340, damping: 28 }}
                  className="p-4 rounded-ds-lg bg-surface border border-ds-border dark:border-white/10 shadow-tier-1 relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-ds-md bg-gradient-to-tr from-[#FD1D1D] to-[#F56040] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <InstagramLogo size={24} weight="bold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-ds-pill text-[10px] font-semibold uppercase tracking-wider bg-[#1877F2]/10 text-[#1877F2]">
                          Instagram Reel
                        </span>
                        <span className="text-on-surface-secondary text-[12px]">Shared 1m ago</span>
                      </div>
                      <p className="text-on-surface font-semibold text-ds-base mt-1 truncate">
                        https://instagram.com/reel/C8x9Km2_SoupRecipe
                      </p>
                      <p className="text-on-surface-secondary text-ds-sm line-clamp-1 mt-0.5">
                        Raw caption: "The only autumnal soup you will ever crave 🥣✨ Save this for a rainy evening!"
                      </p>
                    </div>
                  </div>

                  {/* Pulsing indicator pill */}
                  <div className="mt-3.5 pt-3 border-t border-ds-border/60 flex items-center justify-between text-ds-sm">
                    <span className="flex items-center gap-2 text-on-surface-secondary">
                      <span className="w-2 h-2 rounded-full bg-brand-secondary animate-ping" />
                      Capturing stream & media frames…
                    </span>
                    <span className="text-brand font-medium flex items-center gap-1">
                      <span>Sending to AI</span>
                      <ArrowRight size={13} weight="bold" />
                    </span>
                  </div>
                </motion.div>

                {/* Floating other platform badges to show universality */}
                <div className="flex items-center gap-2 pt-1 text-ds-sm text-on-surface-secondary">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-secondary/70">
                    Works identically for:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-ds-pill bg-surface-secondary text-[11px] font-medium border border-ds-border">
                      <TiktokLogo size={12} weight="bold" /> TikTok
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-ds-pill bg-surface-secondary text-[11px] font-medium border border-ds-border">
                      <XLogo size={12} weight="bold" /> X Threads
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-ds-pill bg-surface-secondary text-[11px] font-medium border border-ds-border">
                      YouTube Shorts
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ----------------- STEP 2: AI EXTRACTION & AUTO-TAGGING ----------------- */}
            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand text-on-brand flex items-center justify-center text-[12px] font-bold">
                      2
                    </span>
                    <span className="text-ds-sm font-semibold uppercase tracking-wider text-brand">
                      AI Reading & Synthesizing
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-ds-sm text-brand font-medium">
                    <Sparkle size={14} weight="fill" className="animate-pulse" />
                    AI Neural Enrichment
                  </span>
                </div>

                {/* Enriched Live Card Transformation */}
                <div className="relative p-4 rounded-ds-lg bg-surface border border-brand/30 dark:border-brand/40 shadow-tier-1 overflow-hidden">
                  {/* Glowing scanline effect across the card */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-brand/15 to-transparent pointer-events-none"
                  />

                  <div className="flex items-start gap-3.5">
                    {/* Real preview thumbnail */}
                    <div className="w-16 h-16 rounded-ds-md bg-amber-900/10 border border-amber-600/20 text-amber-700 flex items-center justify-center shrink-0 relative overflow-hidden">
                      <ChefHat size={28} weight="duotone" />
                      <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/75 rounded text-[9px] text-white font-mono">
                        0:48
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-ds-pill text-[10px] font-semibold uppercase tracking-wider bg-brand-tertiary text-brand">
                          Recipe · Enriched
                        </span>
                        <span className="text-[12px] text-on-surface-secondary">by @chefmarcus</span>
                      </div>
                      <h4 className="text-on-surface font-semibold text-ds-base mt-1">
                        Rustic Creamy Hungarian Mushroom Soup
                      </h4>
                      <p className="text-on-surface-secondary text-[12.5px] leading-relaxed mt-1">
                        Caramelized cremini and shiitake mushrooms with smoked paprika, fresh thyme, rich vegetable broth, and sour cream swirl.
                      </p>
                    </div>
                  </div>

                  {/* Auto-generated AI tags popping in */}
                  <div className="mt-3.5 pt-3 border-t border-ds-border/60 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {["#recipe", "#mushroom-soup", "#dinner-idea", "#vegetarian"].map(
                        (tag, idx) => (
                          <motion.span
                            key={tag}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.15 * idx, type: "spring" }}
                            className="px-2 py-0.5 rounded-ds-pill text-[11px] font-medium bg-brand/10 text-brand border border-brand/20 flex items-center gap-1"
                          >
                            <Tag size={10} weight="bold" />
                            {tag}
                          </motion.span>
                        )
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-on-surface-secondary">
                      auto-tagged in 0.8s
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-ds-sm text-on-surface-secondary px-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={15} weight="fill" className="text-ds-success" />
                    Indexed into semantic vector vault
                  </span>
                  <span className="text-brand font-medium">Ready for search →</span>
                </div>
              </motion.div>
            )}

            {/* ----------------- STEP 3: SEMANTIC NATURAL LANGUAGE SEARCH ----------------- */}
            {activeStep === 3 && (
              <motion.div
                key="step-3"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-secondary text-on-brand-secondary flex items-center justify-center text-[12px] font-bold">
                      3
                    </span>
                    <span className="text-ds-sm font-semibold uppercase tracking-wider text-brand-secondary">
                      Instant Retrieval
                    </span>
                  </div>
                  <span className="text-ds-sm text-on-surface-secondary">
                    1 of 248 saved links matched
                  </span>
                </div>

                {/* Filtered Exact Card Match Highlighted */}
                <motion.div
                  initial={{ scale: 0.96 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="p-4 rounded-ds-lg bg-surface border-2 border-brand shadow-[0_12px_28px_-6px_rgba(74,93,78,0.25)] relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-ds-pill text-[10px] font-bold uppercase tracking-wider bg-brand text-on-brand">
                        Top Result · 99% Confidence
                      </span>
                      <span className="text-[12px] text-brand-secondary font-medium">
                        Intent: Try Recipe
                      </span>
                    </div>
                    <span className="text-ds-sm text-on-surface-secondary font-mono flex items-center gap-1">
                      <Clock size={12} /> saved 3 weeks ago
                    </span>
                  </div>

                  <h4 className="text-on-surface font-semibold text-ds-lg mt-2">
                    Rustic Creamy Hungarian Mushroom Soup
                  </h4>
                  <p className="text-on-surface-secondary text-ds-sm leading-relaxed mt-1">
                    Caramelized cremini and shiitake mushrooms with smoked paprika, fresh thyme, rich vegetable broth, and sour cream swirl.
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-ds-border/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {["#recipe", "#mushroom-soup", "#dinner-idea"].map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-ds-pill text-[11px] font-medium bg-surface-secondary text-on-surface border border-ds-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="px-3 py-1 rounded-ds-sm bg-brand text-on-brand text-ds-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1">
                      <span>Open Link</span>
                      <ArrowRight size={12} weight="bold" />
                    </button>
                  </div>
                </motion.div>

                {/* Subdued unmatched card (illustrating fuzzy search filtering out noise) */}
                <div className="p-2.5 rounded-ds-md bg-surface-secondary/40 border border-ds-border/40 opacity-40 blur-[0.4px] flex items-center justify-between">
                  <span className="text-ds-sm text-on-surface-secondary line-through">
                    Tokyo Street Photography Best Spots (Unmatched)
                  </span>
                  <span className="text-[11px] text-on-surface-secondary">Filtered out</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Interactive Step Indicator Rail */}
        <div className="px-4 py-3 bg-surface-secondary/70 dark:bg-white/[0.02] border-t border-ds-border/60 dark:border-white/5 flex items-center justify-between gap-2">
          {DEMO_STEPS.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => handleManualStep(step.id)}
                className={`flex-1 py-1.5 px-2 rounded-ds-sm text-left transition-all duration-200 ${
                  isActive
                    ? "bg-surface dark:bg-zinc-800 shadow-sm border border-ds-border dark:border-white/10"
                    : "hover:bg-surface/50 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-brand animate-pulse" : "bg-on-surface-secondary/40"
                    }`}
                  />
                  <span
                    className={`text-[12px] tracking-tight block truncate ${
                      isActive ? "font-semibold text-on-surface" : "font-normal text-on-surface-secondary"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
