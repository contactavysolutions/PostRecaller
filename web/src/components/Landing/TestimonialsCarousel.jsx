import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretLeft,
  CaretRight,
  Star,
  CheckCircle,
  InstagramLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
  LinkedinLogo,
  Quotes,
} from "@phosphor-icons/react";

const TESTIMONIALS = [
  {
    id: "sarah",
    name: "Sarah Lin",
    handle: "@sarahcooks",
    role: "Food Blogger & Home Cook",
    location: "Seattle, WA",
    avatarBg: "bg-emerald-600 text-white",
    initials: "SL",
    platformIcons: [InstagramLogo, TiktokLogo],
    highlight: "Saved 240+ recipes · Zero lost links",
    quote:
      "I used to take screenshots of recipe reels on Instagram and lose them in my camera roll forever. PostRecaller extracted the exact ingredients and steps for a Thai coconut curry I saved three months ago in two seconds. It’s like having an executive sous chef in my pocket.",
    savesType: "Saves: Cooking reels, restaurant spots & farmers market finds",
  },
  {
    id: "david",
    name: "David Vance",
    handle: "@dvance_dev",
    role: "Senior Staff Engineer & Researcher",
    location: "Austin, TX",
    avatarBg: "bg-slate-700 text-white",
    initials: "DV",
    platformIcons: [XLogo, LinkedinLogo],
    highlight: "Replaced 3 bookmark extensions",
    quote:
      "I bookmark dozens of X threads, GitHub repos, and deep-dive engineering newsletters every week. PostRecaller’s AI executive summaries mean I can actually recall architectural decisions when I'm coding without having to re-read 40-post threads.",
    savesType: "Saves: System architecture, AI whitepapers & developer tools",
  },
  {
    id: "elena",
    name: "Elena Rostova",
    handle: "@elenarostova",
    role: "Brand Designer & Creative Director",
    location: "Brooklyn, NY",
    avatarBg: "bg-amber-700 text-white",
    initials: "ER",
    platformIcons: [TiktokLogo, InstagramLogo],
    highlight: "100% automated organization",
    quote:
      "My browser bookmarks used to be a graveyard of 600 unorganized links. Now, I just tap share from TikTok or Instagram. No folders, no manual tagging. Whenever a client asks for mood references, I search 'brutalist typography' and it's right there instantly.",
    savesType: "Saves: Visual identity, typography & packaging references",
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    handle: "@mchen_pm",
    role: "Product Lead & Podcast Host",
    location: "San Francisco, CA",
    avatarBg: "bg-indigo-700 text-white",
    initials: "MC",
    platformIcons: [YoutubeLogo, XLogo],
    highlight: "Sub-second semantic recall",
    quote:
      "The semantic search blew my mind. I typed 'that podcast talking about dopamine and morning routines' having completely forgotten the guest and episode title. Boom — exact YouTube episode and key takeaways pulled up in 0.1 seconds.",
    savesType: "Saves: Longform video interviews, essays & productivity podcasts",
  },
];

