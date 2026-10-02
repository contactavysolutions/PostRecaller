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
  LinkedinLogo,
  ThreadsLogo,
  MediumLogo,
  GithubLogo,
  SpotifyLogo,
  Article,
  Globe,
} from "@phosphor-icons/react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WaitlistForm } from "@/components/WaitlistForm";
import { StickyHeroWorkflow } from "@/components/Landing/StickyHeroWorkflow";
import { BookmarkImportShowcase } from "@/components/Landing/BookmarkImportShowcase";
import { SuperpowerBento } from "@/components/Landing/SuperpowerBento";
import { TestimonialsCarousel } from "@/components/Landing/TestimonialsCarousel";
import { PricingSection } from "@/components/Landing/PricingSection";
import { LandingFAQ } from "@/components/Landing/LandingFAQ";
import { IS_WAITLIST_MODE } from "@/constants/config";
import { api } from "@/lib/api";

// -----------------------------------------------------------------------------
// Interactive platform strip — expanded universal intake ecosystem
// -----------------------------------------------------------------------------
const PLATFORMS = [
  { name: "Instagram", Icon: InstagramLogo },
  { name: "TikTok", Icon: TiktokLogo },
  { name: "YouTube", Icon: YoutubeLogo },
  { name: "X (Twitter)", Icon: XLogo },
  { name: "Reddit", Icon: RedditLogo },
  { name: "LinkedIn", Icon: LinkedinLogo },
  { name: "Threads", Icon: ThreadsLogo },
  { name: "Pinterest", Icon: PinterestLogo },
  { name: "Facebook", Icon: FacebookLogo },
  { name: "Medium & Substack", Icon: MediumLogo },
  { name: "GitHub", Icon: GithubLogo },
  { name: "Spotify", Icon: SpotifyLogo },
  { name: "Articles & News", Icon: Article },
];

function PlatformStrip() {
  return (
    <div className="mt-8 md:mt-14 border-y border-ds-border/70 py-5 md:py-6 bg-surface/40 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 justify-between max-w-[1180px] mx-auto px-5 text-on-surface-secondary text-ds-sm md:text-ds-base">
        <span className="text-on-surface-secondary/80 uppercase tracking-[0.18em] text-[10.5px] md:text-[11px] font-semibold whitespace-nowrap">
          Instant intake from
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center md:justify-end">
          {PLATFORMS.map(({ name, Icon }) => (
            <div
              key={name}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-ds-pill border border-transparent hover:border-brand/30 hover:bg-surface-secondary/80 transition-all duration-200 cursor-default hover:scale-[1.03]"
            >
              <Icon size={16} weight="regular" className="text-brand-secondary transition-transform duration-200 group-hover:scale-110" />
              <span className="group-hover:text-on-surface font-medium text-[12px] sm:text-ds-sm transition-colors">{name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-ds-pill bg-brand-tertiary text-brand font-semibold text-[12px] sm:text-ds-sm border border-brand/30 shadow-xs">
            <Globe size={15} weight="bold" />
            <span>+ Any Web Link</span>
          </div>
        </div>
      </div>
    </div>
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

      {/* --------- UNIVERSAL BOOKMARKS & ARCHIVE IMPORT --------- */}
      <BookmarkImportShowcase />

      {/* --------- EVERYDAY SUPERPOWERS BENTO --------- */}
      <SuperpowerBento />

      {/* --------- TESTIMONIALS CAROUSEL --------- */}
      <TestimonialsCarousel />

      {/* --------- PRICING & BETA OFFER --------- */}
      <PricingSection />

      {/* --------- FREQUENTLY ASKED QUESTIONS --------- */}
      <LandingFAQ />

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
