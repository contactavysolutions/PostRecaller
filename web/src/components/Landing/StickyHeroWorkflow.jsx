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
  LockSimple,
} from "@phosphor-icons/react";
import { WaitlistForm } from "@/components/WaitlistForm";
import { IS_WAITLIST_MODE } from "@/constants/config";

// -----------------------------------------------------------------------------
// Visual for Step 1: Share to Capture (Continuous Motion Graphic into Aesthetic Vault)
// -----------------------------------------------------------------------------
function StepOneVisual() {
  return (
    <div className="relative w-full min-h-[480px] h-auto lg:h-[500px] rounded-[24px] bg-surface dark:bg-zinc-900 border border-ds-border/90 dark:border-white/10 p-4 sm:p-7 flex flex-col justify-between overflow-visible lg:overflow-hidden shadow-tier-1">
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
          Tap "Share" on Instagram, TikTok, or X. Posts continuously stream straight into your private encrypted vault.
        </p>
      </div>

      {/* Visual Centerpiece: Continuous Motion Graphic into Aesthetic Vault */}
      <div className="relative z-10 my-auto py-2 w-full flex flex-col items-center">
        {/* Source Hubs Row: Instagram, TikTok, X */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[440px] relative z-20">
          {/* Instagram Source Hub */}
          <div className="rounded-ds-md bg-surface/90 dark:bg-zinc-800/90 border border-ds-border/80 dark:border-white/10 p-2 sm:p-2.5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center text-white shrink-0">
                <InstagramLogo size={12} weight="bold" />
              </span>
              <span className="text-[11px] font-medium text-on-surface truncate">Instagram</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>

          {/* TikTok Source Hub */}
          <div className="rounded-ds-md bg-surface/90 dark:bg-zinc-800/90 border border-ds-border/80 dark:border-white/10 p-2 sm:p-2.5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="w-5 h-5 rounded-md bg-black border border-cyan-400/40 flex items-center justify-center text-white shrink-0">
                <TiktokLogo size={12} weight="bold" />
              </span>
              <span className="text-[11px] font-medium text-on-surface truncate">TikTok</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>

          {/* X Source Hub */}
          <div className="rounded-ds-md bg-surface/90 dark:bg-zinc-800/90 border border-ds-border/80 dark:border-white/10 p-2 sm:p-2.5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="w-5 h-5 rounded-md bg-zinc-900 border border-white/20 flex items-center justify-center text-white shrink-0">
                <XLogo size={12} weight="bold" />
              </span>
              <span className="text-[11px] font-medium text-on-surface truncate">X / Post</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>
        </div>

        {/* Dynamic Motion Conduits & Moving Incoming Posts Container */}
        <div className="relative w-full max-w-[440px] h-[72px] sm:h-[82px] overflow-hidden">
          {/* Fiber-optic conduit lines flowing down into the vault intake */}
          <svg viewBox="0 0 360 80" className="w-full h-full overflow-visible" fill="none">
            <defs>
              <linearGradient id="vaultBeamLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#833ab4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="vaultBeamCenter" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="vaultBeamRight" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#71717a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Background Conduit Guides */}
            <path d="M 60 0 C 60 40, 180 35, 180 78" stroke="rgb(var(--brand))" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.35" />
            <path d="M 180 0 C 180 30, 180 45, 180 78" stroke="rgb(var(--brand-secondary))" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
            <path d="M 300 0 C 300 40, 180 35, 180 78" stroke="rgb(var(--brand))" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.35" />

            {/* Glowing animated flowing pulse beams */}
            <path d="M 60 0 C 60 40, 180 35, 180 78" stroke="url(#vaultBeamLeft)" strokeWidth="2.5" strokeDasharray="8 16" className="animate-pulse" />
            <path d="M 180 0 C 180 30, 180 45, 180 78" stroke="url(#vaultBeamCenter)" strokeWidth="2.5" strokeDasharray="8 16" className="animate-pulse" />
            <path d="M 300 0 C 300 40, 180 35, 180 78" stroke="url(#vaultBeamRight)" strokeWidth="2.5" strokeDasharray="8 16" className="animate-pulse" />
          </svg>

          {/* Continuous Moving Post 1: Instagram Reel */}
          <motion.div
            className="absolute left-[10%] sm:left-[12%] top-0 flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface dark:bg-zinc-800 border border-brand/40 shadow-sm pointer-events-none"
            animate={{
              y: [-6, 26, 56],
              x: [0, 18, 52],
              scale: [0.95, 1, 0.65],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3.3,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-tr from-[#833ab4] to-[#fd1d1d] flex items-center justify-center text-white text-[8px]">
              <InstagramLogo size={9} weight="bold" />
            </span>
            <span className="text-[10px] font-medium text-on-surface truncate max-w-[80px] sm:max-w-[100px]">
              @culinary_arts
            </span>
          </motion.div>

          {/* Continuous Moving Post 2: TikTok Hack */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-0 flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface dark:bg-zinc-800 border border-cyan-500/40 shadow-sm pointer-events-none"
            animate={{
              y: [-6, 28, 56],
              scale: [0.95, 1, 0.65],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3.3,
              repeat: Infinity,
              delay: 1.1,
              ease: "easeInOut",
            }}
          >
            <span className="w-3.5 h-3.5 rounded bg-black flex items-center justify-center text-cyan-400 text-[8px]">
              <TiktokLogo size={9} weight="bold" />
            </span>
            <span className="text-[10px] font-medium text-on-surface truncate max-w-[80px] sm:max-w-[100px]">
              @theepicchef
            </span>
          </motion.div>

          {/* Continuous Moving Post 3: X Thread */}
          <motion.div
            className="absolute right-[10%] sm:right-[12%] top-0 flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface dark:bg-zinc-800 border border-brand/40 shadow-sm pointer-events-none"
            animate={{
              y: [-6, 26, 56],
              x: [0, -18, -52],
              scale: [0.95, 1, 0.65],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3.3,
              repeat: Infinity,
              delay: 2.2,
              ease: "easeInOut",
            }}
          >
            <span className="w-3.5 h-3.5 rounded bg-zinc-900 flex items-center justify-center text-white text-[8px]">
              <XLogo size={9} weight="bold" />
            </span>
            <span className="text-[10px] font-medium text-on-surface truncate max-w-[80px] sm:max-w-[100px]">
              @chefalex
            </span>
          </motion.div>
        </div>

        {/* Central Aesthetic Vault Safe */}
        <div className="w-full max-w-[440px] rounded-2xl bg-gradient-to-b from-[#1c221e] via-[#141815] to-[#0d100e] border border-[#4A5D4E]/60 p-3 sm:p-4 shadow-[0_12px_36px_rgba(0,0,0,0.55),0_0_24px_rgba(74,93,78,0.25)] relative overflow-hidden">
          {/* Subtle vault ambient glow */}
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-44 h-16 bg-emerald-500/15 blur-xl rounded-full" />

          {/* Corner metallic bolt accents */}
          <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-zinc-600/70 border border-zinc-500/40 shadow-inner" />
          <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-zinc-600/70 border border-zinc-500/40 shadow-inner" />
          <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-zinc-600/70 border border-zinc-500/40 shadow-inner" />
          <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-zinc-600/70 border border-zinc-500/40 shadow-inner" />

          {/* Vault Top Readout */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#4A5D4E]/40 border border-[#4A5D4E] flex items-center justify-center text-emerald-400">
                <ShieldCheck size={14} weight="fill" />
              </span>
              <div>
                <p className="text-[11px] font-mono tracking-wider font-semibold text-zinc-100 uppercase leading-none">
                  PostRecaller Vault
                </p>
                <p className="text-[9px] font-mono text-zinc-400 mt-0.5">
                  Private Cloud Architecture
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Ingestion Active</span>
            </div>
          </div>

          {/* Vault Safe Mechanism & Intake Aperture */}
          <div className="flex items-center justify-between gap-3 relative z-10 py-1">
            {/* Left: Interactive Ingestion Metrics */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium">
                <span className="text-emerald-400 font-mono font-bold">⚡ 0.38s</span>
                <span>Sub-Second Intake</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-snug">
                Cleans tracking parameters &amp; extracts canonical post data automatically.
              </p>
              <div className="flex items-center gap-1 text-[9px] font-mono text-[#7ea085]">
                <span>✓ 256-Bit Encrypted</span>
                <span className="text-zinc-600">•</span>
                <span>Zero Cookies</span>
              </div>
            </div>

            {/* Right: Rotating Vault Lock Dial / Intake Aperture */}
            <div className="relative shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16">
              {/* Outer Rotating Dial */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#4A5D4E]/70 animate-[spin_24s_linear_infinite]" />
              {/* Inner Pulsing Safe Portal */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#27352c] to-[#0c100d] border border-emerald-500/40 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] relative">
                <motion.div
                  animate={{ scale: [0.88, 1.08, 0.88] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <LockSimple size={18} weight="fill" className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                </motion.div>
                {/* Continuous Intake Pulse Wave */}
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
              </div>
            </div>
          </div>
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
// (Interactive Switcher: Option A Neural Core vs Option B Laser Scanner)
// -----------------------------------------------------------------------------
function StepTwoVisual() {
  const [optionMode, setOptionMode] = useState("A"); // "A" = Neural Core, "B" = Laser Scanner
  const [phase, setPhase] = useState(0); // 0: churning/scanning, 1: revealing summary, 2: stamping tags, 3: completed hold

  // Cycle animation loop
  useEffect(() => {
    let t1, t2, t3, t4;
    const runCycle = () => {
      setPhase(0);
      t1 = setTimeout(() => setPhase(1), 1600);
      t2 = setTimeout(() => setPhase(2), 2600);
      t3 = setTimeout(() => setPhase(3), 4200);
      t4 = setTimeout(runCycle, 6400);
    };
    runCycle();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [optionMode]);

  return (
    <div className="relative w-full min-h-[480px] h-auto lg:h-[500px] rounded-[24px] bg-surface dark:bg-zinc-900 border border-ds-border/90 dark:border-white/10 p-4 sm:p-7 flex flex-col justify-between overflow-visible lg:overflow-hidden shadow-tier-1">
      {/* Subtle sage backdrop glow */}
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-brand/10 blur-3xl -z-0" />

      {/* Header Badge, Title & Interactive Option Switcher */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-ds-pill bg-brand-tertiary text-brand text-[12px] font-semibold tracking-wide uppercase">
            <Sparkle size={14} weight="bold" />
            <span>Step 02 · AI Key Takeaways</span>
          </div>

          {/* Interactive Option A / Option B Switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-surface-secondary/90 border border-ds-border text-[11px] font-mono">
            <button
              onClick={() => setOptionMode("A")}
              className={`px-2.5 py-0.5 rounded-full transition-all font-medium ${
                optionMode === "A"
                  ? "bg-[#4A5D4E] text-white shadow-sm font-semibold"
                  : "text-on-surface-secondary hover:text-on-surface"
              }`}
            >
              Option A: Neural Core
            </button>
            <button
              onClick={() => setOptionMode("B")}
              className={`px-2.5 py-0.5 rounded-full transition-all font-medium ${
                optionMode === "B"
                  ? "bg-[#4A5D4E] text-white shadow-sm font-semibold"
                  : "text-on-surface-secondary hover:text-on-surface"
              }`}
            >
              Option B: Laser Scanner
            </button>
          </div>
        </div>

        <h3 className="text-ds-xl sm:text-[22px] font-medium text-on-surface tracking-tight">
          AI reads, summarizes, and auto-tags.
        </h3>
        <p className="text-on-surface-secondary text-ds-sm leading-relaxed max-w-[420px]">
          AI distills chaotic posts, audio tracks, and recipes into clear executive takeaways, while taxonomy models assign clean tags.
        </p>
      </div>

      {/* Visual Centerpiece: Extraction Card with Summary & Tags */}
      <div className="relative z-10 my-auto py-2">
        {/* OPTION A: Neural Core & Tag Stamping Engine */}
        {optionMode === "A" && (
          <div className="space-y-2.5 sm:space-y-3">
            {/* AI Neural Core Bar */}
            <div className="rounded-ds-md bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-[#4A5D4E]/60 p-2.5 sm:p-3 shadow-md flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-2.5 relative z-10">
                {/* Rotating AI Aperture Core */}
                <div className="relative w-8 h-8 rounded-full border border-emerald-500/40 flex items-center justify-center bg-emerald-950/40">
                  <div className="absolute inset-0 rounded-full border border-dashed border-emerald-400/60 animate-[spin_8s_linear_infinite]" />
                  <motion.div
                    animate={{ scale: [0.9, 1.2, 0.9], rotate: [0, 180, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkle size={15} weight="fill" className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </motion.div>
                </div>

                <div>
                  <p className="text-[11px] font-mono font-semibold text-zinc-100 flex items-center gap-1.5">
                    <span>Neural Enrichment Core</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400">
                    {phase === 0 && "⚡ Churning audio transcript & recipe..."}
                    {phase === 1 && "✨ Synthesizing 2 key executive takeaways..."}
                    {phase >= 2 && "🏷️ Taxonomy model: 4 tags assigned"}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold relative z-10">
                0.8s analysis
              </span>
            </div>

            {/* AI Executive Summary Card */}
            <motion.div
              className="rounded-ds-md bg-surface-secondary/70 dark:bg-zinc-800/80 border border-ds-border p-3 sm:p-3.5 space-y-2 sm:space-y-2.5 shadow-sm"
              initial={{ opacity: 0.6, y: 4 }}
              animate={{ opacity: phase >= 1 ? 1 : 0.6, y: phase >= 1 ? 0 : 4 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-center justify-between border-b border-ds-border/60 pb-1.5">
                <div className="flex items-center gap-2">
                  <Sparkle size={14} weight="fill" className="text-brand" />
                  <span className="text-ds-sm font-semibold text-on-surface">AI Executive Summary</span>
                </div>
                <span className="text-[10px] font-mono text-brand font-semibold px-1.5 py-0.5 rounded bg-brand-tertiary">
                  Verified Insights
                </span>
              </div>

              {/* Bulleted Key Takeaways */}
              <div className="p-2 sm:p-2.5 rounded bg-surface dark:bg-black/30 text-[11px] sm:text-[12px] text-on-surface leading-relaxed border border-ds-border/40 space-y-1.5 relative overflow-hidden">
                {phase === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full pointer-events-none" />
                )}
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
              <div className="flex items-center justify-between px-2.5 py-1 rounded bg-brand/5 border border-brand/20 text-[11px]">
                <span className="text-on-surface-secondary font-mono uppercase tracking-wider text-[9px] sm:text-[10px]">Detected Intent</span>
                <span className="text-brand font-semibold flex items-center gap-1.5 text-[11px]">
                  <ChefHat size={13} weight="bold" />
                  Try Recipe
                </span>
              </div>
            </motion.div>

            {/* Dynamic Tag Stamping Pill Stack */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
              <span className="text-[10px] sm:text-[11px] font-mono text-on-surface-secondary uppercase tracking-wider mr-1">
                Generated Tags:
              </span>
              {[
                { name: "#recipe", bg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20", delay: 0 },
                { name: "#mushrooms", bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20", delay: 0.15 },
                { name: "#quickdinner", bg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20", delay: 0.3 },
                { name: "#culinary", bg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20", delay: 0.45 },
              ].map((tag) => (
                <motion.span
                  key={tag.name}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-ds-pill text-[11px] sm:text-[12px] font-medium border flex items-center gap-1 ${tag.bg}`}
                  initial={{ scale: 0.8, opacity: 0.4 }}
                  animate={{
                    scale: phase >= 2 ? [0.8, 1.15, 1.0] : 0.85,
                    opacity: phase >= 2 ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.3, delay: tag.delay }}
                >
                  <Tag size={11} weight="bold" />
                  {tag.name}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* OPTION B: Holographic Laser Dissector */}
        {optionMode === "B" && (
          <div className="space-y-2.5 sm:space-y-3">
            {/* Top Raw Social Item with sweeping laser beam */}
            <div className="relative rounded-ds-md bg-zinc-900 border border-ds-border p-3 overflow-hidden shadow-sm">
              {/* Sweeping Emerald Laser Beam */}
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10B981] z-20 pointer-events-none"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center text-white text-[10px]">
                    <InstagramLogo size={12} weight="bold" />
                  </span>
                  <span className="text-[11px] font-mono text-zinc-300">Raw Post Intake: @theepicchef</span>
                </div>
                {/* Audio Equalizer Waveform indicator */}
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-emerald-400 animate-pulse rounded-full" />
                  <span className="w-1 h-4 bg-emerald-400 animate-pulse delay-75 rounded-full" />
                  <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                  <span className="w-1 h-3.5 bg-emerald-400 animate-pulse delay-100 rounded-full" />
                </div>
              </div>

              <div className="text-[11px] text-zinc-300 space-y-1">
                <p className="font-semibold text-white">Creamy Mushroom &amp; Spinach Soup (Reel · 0:48)</p>
                <p className="text-zinc-400 text-[10px]">
                  Audio Transcript: "15-minute quick skillet recipe using fresh cremini mushrooms... deglaze with dry white wine..."
                </p>
              </div>
            </div>

            {/* Laser Extracted Structured Takeaways */}
            <div className="rounded-ds-md bg-surface-secondary/80 dark:bg-zinc-800/80 border border-emerald-500/30 p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Sparkle size={13} weight="fill" />
                  Synthesized Extraction Output
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  X-Ray Completed
                </span>
              </div>

              <div className="p-2 rounded bg-surface dark:bg-black/30 text-[11px] text-on-surface leading-relaxed border border-ds-border/40 space-y-1">
                <p>• 15-minute skillet dinner using cremini mushrooms &amp; shallots.</p>
                <p>• Deglaze with dry white wine and blend with coconut cream.</p>
              </div>
            </div>

            {/* Extracted Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-mono text-on-surface-secondary uppercase tracking-wider mr-1">
                Extracted Tags:
              </span>
              {[
                { name: "#recipe", bg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" },
                { name: "#mushrooms", bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" },
                { name: "#quickdinner", bg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" },
                { name: "#culinary", bg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20" },
              ].map((tag) => (
                <span
                  key={tag.name}
                  className={`px-2 py-0.5 rounded-ds-pill text-[11px] font-medium border flex items-center gap-1 ${tag.bg}`}
                >
                  <Tag size={11} weight="bold" />
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
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
// (Living Reactive Keystroke Simulation Engine)
// -----------------------------------------------------------------------------
function StepThreeVisual() {
  const fullQuery = "creamy mushroom soup";
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let timeoutId;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
      if (!isDeleting) {
        if (charIndex <= fullQuery.length) {
          setTypedText(fullQuery.slice(0, charIndex));
          charIndex++;
          setIsTyping(true);
          setShowResult(charIndex > 8);

          const delay = charIndex > 0 && fullQuery[charIndex - 1] === " " ? 220 : 85 + Math.random() * 45;
          timeoutId = setTimeout(tick, delay);
        } else {
          setIsTyping(false);
          setShowResult(true);
          timeoutId = setTimeout(() => {
            isDeleting = true;
            tick();
          }, 3600);
        }
      } else {
        charIndex = 0;
        isDeleting = false;
        setShowResult(false);
        setTypedText("");
        timeoutId = setTimeout(tick, 600);
      }
    };

    tick();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative w-full min-h-[480px] h-auto lg:h-[500px] rounded-[24px] bg-surface dark:bg-zinc-900 border border-ds-border/90 dark:border-white/10 p-4 sm:p-7 flex flex-col justify-between overflow-visible lg:overflow-hidden shadow-tier-1">
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

      {/* Visual Centerpiece: Living Reactive Search Bar + Result Card */}
      <div className="relative z-10 my-auto py-2 space-y-2.5 sm:space-y-3">
        {/* Living Reactive Search Bar */}
        <div
          className={`w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-ds-md bg-surface dark:bg-zinc-800 border transition-all duration-300 shadow-sm flex items-center justify-between ${
            isTyping
              ? "border-[#4A5D4E] shadow-[0_0_16px_rgba(74,93,78,0.3)] ring-1 ring-[#4A5D4E]/50"
              : "border-brand/50"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-2.5 text-on-surface text-ds-sm font-medium min-w-0">
            <MagnifyingGlass size={16} weight="bold" className="text-brand shrink-0" />
            <span className="truncate">
              {typedText}
              <span className="w-1.5 h-4 bg-brand animate-pulse inline-block align-middle ml-0.5" />
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {isTyping ? (
              <span className="text-[10px] font-mono text-zinc-400 bg-surface-secondary px-2 py-0.5 rounded animate-pulse">
                vector lookup...
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                ⚡ 0.18s lookup
              </span>
            )}
          </div>
        </div>

        {/* Emergent Result Card with Keyword Matches Highlighted */}
        <div className="min-h-[200px]">
          <AnimatePresence mode="wait">
            {showResult && (
              <motion.div
                key="search-result"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-ds-md bg-surface dark:bg-zinc-800 border border-[#4A5D4E]/40 p-3 sm:p-3.5 shadow-md space-y-2 sm:space-y-2.5 relative overflow-hidden"
              >
                {/* Result Header */}
                <div className="flex items-center justify-between border-b border-ds-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=100&q=80"
                      alt="Avatar"
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-ds-sm font-semibold text-on-surface leading-tight flex items-center gap-1">
                        <span>@theepicchef</span>
                        <CheckCircle size={13} weight="fill" className="text-brand" />
                      </p>
                      <p className="text-[10px] text-on-surface-secondary font-mono">Instagram Reel · 0:48</p>
                    </div>
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Top Match · 99.4%
                  </span>
                </div>

                {/* Title with highlighted match */}
                <h4 className="text-ds-base font-semibold text-on-surface leading-snug">
                  <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1 rounded font-bold">
                    Creamy Mushroom
                  </span>{" "}
                  &amp; Spinach Soup Recipe
                </h4>

                {/* AI Summary Box */}
                <div className="p-2 rounded bg-surface-secondary/80 dark:bg-black/30 border border-ds-border/40 text-[11px] text-on-surface-secondary leading-relaxed">
                  <span className="font-semibold text-brand mr-1">💡 AI Summary:</span>
                  "15-minute quick dinner recipe using blended coconut milk, sautéed oyster{" "}
                  <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-0.5 rounded font-medium">
                    mushrooms
                  </span>
                  , and cracked black pepper."
                </div>

                {/* Tags & Action */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="px-1.5 sm:px-2 py-0.5 rounded bg-brand-tertiary text-brand text-[10px] font-medium">
                      #recipe
                    </span>
                    <span className="px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                      #mushrooms
                    </span>
                    <span className="px-1.5 sm:px-2 py-0.5 rounded bg-brand-tertiary text-brand text-[10px] font-medium">
                      #healthy
                    </span>
                  </div>
                  <button className="text-[11px] sm:text-[12px] font-medium text-brand hover:underline flex items-center gap-1">
                    <span>Open Link</span>
                    <ArrowRight size={12} weight="bold" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

  // Track active step based on scroll threshold (ONLY on desktop >= 1024px)
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Do not hijack scroll on mobile/tablet screens!
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        return;
      }
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
            <div className="relative w-full max-w-[580px] min-h-[480px]">
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
      <div className="block lg:hidden container-page px-4 sm:px-5 pt-8 pb-12 space-y-8">
        {/* Left Column Copy (Normal Flow on Mobile) */}
        <div className="flex flex-col gap-6 max-w-[560px]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
            <span className="text-brand-secondary text-ds-sm uppercase tracking-[0.2em] font-semibold">
              {socialProof}
            </span>
          </div>

          <h1 className="text-[40px] sm:text-[52px] leading-[1.02] tracking-[-0.035em] text-on-surface font-medium">
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
                    ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-sm font-semibold"
                    : "bg-surface-secondary border-transparent text-on-surface-secondary hover:text-on-surface"
                }`}
              >
                {step.title}
              </button>
            ))}
          </div>

          {/* Active Card Body - with auto height and zero clipping */}
          <div className="w-full min-h-[480px]">
            <AnimatePresence mode="wait">
              {activeStep === 1 && (
                <motion.div
                  key="mobile-step-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <StepOneVisual />
                </motion.div>
              )}
              {activeStep === 2 && (
                <motion.div
                  key="mobile-step-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <StepTwoVisual />
                </motion.div>
              )}
              {activeStep === 3 && (
                <motion.div
                  key="mobile-step-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <StepThreeVisual />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StickyHeroWorkflow;
