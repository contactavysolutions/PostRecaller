import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
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
import { StickyHeroWorkflow } from "@/components/Landing/StickyHeroWorkflow";
import { FeaturesCarousel } from "@/components/Landing/FeaturesCarousel";
import { IS_WAITLIST_MODE } from "@/constants/config";
import { api } from "@/lib/api";

// -----------------------------------------------------------------------------
// Interactive platform strip — with subtle tactile hover
// -----------------------------------------------------------------------------
const PLATFORMS = [
  { name: "Instagram", Icon: InstagramLogo },
  { name: "TikTok", Icon: TiktokLogo },
  { name: "YouTube", Icon: YoutubeLogo },
  { name: "X", Icon: XLogo },
  { name: "Reddit", Icon: RedditLogo },
  { name: "Facebook", Icon: FacebookLogo },
  { name: "Pinterest", Icon: PinterestLogo },
  { name: "Articles", Icon: Article },
];

function PlatformStrip() {
  return (
    <div className="mt-8 md:mt-14 border-y border-ds-border/70 py-5 md:py-6 bg-surface/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-between max-w-[1020px] mx-auto px-5 text-on-surface-secondary text-ds-sm md:text-ds-base">
        <span className="text-on-surface-secondary/70 uppercase tracking-[0.18em] text-[10.5px] md:text-[11px] font-semibold">
          Instant intake from
        </span>
        {PLATFORMS.map(({ name, Icon }) => (
          <div
            key={name}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-ds-pill border border-transparent hover:border-brand/30 hover:bg-surface-secondary/80 transition-all duration-200 cursor-default hover:scale-[1.04]"
          >
            <Icon size={18} weight="regular" className="text-brand-secondary transition-transform duration-200 group-hover:scale-110" />
            <span className="group-hover:text-on-surface font-medium text-ds-sm transition-colors">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Testimonial pull-quote
// -----------------------------------------------------------------------------
function PullQuote() {
  return (
    <section className="container-page px-5 md:px-12 pt-28 md:pt-36">
      <motion.blockquote
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[840px] mx-auto text-center"
      >
        <span className="text-brand-secondary text-[64px] md:text-[96px] leading-none block mb-2 select-none font-serif" aria-hidden>“</span>
        <p className="text-[26px] md:text-[38px] leading-[1.18] tracking-[-0.02em] text-on-surface font-medium">
          The links I saved five months ago are finally worth something —
          <br className="hidden md:block" />
          they come back to me exactly when I need them.
        </p>
        <footer className="mt-6 text-on-surface-secondary text-ds-base font-medium">
          — an early PostRecaller member
        </footer>
      </motion.blockquote>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Landing page main component
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
    <div className="min-h-screen bg-surface text-on-surface flex flex-col relative overflow-x-clip">
      {/* Warm ambient background mesh lighting safely isolated */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10" aria-hidden>
        <div className="absolute top-[-160px] right-[-180px] w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-brand/12 via-brand-tertiary/20 to-transparent blur-[120px]" />
        <div className="absolute top-[360px] left-[-220px] w-[640px] h-[640px] rounded-full bg-gradient-to-tr from-brand-secondary/10 via-brand-tertiary/15 to-transparent blur-[110px]" />
        <div className="absolute top-[1600px] right-[-100px] w-[700px] h-[700px] rounded-full bg-brand/8 blur-[130px]" />
      </div>

      <SiteHeader />

      {/* --------- STICKY-SCROLL HERO: LEFT EDITORIAL + RIGHT HOW IT WORKS --------- */}
      <StickyHeroWorkflow socialProof={social} onWaitlistCount={setCount} />

      {/* --------- PLATFORM INTAKE STRIP --------- */}
      <PlatformStrip />

      {/* --------- EDITORIAL CAROUSEL: 4 CORE AI FEATURES --------- */}
      <FeaturesCarousel />

      {/* --------- TESTIMONIAL PULLQUOTE --------- */}
      <PullQuote />

      {/* --------- CLOSING CTA — full-bleed brand slab --------- */}
      <section className="container-page px-5 md:px-12 pt-28 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden bg-[#4A5D4E] text-white rounded-[24px] md:rounded-[32px] p-8 md:p-16 shadow-[0_20px_50px_rgba(74,93,78,0.25)]"
        >
          {/* Layered decorative washes */}
          <div className="pointer-events-none absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-brand-secondary/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -left-16 -bottom-24 w-[360px] h-[360px] rounded-full bg-white/10 blur-3xl" aria-hidden />

          <div className="relative grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div className="flex flex-col gap-6">
              <p className="text-white/75 text-ds-sm md:text-ds-base uppercase tracking-[0.2em] font-semibold">
                {IS_WAITLIST_MODE ? "Get on the list" : "Start building your vault"}
              </p>
              <h2
                className="text-[32px] md:text-[52px] leading-[1.02] tracking-[-0.025em] font-medium"
                data-testid="closing-headline"
              >
                Save less noise.
                <br />
                Find more signal.
              </h2>
              <p className="text-white/85 text-ds-lg md:text-[17px] leading-[1.6] max-w-[420px]">
                {IS_WAITLIST_MODE
                  ? "Early invites go out weekly. Join the waitlist and we'll email you the moment your vault is ready."
                  : "Create your free account in seconds. Save links from any app and start finding everything you've saved."}
              </p>
            </div>

            <div className="flex flex-col gap-4 md:pl-6">
              {IS_WAITLIST_MODE ? (
                <>
                  <WaitlistForm onBrand testIdPrefix="waitlist-closing" onCount={setCount} />
                  <div className="flex items-center gap-2 text-white/75 text-ds-sm font-medium">
                    <ArrowUpRight size={14} weight="bold" />
                    <span>No spam. One email when we launch.</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3.5">
                  <Link
                    to="/register"
                    data-testid="closing-get-started"
                    className="group px-8 py-4 rounded-ds-md bg-white text-[#4A5D4E] text-ds-lg font-medium hover:bg-surface transition-all duration-200 flex items-center justify-center gap-2 shadow-tier-1 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Start Free Today</span>
                    <ArrowRight size={18} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-center text-white/80 hover:text-white text-ds-base transition-colors font-medium"
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
