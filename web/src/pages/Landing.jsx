import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  MagnifyingGlass,
  Sparkle,
  Tag as TagIcon,
  BookmarkSimple,
  Clock,
  ShieldCheck,
  Waveform,
  InstagramLogo,
  TiktokLogo,
  YoutubeLogo,
  XLogo,
  RedditLogo,
  FacebookLogo,
  PinterestLogo,
  Article,
} from "@phosphor-icons/react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WaitlistForm } from "@/components/WaitlistForm";
import { IS_WAITLIST_MODE } from "@/constants/config";
import { api } from "@/lib/api";

// -----------------------------------------------------------------------------
// Small, hand-crafted platform strip (below hero) — with official platform logos.
// -----------------------------------------------------------------------------
const PLATFORMS = [
  { name: "Instagram", Icon: InstagramLogo },
  { name: "TikTok", Icon: TiktokLogo },
  { name: "YouTube", Icon: YoutubeLogo },
  { name: "X", Icon: XLogo },
  { name: "Reddit", Icon: RedditLogo },
  { name: "Facebook", Icon: FacebookLogo },
  { name: "Pinterest", Icon: PinterestLogo },
  { name: "Longform articles", Icon: Article },
];

function PlatformStrip() {
  return (
    <div className="mt-16 md:mt-24 border-y border-ds-border/70 py-5 md:py-6">
      <div className="flex items-center gap-6 md:gap-10 flex-wrap justify-between max-w-[980px] mx-auto text-on-surface-secondary text-ds-sm md:text-ds-base" style={{ fontWeight: 500, letterSpacing: "0.02em" }}>
        <span className="text-on-surface-secondary/70 uppercase tracking-[0.18em] text-[10.5px] md:text-[11px]">Saves from</span>
        {PLATFORMS.map(({ name, Icon }) => (
          <div key={name} className="flex items-center gap-2 hover:text-on-surface transition-colors cursor-default">
            <Icon size={19} weight="regular" className="text-brand-secondary" />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Features — asymmetric, editorial. One feature card, two thin rows.
// -----------------------------------------------------------------------------
const FEATURES = [
  {
    Icon: Sparkle,
    title: "AI reads what you save",
    body:
      "Every link gets an instant summary, smart tags, and the right collection — like a friend who's already watched, read, and shelved everything for you.",
  },
  {
    Icon: MagnifyingGlass,
    title: "Actually findable",
    body:
      "Search by phrase, topic, or intent. It just surfaces — no folders, no scrolling, no dead ends.",
  },
  {
    Icon: TagIcon,
    title: "Yours to shape",
    body:
      "Tune the tags, add notes, rearrange collections. PostRecaller learns the language you actually use.",
  },
];

function FeatureRow({ Icon, title, body, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-6 md:gap-14 py-9 md:py-11 border-t border-ds-border/60"
    >
      <div className="flex items-start gap-4">
        <span className="text-brand-secondary tabular-nums text-ds-sm mt-1.5" style={{ fontWeight: 500, letterSpacing: "0.08em" }}>
          0{index + 1}
        </span>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-[13px] bg-brand-tertiary text-brand flex items-center justify-center shrink-0">
            <Icon size={22} weight="regular" />
          </span>
          <h3 className="text-ds-xl md:text-[22px] text-on-surface leading-tight" style={{ fontWeight: 500, letterSpacing: "-0.015em" }}>
            {title}
          </h3>
        </div>
      </div>
      <p className="text-on-surface-secondary text-ds-lg md:text-[17px] leading-[1.65] max-w-[620px]">
        {body}
      </p>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// How it works — timeline steps with connecting rail
// -----------------------------------------------------------------------------
const STEPS = [
  { n: "1", Icon: BookmarkSimple, title: "Paste or share a link", body: "Send anything from any app — Instagram, TikTok, YouTube, X, articles." },
  { n: "2", Icon: Sparkle, title: "AI enriches it in seconds", body: "Title, summary, and tags are added automatically. Nothing to file." },
  { n: "3", Icon: MagnifyingGlass, title: "Find it in a heartbeat", body: "Search the way you think — by phrase, topic, or intent." },
];

function StepsSection() {
  return (
    <section className="container-page px-5 md:px-12 pt-28 md:pt-40">
      <div className="max-w-[680px]">
        <p className="text-brand-secondary text-ds-sm md:text-ds-base uppercase tracking-[0.2em]" style={{ fontWeight: 500 }}>
          How it works
        </p>
        <h2 className="mt-4 text-[30px] md:text-[46px] leading-[1.05] tracking-[-0.025em] text-on-surface" style={{ fontWeight: 500 }}>
          Three seconds to save.
          <br />
          <span className="text-brand-secondary">A lifetime</span> to find it again.
        </h2>
      </div>

      <div className="relative mt-14 md:mt-20 grid md:grid-cols-3 gap-6 md:gap-8">
        {/* Connecting rail (desktop only) */}
        <div className="hidden md:block absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-transparent via-ds-border to-transparent" aria-hidden />
        {STEPS.map(({ n, Icon, title, body }, i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
            className="relative flex flex-col gap-3.5 md:pt-14"
          >
            {/* Numeric badge (desktop) */}
            <span className="hidden md:flex absolute top-0 left-0 w-16 h-16 rounded-full bg-surface border border-ds-border items-center justify-center text-brand text-ds-xl" style={{ fontWeight: 500 }}>
              {n}
            </span>
            <span className="md:hidden text-brand-secondary text-ds-sm tabular-nums" style={{ fontWeight: 500, letterSpacing: "0.08em" }}>
              0{n}
            </span>
            <div className="flex items-center gap-3 mt-2">
              <Icon size={22} weight="regular" className="text-on-surface-secondary" />
              <h3 className="text-ds-xl md:text-[22px] text-on-surface" style={{ fontWeight: 500, letterSpacing: "-0.015em" }}>
                {title}
              </h3>
            </div>
            <p className="text-on-surface-secondary text-ds-lg leading-relaxed max-w-[300px]">
              {body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Trust strip — small reassurances near the fold
// -----------------------------------------------------------------------------
function TrustStrip() {
  const items = [
    { Icon: Clock, label: "Instant Save" },
    { Icon: Sparkle, label: "AI Enrichment Automatically" },
    { Icon: ShieldCheck, label: "Private by design" },
    { Icon: Waveform, label: "Sync across devices" },
  ];
  return (
    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
      {items.map(({ Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-on-surface-secondary">
          <Icon size={18} weight="regular" className="text-brand" />
          <span className="text-ds-base" style={{ fontWeight: 500 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Testimonial-style pull-quote — adds editorial gravitas without fake logos
// -----------------------------------------------------------------------------
function PullQuote() {
  return (
    <section className="container-page px-5 md:px-12 pt-28 md:pt-40">
      <motion.blockquote
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-[840px] mx-auto text-center"
      >
        <span className="text-brand-secondary text-[64px] md:text-[96px] leading-none block mb-2 select-none" aria-hidden style={{ fontWeight: 500 }}>“</span>
        <p className="text-[26px] md:text-[38px] leading-[1.15] tracking-[-0.02em] text-on-surface" style={{ fontWeight: 500 }}>
          The links I saved five months ago are finally worth something —
          <br className="hidden md:block" />
          they come back to me exactly when I need them.
        </p>
        <footer className="mt-6 text-on-surface-secondary text-ds-base">
          — an early PostRecaller user
        </footer>
      </motion.blockquote>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Landing page
// -----------------------------------------------------------------------------
export default function Landing() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    api.waitlistCount().then((r) => setCount(r.count)).catch(() => {});
  }, []);

  const social = IS_WAITLIST_MODE
    ? (count !== null && count >= 25
        ? `${count.toLocaleString()} early savers already joined`
        : "Private beta · Invite-only launch")
    : "Public beta · Now open to all";

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col relative overflow-hidden">
      {/* Warm ambient background wash — deep behind everything */}
      <div className="pointer-events-none absolute top-[-140px] right-[-200px] w-[720px] h-[720px] rounded-full bg-brand-tertiary/50 blur-[110px] -z-10" aria-hidden />
      <div className="pointer-events-none absolute top-[280px] left-[-180px] w-[560px] h-[560px] rounded-full bg-brand-secondary/12 blur-[100px] -z-10" aria-hidden />

      <SiteHeader />

      {/* --------- HERO --------- */}
      <section className="container-page px-5 md:px-12 pt-8 md:pt-14 lg:pt-16">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-16 items-center">
          {/* Left column: editorial copy */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex flex-col gap-7 relative z-10 max-w-[620px]"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
              <span className="text-brand-secondary text-ds-sm md:text-ds-base uppercase tracking-[0.2em]" style={{ fontWeight: 500 }} data-testid="landing-social-proof">
                {social}
              </span>
            </div>

            <h1
              className="text-[44px] sm:text-[62px] lg:text-[76px] leading-[0.98] tracking-[-0.035em] text-on-surface"
              style={{ fontWeight: 500 }}
              data-testid="landing-headline"
            >
              A quiet vault
              <br />
              for a{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-brand-secondary italic" style={{ fontFamily: "'Plus Jakarta Sans', 'Satoshi', sans-serif" }}>
                  loud
                </span>
                <span className="absolute left-0 right-0 bottom-[6px] h-[7px] bg-brand-tertiary/80 -z-0 rounded-sm" aria-hidden />
              </span>{" "}
              internet.
            </h1>

            <p className="text-on-surface-secondary text-ds-xl md:text-[21px] leading-[1.55] max-w-[560px]">
              PostRecaller quietly organizes every link you save — reads it, tags it, and hands it back to you the second you need it.
            </p>

            <div className="max-w-[520px] w-full pt-1">
              {IS_WAITLIST_MODE ? (
                <WaitlistForm onCount={setCount} testIdPrefix="waitlist-hero" />
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/register"
                    data-testid="hero-get-started"
                    className="px-7 py-3.5 rounded-ds-md bg-brand text-on-brand text-ds-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    style={{ fontWeight: 500 }}
                  >
                    <span>Create Free Account</span>
                    <ArrowRight size={18} weight="bold" />
                  </Link>
                  <Link
                    to="/login"
                    data-testid="hero-login"
                    className="px-6 py-3.5 rounded-ds-md border border-ds-border text-on-surface hover:bg-surface-secondary transition-colors text-ds-lg"
                    style={{ fontWeight: 500 }}
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>

            <TrustStrip />
          </motion.div>

          {/* Right column: generated hero illustration in a framed float */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -1.2 }}
            animate={{ opacity: 1, y: 0, rotate: -1.2 }}
            transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
            className="relative"
          >
            {/* Layered warm shadow behind */}
            <div className="absolute -inset-3 md:-inset-6 rounded-[28px] bg-brand-secondary/10 blur-2xl -z-10" aria-hidden />

            <div className="relative rounded-[22px] md:rounded-[28px] overflow-hidden border border-ds-border/70 bg-surface-secondary shadow-[0_40px_80px_-40px_rgba(74,93,78,0.35),0_18px_36px_-18px_rgba(28,28,26,0.18)]">
              <img
                src="/hero.png"
                alt="A wooden card catalog vault holding neatly filed social media posts, each labelled with hand-lettered tags like #recipes and #watch-later — a warm hand is lifting one card out under a soft light."
                data-testid="hero-illustration"
                loading="eager"
                className="w-full h-auto block select-none"
                draggable={false}
              />
              {/* Editorial caption pill */}
              <div className="absolute left-4 md:left-6 top-4 md:top-6 flex items-center gap-2 px-3.5 py-1.5 rounded-ds-pill bg-surface/85 backdrop-blur-md border border-ds-border/60 text-on-surface text-ds-sm" style={{ fontWeight: 500 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                Your vault, illustrated
              </div>
            </div>

            {/* Floating micro-cards for depth */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="hidden md:flex absolute -left-6 lg:-left-12 bottom-8 items-center gap-2.5 rounded-[14px] bg-surface border border-ds-border pl-3 pr-4 py-2.5 shadow-tier-1"
              style={{ transform: "rotate(-4deg)" }}
            >
              <span className="w-7 h-7 rounded-full bg-brand-tertiary text-brand flex items-center justify-center">
                <Sparkle size={14} weight="fill" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-secondary" style={{ fontWeight: 500 }}>New save</p>
                <p className="text-ds-sm text-on-surface" style={{ fontWeight: 500 }}>Tagged in 0.9s</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="hidden md:flex absolute -right-4 lg:-right-6 top-14 flex-col gap-1 rounded-[14px] bg-surface border border-ds-border px-3.5 py-2.5 shadow-tier-1"
              style={{ transform: "rotate(3.5deg)" }}
            >
              <span className="text-[11px] uppercase tracking-[0.14em] text-on-surface-secondary" style={{ fontWeight: 500 }}>Found in</span>
              <span className="text-ds-lg text-on-surface" style={{ fontWeight: 500 }}>
                0.2<span className="text-on-surface-secondary">s</span>
              </span>
            </motion.div>
          </motion.div>
        </div>

        <PlatformStrip />
      </section>

      {/* --------- FEATURES (editorial rows) --------- */}
      <section className="container-page px-5 md:px-12 pt-28 md:pt-40">
        <div className="max-w-[720px] flex flex-col gap-5">
          <p className="text-brand-secondary text-ds-sm md:text-ds-base uppercase tracking-[0.2em]" style={{ fontWeight: 500 }}>
            Why PostRecaller
          </p>
          <h2 className="text-[30px] md:text-[46px] leading-[1.05] tracking-[-0.025em] text-on-surface" style={{ fontWeight: 500 }}>
            A memory that keeps its promises.
          </h2>
          <p className="text-on-surface-secondary text-ds-lg md:text-[17px] leading-[1.65] max-w-[600px]">
            Save-later apps hoard your links and hope for the best. PostRecaller actually reads them — so when you come back three weeks later, everything's already sorted, summarized, and searchable.
          </p>
        </div>

        <div className="mt-10 md:mt-14 border-b border-ds-border/60">
          {FEATURES.map((f, i) => (
            <FeatureRow key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      <StepsSection />
      <PullQuote />

      {/* --------- CLOSING CTA — full-bleed brand slab --------- */}
      <section className="container-page px-5 md:px-12 pt-28 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-brand text-on-brand rounded-[24px] md:rounded-[32px] p-8 md:p-16"
        >
          {/* Layered decorative washes */}
          <div className="pointer-events-none absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-brand-secondary/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -left-16 -bottom-24 w-[360px] h-[360px] rounded-full bg-white/10 blur-3xl" aria-hidden />

          <div className="relative grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div className="flex flex-col gap-6">
              <p className="text-on-brand/70 text-ds-sm md:text-ds-base uppercase tracking-[0.2em]" style={{ fontWeight: 500 }}>
                {IS_WAITLIST_MODE ? "Get on the list" : "Start building your vault"}
              </p>
              <h2
                className="text-[32px] md:text-[52px] leading-[1.02] tracking-[-0.025em]"
                style={{ fontWeight: 500 }}
                data-testid="closing-headline"
              >
                Save less noise.
                <br />
                Find more signal.
              </h2>
              <p className="text-on-brand/85 text-ds-lg md:text-[17px] leading-[1.6] max-w-[420px]">
                {IS_WAITLIST_MODE
                  ? "Early invites go out weekly. Join the waitlist and we'll email you the moment your vault is ready."
                  : "Create your free account in seconds. Save links from any app and start finding everything you've saved."}
              </p>
            </div>

            <div className="flex flex-col gap-4 md:pl-6">
              {IS_WAITLIST_MODE ? (
                <>
                  <WaitlistForm onBrand testIdPrefix="waitlist-closing" onCount={setCount} />
                  <div className="flex items-center gap-2 text-on-brand/75 text-ds-sm">
                    <ArrowUpRight size={14} weight="bold" />
                    <span>No spam. One email when we launch.</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3.5">
                  <Link
                    to="/register"
                    data-testid="closing-get-started"
                    className="px-8 py-4 rounded-ds-md bg-white text-brand text-ds-lg hover:bg-surface transition-colors flex items-center justify-center gap-2 shadow-tier-1"
                    style={{ fontWeight: 500 }}
                  >
                    <span>Start Free Today</span>
                    <ArrowRight size={18} weight="bold" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-center text-on-brand/80 hover:text-on-brand text-ds-base transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    Already have an account? Log in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <div className="flex-1" />
      <SiteFooter />
    </div>
  );
}
