import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkle, ShieldCheck, Devices } from "@phosphor-icons/react";
import { HeroMotionCenterpiece } from "@/components/hero/HeroMotionCenterpiece";
import { WaitlistForm } from "@/components/WaitlistForm";
import { IS_WAITLIST_MODE } from "@/constants/config";

export function Hero({ socialProof = "Public beta · Now open to all", onWaitlistCount }) {
  return (
    <section className="container-page px-5 md:px-12 pt-8 md:pt-14 lg:pt-16" id="hero">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-10 lg:gap-14 items-center">
        {/* Left column: editorial copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-7 relative z-10 max-w-[620px]"
        >
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

          <h1
            className="text-[44px] sm:text-[60px] lg:text-[72px] leading-[0.98] tracking-[-0.035em] text-on-surface font-medium"
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

          <p className="text-on-surface-secondary text-ds-xl md:text-[21px] leading-[1.55] max-w-[560px]">
            PostRecaller quietly organizes every link you save — cleans tracking junk, extracts key AI takeaways, and hands them back the instant you search.
          </p>

          <div className="max-w-[520px] w-full pt-1">
            {IS_WAITLIST_MODE ? (
              <WaitlistForm onCount={onWaitlistCount} testIdPrefix="waitlist-hero" />
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  data-testid="hero-get-started"
                  className="group relative px-7 py-3.5 rounded-ds-md bg-brand text-on-brand text-ds-lg font-medium shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_16px_-4px_rgba(74,93,78,0.35)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_12px_24px_-6px_rgba(74,93,78,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-200 flex items-center gap-2 overflow-hidden"
                >
                  <span className="relative z-10">Create Free Account</span>
                  <ArrowRight
                    size={18}
                    weight="bold"
                    className="relative z-10 transition-transform duration-200 group-hover:translate-x-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                </Link>
                <Link
                  to="/login"
                  data-testid="hero-login"
                  className="px-6 py-3.5 rounded-ds-md border border-ds-border text-on-surface hover:bg-surface-secondary hover:border-ds-border-strong active:scale-[0.985] transition-all duration-200 text-ds-lg font-medium"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
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
        </motion.div>

        {/* Right column: Interactive motion-driven centerpiece */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full flex justify-center"
        >
          <HeroMotionCenterpiece />
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
