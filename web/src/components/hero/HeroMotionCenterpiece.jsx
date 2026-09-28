import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  Sparkles,
  Share2,
  Play,
  Check,
  CheckCircle2,
  Tag,
  Bookmark,
  ArrowRight,
  ArrowDown,
  Layers,
  FileText,
  Clock,
  RotateCcw,
  Pause,
  ExternalLink,
  Volume2,
} from "lucide-react";

// Official platform SVG logos for exact fidelity
function InstagramGlyph({ className = "w-4 h-4 text-white" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TiktokGlyph({ className = "w-4 h-4 text-white" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.28 8.28 0 0 0 5.02 1.68V7.27a4.84 4.84 0 0 1-1.25-.58z"/>
    </svg>
  );
}

function XGlyph({ className = "w-4 h-4 text-white" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// -----------------------------------------------------------------------------
// Isometric 3D Vault Wireframe Cube with Concentric Energy Ripple Rings
// -----------------------------------------------------------------------------
function IsometricVaultCube({ isEnriching = false, isRetrieving = false }) {
  return (
    <div className="relative w-[280px] h-[210px] mx-auto flex items-center justify-center select-none">
      <svg
        viewBox="0 0 280 220"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Luminous emerald inner glow */}
          <radialGradient id="cubeCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#15803d" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
          </radialGradient>

          {/* Wireframe edge glow */}
          <filter id="cubeEdgeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Top intake portal glow */}
          <radialGradient id="intakePulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#4ade80" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric Ground Ripples / Water Echoes */}
        <g opacity="0.85">
          <ellipse
            cx="140"
            cy="176"
            rx="125"
            ry="46"
            fill="none"
            stroke="rgba(74, 222, 128, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          <ellipse
            cx="140"
            cy="176"
            rx="96"
            ry="35"
            fill="none"
            stroke="rgba(74, 222, 128, 0.22)"
            strokeWidth="1.2"
          />
          <ellipse
            cx="140"
            cy="176"
            rx="65"
            ry="24"
            fill="none"
            stroke="rgba(74, 222, 128, 0.4)"
            strokeWidth="1.5"
          />
        </g>

        {/* Vertical Beam of Light (Phases 2 & 3) */}
        {(isEnriching || isRetrieving) && (
          <g>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.45" />
              <stop offset="85%" stopColor="#4ade80" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </linearGradient>
            <polygon
              points="105,-40 175,-40 160,116 120,116"
              fill="url(#beamGradient)"
              opacity="0.75"
            />
          </g>
        )}

        {/* Isometric Wireframe Glass Cube */}
        <g filter="url(#cubeEdgeGlow)">
          {/* Inner illuminated energy core */}
          <circle
            cx="140"
            cy="128"
            r={isEnriching ? "34" : "26"}
            fill="url(#cubeCoreGlow)"
            className="transition-all duration-700"
          />

          {/* Hidden/Back inner edges */}
          <path
            d="M 140 84 L 140 144 M 85 160 L 140 144 M 195 160 L 140 144"
            fill="none"
            stroke="rgba(74, 222, 128, 0.25)"
            strokeWidth="1.2"
            strokeDasharray="2 3"
          />

          {/* Top Face (Rhombus) */}
          <polygon
            points="140,84 195,100 140,116 85,100"
            fill="rgba(74, 222, 128, 0.08)"
            stroke="rgba(143, 166, 147, 0.95)"
            strokeWidth="1.7"
          />

          {/* Left Face */}
          <polygon
            points="85,100 140,116 140,176 85,160"
            fill="rgba(74, 222, 128, 0.05)"
            stroke="rgba(143, 166, 147, 0.95)"
            strokeWidth="1.7"
          />

          {/* Right Face */}
          <polygon
            points="140,116 195,100 195,160 140,176"
            fill="rgba(74, 222, 128, 0.12)"
            stroke="rgba(143, 166, 147, 0.95)"
            strokeWidth="1.7"
          />

          {/* Center Vertical Front Spine */}
          <line
            x1="140"
            y1="116"
            x2="140"
            y2="176"
            stroke="#4ade80"
            strokeWidth="2"
            opacity="0.9"
          />
        </g>

        {/* Luminous Intake Node at Top Vertex */}
        <circle
          cx="140"
          cy="84"
          r="6"
          fill="url(#intakePulse)"
          className="animate-ping opacity-75"
        />
        <circle
          cx="140"
          cy="84"
          r="4"
          fill="#ffffff"
          stroke="#4ade80"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Callout Annotation Pin with Leader Line & Glowing Dot
// -----------------------------------------------------------------------------
function CalloutBadge({ number = "1", title = "", subtext = "", align = "right" }) {
  return (
    <div
      className={`flex items-center gap-3.5 select-none ${
        align === "left" ? "flex-row-reverse text-right" : "text-left"
      }`}
    >
      {/* Animated Glowing Pin Node */}
      <div className="relative flex items-center justify-center shrink-0">
        <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 animate-ping absolute" />
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-white shadow-[0_0_12px_rgba(74,222,128,1)] z-10" />
        {/* Connecting horizontal leader line */}
        <div
          className={`hidden sm:block absolute top-1/2 w-8 h-[1px] bg-gradient-to-r ${
            align === "left"
              ? "right-full from-emerald-400/80 to-transparent"
              : "left-full from-emerald-400/80 to-transparent"
          }`}
        />
      </div>

      <div className="space-y-0.5">
        <h4 className="text-white text-[15px] sm:text-[17px] font-semibold tracking-tight flex items-center gap-1.5">
          <span className="text-emerald-400 font-mono">{number}.</span>
          <span>{title}</span>
        </h4>
        {subtext && (
          <p className="text-zinc-400 text-[12px] sm:text-[13px] leading-snug max-w-[240px]">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PHASE 1: "Share to Capture" Component
// -----------------------------------------------------------------------------
function PhaseOneCapture() {
  return (
    <motion.div
      key="phase-1"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-[540px] flex flex-col items-center justify-between"
    >
      {/* Top Floating Feed Cards */}
      <div className="w-full max-w-[560px] grid grid-cols-3 gap-3 sm:gap-4 px-2 pt-2 z-10">
        {/* Instagram Reel Card */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          className="relative p-[1px] rounded-2xl bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] shadow-[0_8px_24px_rgba(253,29,29,0.2)]"
        >
          <div className="rounded-[15px] bg-[#141d17]/90 backdrop-blur-md p-3 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#833ab4] to-[#fd1d1d] flex items-center justify-center shadow-sm">
                <InstagramGlyph className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Reel</span>
            </div>
            <div className="h-14 sm:h-16 rounded-lg bg-black/40 overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=300&q=80"
                alt="Creamy Soup"
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Play size={10} className="text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
            <p className="text-[11px] font-medium text-white truncate">
              @culinary_arts
            </p>
          </div>
        </motion.div>

        {/* TikTok Card */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="relative p-[1px] rounded-2xl bg-gradient-to-tr from-cyan-400/30 via-white/10 to-pink-500/30 shadow-[0_8px_24px_rgba(34,211,238,0.15)]"
        >
          <div className="rounded-[15px] bg-[#141d17]/90 backdrop-blur-md p-3 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center border border-zinc-800">
                <TiktokGlyph className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-mono text-zinc-400">TikTok</span>
            </div>
            <div className="h-14 sm:h-16 rounded-lg bg-black/40 p-2 flex flex-col justify-end text-[10px] text-zinc-300 font-medium leading-tight">
              <span className="text-emerald-400 text-[9px] uppercase font-mono">15m dinner</span>
              <span className="truncate">Velvety mushroom soup hack</span>
            </div>
            <p className="text-[11px] font-medium text-white truncate">
              @theepicchef
            </p>
          </div>
        </motion.div>

        {/* X Post Card */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="relative p-[1px] rounded-2xl bg-gradient-to-tr from-white/20 via-white/5 to-white/10 shadow-[0_8px_24px_rgba(255,255,255,0.06)]"
        >
          <div className="rounded-[15px] bg-[#141d17]/90 backdrop-blur-md p-3 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-700">
                <XGlyph className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Thread</span>
            </div>
            <div className="h-14 sm:h-16 rounded-lg bg-black/40 p-2 flex flex-col justify-center text-[10px] text-zinc-300 leading-tight">
              <span>"The secret to restaurant-grade soup..."</span>
              <span className="text-zinc-500 text-[9px] mt-1">🧵 6 posts</span>
            </div>
            <p className="text-[11px] font-medium text-white truncate">
              @alex_gourmet
            </p>
          </div>
        </motion.div>
      </div>

      {/* SVG Connecting Flow Lines (Bezier Ribbons) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg
          viewBox="0 0 600 540"
          className="w-full h-full"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="instaFlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fd1d1d" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fcb045" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="tiktokFlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="xFlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#a1a1aa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Left Cable from IG */}
          <path
            d="M 120 120 C 120 220, 280 230, 300 350"
            fill="none"
            stroke="url(#instaFlow)"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="animate-[dash_12s_linear_infinite]"
          />

          {/* Center Cable from TikTok */}
          <path
            d="M 300 120 C 300 200, 300 250, 300 350"
            fill="none"
            stroke="url(#tiktokFlow)"
            strokeWidth="3"
            strokeDasharray="8 6"
            className="animate-[dash_10s_linear_infinite]"
          />

          {/* Right Cable from X */}
          <path
            d="M 480 120 C 480 220, 320 230, 300 350"
            fill="none"
            stroke="url(#xFlow)"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="animate-[dash_12s_linear_infinite]"
          />
        </svg>
      </div>

      {/* Central Isometric Vault Cube Container */}
      <div className="relative mt-auto mb-6 z-10">
        <IsometricVaultCube isEnriching={false} />

        {/* Floating Callout 1 (Matches Mockup Blueprint) */}
        <div className="absolute -right-2 sm:-right-24 top-12 z-20">
          <CalloutBadge
            number="1"
            title="Share to Capture"
            subtext="Click &quot;Share&quot; and select &quot;PostRecaller&quot;"
            align="right"
          />
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// PHASE 2: "AI Enriches with Tags & Transcripts" Component
// -----------------------------------------------------------------------------
function PhaseTwoEnrich() {
  return (
    <motion.div
      key="phase-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-[540px] flex flex-col items-center justify-between"
    >
      {/* Top Search Intake Indicator */}
      <div className="w-full max-w-[380px] px-4 pt-2 z-10 flex flex-col items-center">
        <div className="w-full px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center gap-2.5 text-zinc-400 text-sm shadow-inner">
          <Search size={15} className="text-zinc-500" />
          <span className="text-xs font-mono">Search your post vaults...</span>
        </div>
      </div>

      {/* Central Vault Cube with Projection Light */}
      <div className="relative my-auto flex flex-col items-center z-10">
        <IsometricVaultCube isEnriching={true} />

        {/* Unfolding 3D Fan Stack of Metadata Cards (Projecting from Cube) */}
        <div className="absolute left-[52%] sm:left-[54%] top-[-25px] sm:top-[-15px] w-[230px] sm:w-[270px] z-20 pointer-events-none">
          {/* Card 1: Video Preview & Creator */}
          <motion.div
            initial={{ opacity: 0, x: -25, rotateZ: 0 }}
            animate={{ opacity: 0.85, x: 0, rotateZ: -5 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="p-2.5 sm:p-3 rounded-2xl bg-[#16221a]/95 border border-white/10 shadow-xl backdrop-blur-md mb-[-50px]"
          >
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=120&q=80"
                alt="soup"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover"
              />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-white">@theepicchef</p>
                <p className="text-zinc-400 font-mono text-[10px]">Instagram Reel · 0:48</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Audio Transcript & Shimmering OCR */}
          <motion.div
            initial={{ opacity: 0, x: -15, rotateZ: 0 }}
            animate={{ opacity: 0.95, x: 10, rotateZ: -1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-3 sm:p-3.5 rounded-2xl bg-[#131c16]/98 border border-emerald-500/30 shadow-2xl backdrop-blur-md relative overflow-hidden space-y-2"
          >
            {/* Active Scanline Laser Beam */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#4ade80]"
            />

            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <Sparkles size={12} />
                AI Summary
              </span>
              <span className="text-[9px] font-mono text-zinc-500">0.8s</span>
            </div>

            <div className="space-y-1 text-[10.5px] sm:text-[11px] text-zinc-300 font-sans leading-relaxed">
              <p className="opacity-90">
                "15-min skillet recipe: sauté sliced cremini in butter with shallots and thyme."
              </p>
              <p className="opacity-70 text-[9.5px]">
                "Blend with coconut cream for a rich, velvety finish."
              </p>
            </div>
          </motion.div>

          {/* Dynamic Colorful Bouncing Tag Pills */}
          <div className="flex flex-wrap gap-1 mt-2 ml-2">
            {[
              { label: "#culinary", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
              { label: "#recipe", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
              { label: "#mushrooms", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
              { label: "#healthy", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
            ].map((tag, idx) => (
              <motion.span
                key={tag.label}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 24,
                  delay: 0.45 + idx * 0.1,
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium border shadow-sm ${tag.color}`}
              >
                {tag.label}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Callout 2 (Matches Mockup Blueprint) */}
        <div className="absolute left-[-15px] sm:left-[-45px] bottom-1 z-20 max-w-[210px] sm:max-w-[250px]">
          <CalloutBadge
            number="2"
            title="AI Enriches with Tags & Takeaways"
            subtext="AI summarizes key takeaways, cleans metadata, and assigns tags."
            align="left"
          />
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// PHASE 3: "Find Instantly with Semantic Search" Component
// -----------------------------------------------------------------------------
const SEARCH_TARGET_QUERY = "mushroom soup recipe";

function PhaseThreeRetrieve() {
  const [typedChars, setTypedChars] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Typewriter effect
  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx <= SEARCH_TARGET_QUERY.length) {
        setTypedChars(SEARCH_TARGET_QUERY.slice(0, currentIdx));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 70);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="phase-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-[540px] flex flex-col items-center justify-between"
    >
      {/* Top Callout Header (Matches Blueprint) */}
      <div className="flex flex-col items-center gap-1.5 pt-1 z-20 select-none">
        <h4 className="text-white text-[16px] sm:text-[18px] font-semibold tracking-tight flex items-center gap-2">
          <span className="text-emerald-400 font-mono">3.</span>
          <span>Find Instantly with Semantic Search</span>
        </h4>
        <ArrowDown size={14} className="text-emerald-400 animate-bounce" />

        {/* Glowing Search Bar Input Pill */}
        <div className="w-[280px] sm:w-[320px] px-4 py-2.5 rounded-full bg-[#18261e] border border-emerald-400/50 shadow-[0_0_20px_rgba(74,222,128,0.25)] flex items-center gap-2.5 backdrop-blur-md">
          <Search size={15} className="text-emerald-400 shrink-0" />
          <span className="text-white text-xs sm:text-sm font-mono tracking-tight flex items-center">
            {typedChars}
            <span className="w-1.5 h-3.5 bg-emerald-400 ml-0.5 animate-pulse inline-block" />
          </span>
        </div>
      </div>

      {/* 3D Perspective Gallery Wall + Foreground Hero Result */}
      <div className="relative w-full max-w-[560px] h-[400px] flex items-center justify-center mb-2">
        {/* Ambient Specular Warm Glow Behind Result Card */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-brand-secondary/25 to-transparent blur-3xl opacity-75 -z-0 pointer-events-none" />

        {/* Dimmed Background Cards in 3D Curved Perspective */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-0 px-2 sm:px-6">
          {/* Left Dimmed Card 1 */}
          <motion.div
            animate={{
              opacity: isTypingComplete ? 0.22 : 0.45,
              filter: isTypingComplete ? "blur(3px)" : "blur(1px)",
              scale: isTypingComplete ? 0.88 : 0.95,
            }}
            transition={{ duration: 0.5 }}
            style={{ transform: "perspective(800px) rotateY(18deg)" }}
            className="w-36 h-48 rounded-xl bg-zinc-900/80 border border-white/10 p-2.5 hidden sm:flex flex-col gap-2"
          >
            <div className="h-20 rounded bg-zinc-800" />
            <div className="h-3 rounded bg-zinc-800 w-3/4" />
            <div className="h-2.5 rounded bg-zinc-800 w-1/2" />
          </motion.div>

          {/* Right Dimmed Card 2 */}
          <motion.div
            animate={{
              opacity: isTypingComplete ? 0.22 : 0.45,
              filter: isTypingComplete ? "blur(3px)" : "blur(1px)",
              scale: isTypingComplete ? 0.88 : 0.95,
            }}
            transition={{ duration: 0.5 }}
            style={{ transform: "perspective(800px) rotateY(-18deg)" }}
            className="w-36 h-48 rounded-xl bg-zinc-900/80 border border-white/10 p-2.5 hidden sm:flex flex-col gap-2"
          >
            <div className="h-20 rounded bg-zinc-800" />
            <div className="h-3 rounded bg-zinc-800 w-3/4" />
            <div className="h-2.5 rounded bg-zinc-800 w-1/2" />
          </motion.div>
        </div>

        {/* Foreground Highlighted Target Result Card (Matches Blueprint Card) */}
        <motion.div
          initial={{ scale: 0.95, y: 10, opacity: 0 }}
          animate={{
            scale: isTypingComplete ? 1.05 : 1.0,
            y: isTypingComplete ? -8 : 0,
            opacity: 1,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 25 }}
          className="relative z-10 w-[290px] sm:w-[330px] rounded-[22px] bg-[#141f17]/95 border border-emerald-400/50 p-4 shadow-[0_24px_50px_-12px_rgba(74,222,128,0.35),0_0_24px_rgba(74,222,128,0.2)] backdrop-blur-xl"
        >
          {/* Creator Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-500 p-[1.5px]">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-[11px] font-bold text-white">
                  👨‍🍳
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-white text-xs font-semibold">@theepicchef</span>
                  <CheckCircle2 size={12} className="text-emerald-400 fill-emerald-400 text-black" />
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Instagram Reel</span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-500/30">
              99% Match
            </span>
          </div>

          {/* Video Thumbnail with Play Button Overlay */}
          <div className="relative mt-2.5 h-36 rounded-xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"
              alt="Creamy Mushroom & Spinach Soup"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/35 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/40">
                <Play size={16} className="text-white fill-white ml-0.5" />
              </div>
            </div>
            {/* Duration Badge */}
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white">
              0:48
            </span>
          </div>

          {/* Post Title */}
          <h3 className="mt-3 text-white text-sm sm:text-[15px] font-semibold tracking-tight leading-snug">
            Creamy Mushroom & Spinach Soup Recipe
          </h3>

          {/* AI Summary Callout Box */}
          <div className="mt-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-wider">
              <Sparkles size={11} />
              <span>AI Extraction Summary</span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              "15-minute recipe using blended coconut milk and sautéed oyster mushrooms. Perfect for a quick dinner."
            </p>
          </div>

          {/* Tag Badges */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30">
                #recipe
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                #mushrooms
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/30">
                #healthy
              </span>
            </div>

            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <Clock size={11} />
              0.18s
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// MAIN EXPORT: HeroMotionCenterpiece
// Looping Container with Smooth Spring Transitions & User Control
// -----------------------------------------------------------------------------
const PHASES = [
  { id: 1, title: "1. Capture", label: "Share from feeds" },
  { id: 2, title: "2. AI Enrich", label: "Tags & transcripts" },
  { id: 3, title: "3. Semantic Search", label: "Find instantly" },
];

export function HeroMotionCenterpiece() {
  const shouldReduceMotion = useReducedMotion();
  const [activePhase, setActivePhase] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);

  // Auto-advance loop across the 3 sequential phases every 8.5 seconds
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setTimeout(() => {
      setActivePhase((prev) => (prev % 3) + 1);
    }, 8500);

    return () => clearTimeout(timerRef.current);
  }, [activePhase, isPlaying]);

  const handleManualPhase = (phaseId) => {
    setIsPlaying(false);
    setActivePhase(phaseId);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setActivePhase(1);
    setIsPlaying(true);
  };

  return (
    <div
      className="relative w-full max-w-[660px] mx-auto select-none rounded-[28px] md:rounded-[36px] bg-[#0c140e]/95 dark:bg-[#0c140e] border border-white/10 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.8),0_0_60px_-15px_rgba(74,222,128,0.2)] overflow-hidden p-3 sm:p-5"
      data-testid="hero-motion-centerpiece"
    >
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -inset-10 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-950/20 blur-3xl -z-10"
        aria-hidden
      />

      {/* Top Header Rail: Status Badge & Playback Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300">
            PostRecaller Workflow Blueprint
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTogglePlay}
            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title={isPlaying ? "Pause auto-loop" : "Resume auto-loop"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            onClick={handleRestart}
            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Restart from Phase 1"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Active Phase Content Container */}
      <div className="relative min-h-[540px] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {activePhase === 1 && <PhaseOneCapture key="phase-1" />}
          {activePhase === 2 && <PhaseTwoEnrich key="phase-2" />}
          {activePhase === 3 && <PhaseThreeRetrieve key="phase-3" />}
        </AnimatePresence>
      </div>

      {/* Bottom Interactive Phase Selector Rail */}
      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2">
        {PHASES.map((phase) => {
          const isActive = activePhase === phase.id;
          return (
            <button
              key={phase.id}
              onClick={() => handleManualPhase(phase.id)}
              className={`py-2 px-2.5 rounded-xl text-left transition-all duration-200 border ${
                isActive
                  ? "bg-white/10 border-emerald-400/50 shadow-sm"
                  : "bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                  }`}
                />
                <span
                  className={`text-[12px] font-medium truncate ${
                    isActive ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {phase.title}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 truncate hidden sm:block mt-0.5 ml-3">
                {phase.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HeroMotionCenterpiece;