export function TestimonialsCarousel() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const t = TESTIMONIALS[currentIdx];

  // Auto-advance every 6.5s unless hovered
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6500);

    return () => clearTimeout(timerRef.current);
  }, [currentIdx, isPaused]);

  const handleNext = () => {
    setIsPaused(true);
    setCurrentIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setIsPaused(true);
    setCurrentIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section
      className="container-page px-5 md:px-12 pt-28 md:pt-36"
      id="community"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[920px] mx-auto">
        {/* Section Eyebrow & Headline */}
        <div className="text-center space-y-3 mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-ds-pill bg-brand-tertiary text-brand text-ds-xs md:text-ds-sm font-semibold tracking-wider uppercase">
            <CheckCircle size={15} weight="fill" />
            <span>Loved by Thoughtful Savers</span>
          </div>
          <h2 className="text-[28px] md:text-[42px] leading-[1.08] tracking-[-0.025em] text-on-surface font-medium">
            From buried bookmarks to{" "}
            <span className="text-brand-secondary italic font-serif">instant recall</span>.
          </h2>
          <p className="text-on-surface-secondary text-ds-base md:text-ds-lg max-w-[560px] mx-auto leading-relaxed">
            See how everyday foodies, researchers, creators, and professionals turned their saved posts into a living second brain.
          </p>
        </div>

        {/* Testimonial Card Stage */}
        <div className="relative rounded-[24px] md:rounded-[32px] border border-ds-border/80 dark:border-white/10 bg-surface/90 dark:bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-10 md:p-12 shadow-tier-2 overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/10 blur-3xl -z-0" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-brand-secondary/10 blur-3xl -z-0" />

          {/* Large Warm Watermark Quote Icon */}
          <div className="absolute top-6 right-6 md:top-8 md:right-10 text-brand-secondary/15 pointer-events-none" aria-hidden>
            <Quotes size={84} weight="fill" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col justify-between min-h-[300px] md:min-h-[280px]"
            >
              {/* Star Rating & Verified Saver Pill */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} weight="fill" />
                  ))}
                  <span className="ml-2 text-ds-sm font-semibold text-on-surface">5.0</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-medium">
                  <CheckCircle size={13} weight="fill" />
                  <span>Verified Vault Saver</span>
                </div>
              </div>

              {/* The Testimonial Quote */}
              <blockquote className="text-[20px] sm:text-[23px] md:text-[26px] leading-[1.35] tracking-[-0.015em] text-on-surface font-medium my-auto">
                "{t.quote}"
              </blockquote>

              {/* Author Strip & Context */}
              <div className="mt-8 pt-6 border-t border-ds-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-ds-base shadow-sm shrink-0 ${t.avatarBg}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-ds-base font-semibold text-on-surface leading-tight">
                        {t.name}
                      </h4>
                      <span className="text-[12px] font-mono text-on-surface-secondary">
                        {t.handle}
                      </span>
                    </div>
                    <p className="text-ds-sm text-on-surface-secondary">
                      {t.role} · <span className="text-on-surface-secondary/70">{t.location}</span>
                    </p>
                  </div>
                </div>

                {/* Platform Icons & Saved Highlights */}
                <div className="flex items-center gap-3 text-on-surface-secondary text-xs sm:self-center">
                  <div className="flex items-center gap-1">
                    {t.platformIcons.map((Icon, idx) => (
                      <span
                        key={idx}
                        className="w-6 h-6 rounded-md bg-surface-secondary/80 flex items-center justify-center text-on-surface border border-ds-border/60"
                      >
                        <Icon size={14} weight="bold" />
                      </span>
                    ))}
                  </div>
                  <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-ds-border" />
                  <span className="font-mono text-brand font-semibold bg-brand-tertiary px-2 py-0.5 rounded">
                    {t.highlight}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Footer Navigation Bar */}
          <div className="mt-8 pt-4 flex items-center justify-between border-t border-ds-border/40 relative z-10">
            {/* Step Dots with Active Pill Expansion */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsPaused(true);
                    setCurrentIdx(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIdx
                      ? "w-8 bg-[#4A5D4E]"
                      : "w-2 bg-ds-border hover:bg-on-surface-secondary/40"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
              <span className="ml-2 text-xs font-mono text-on-surface-secondary">
                {currentIdx + 1} / {TESTIMONIALS.length}
              </span>
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-full border border-ds-border/80 bg-surface hover:bg-surface-secondary text-on-surface flex items-center justify-center transition-all active:scale-95 shadow-sm"
                aria-label="Previous testimonial"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-full border border-ds-border/80 bg-surface hover:bg-surface-secondary text-on-surface flex items-center justify-center transition-all active:scale-95 shadow-sm"
                aria-label="Next testimonial"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsCarousel;
