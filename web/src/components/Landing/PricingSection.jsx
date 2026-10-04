import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Sparkle,
  Gift,
  ArrowRight,
  ShieldCheck,
  Lightning,
  LockSimple,
} from "@phosphor-icons/react";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState("annual"); // "monthly" | "annual"

  return (
    <section className="container-page px-5 md:px-12 pt-28 md:pt-40" id="pricing">
      {/* Section Header */}
      <div className="max-w-[760px] mx-auto text-center flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-ds-pill bg-brand-tertiary text-brand text-ds-xs md:text-ds-sm font-semibold tracking-wider uppercase">
          <Sparkle size={15} weight="bold" />
          <span>Simple, Honest Pricing</span>
        </div>

        <h2 className="text-[32px] md:text-[50px] leading-[1.04] tracking-[-0.03em] text-on-surface font-medium">
          Invest in your memory.
          <br />
          <span className="text-brand-secondary italic font-serif">100% free</span> during Public Beta.
        </h2>

        <p className="text-on-surface-secondary text-ds-base md:text-ds-lg leading-relaxed max-w-[600px]">
          No paywalls during our launch. Create your vault today to enjoy full Pro capabilities at zero cost.
        </p>

        {/* Beta Founder Launch Announcement Banner */}
        <div className="mt-2 w-full max-w-[680px] p-4 rounded-2xl bg-gradient-to-r from-[#4A5D4E]/15 via-emerald-500/10 to-[#4A5D4E]/15 border border-[#4A5D4E]/40 text-left flex items-start sm:items-center gap-3.5 shadow-sm">
          <span className="w-10 h-10 rounded-xl bg-[#4A5D4E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Gift size={22} weight="fill" />
          </span>
          <div>
            <p className="text-ds-sm font-semibold text-on-surface">
              🎁 Public Beta Launch Perk
            </p>
            <p className="text-ds-xs text-on-surface-secondary">
              All <strong className="text-brand">Pro features are automatically unlocked for free</strong> for every early member who joins during beta. No credit card required.
            </p>
          </div>
        </div>

        {/* Monthly vs Annual Toggle */}
        <div className="mt-4 inline-flex items-center gap-2 p-1 rounded-full bg-surface-secondary/80 border border-ds-border text-ds-sm">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-surface dark:bg-zinc-800 text-on-surface shadow-xs font-semibold"
                : "text-on-surface-secondary hover:text-on-surface"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-[#4A5D4E] text-white shadow-xs font-semibold"
                : "text-on-surface-secondary hover:text-on-surface"
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/20 text-white font-bold">
              Save 25%
            </span>
          </button>
        </div>
      </div>

      {/* 2-Tier Pricing Cards */}
      <div className="mt-12 max-w-[940px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Tier 1: Free Forever */}
        <div className="rounded-[24px] md:rounded-[30px] border border-ds-border/80 dark:border-white/10 bg-surface/80 dark:bg-zinc-900/60 p-7 sm:p-9 flex flex-col justify-between shadow-tier-1 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-ds-xl font-semibold text-on-surface">Free Vault</h3>
              <p className="text-ds-sm text-on-surface-secondary mt-1">
                For casual savers getting started with automated link capture.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-[38px] md:text-[44px] font-bold text-on-surface tracking-tight">$0</span>
              <span className="text-ds-sm text-on-surface-secondary font-mono">/ forever</span>
            </div>

            <ul className="space-y-3 pt-4 border-t border-ds-border/60 text-ds-sm text-on-surface">
              {[
                "Up to 500 saved links & posts",
                "Chrome, Safari, Firefox bookmark import",
                "5 AI Executive Summaries per day",
                "Instant full-vault semantic search",
                "Android mobile app & Web vault",
                "Clean URLs (tracking parameters removed)",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check size={16} weight="bold" className="text-brand shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/register"
            className="w-full py-3.5 rounded-ds-md border border-ds-border/90 bg-surface dark:bg-zinc-800 text-on-surface hover:bg-surface-secondary transition-all text-center font-medium shadow-xs"
          >
            Create Free Account
          </Link>
        </div>

        {/* Tier 2: Pro (Highlighted with Beta Perk) */}
        <div className="rounded-[24px] md:rounded-[30px] border-2 border-[#4A5D4E] bg-surface dark:bg-zinc-900 p-7 sm:p-9 flex flex-col justify-between shadow-tier-2 relative overflow-hidden space-y-6">
          {/* Top highlight ribbon */}
          <div className="absolute top-0 right-0 bg-[#4A5D4E] text-white text-[11px] font-mono font-semibold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            Unlocked in Beta
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-ds-xl font-semibold text-on-surface">PostRecaller Pro</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-ds-sm text-on-surface-secondary mt-1">
                For researchers, foodies, and power savers who want an infinite second brain.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-[38px] md:text-[44px] font-bold text-on-surface tracking-tight">
                  {billingCycle === "annual" ? "$6" : "$8"}
                </span>
                <span className="text-ds-sm text-on-surface-secondary font-mono">/ month</span>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                $0 right now
              </span>
            </div>

            <ul className="space-y-3 pt-4 border-t border-ds-border/60 text-ds-sm text-on-surface">
              {[
                "Expanded 200 saves per day allowance",
                "Full Social Archive Imports (Instagram, TikTok, Facebook, Reddit)",
                "Priority AI Key Takeaways & Video Transcripts",
                "Smart Auto-Categorization (Recipes, Tutorials, Articles, Goods)",
                "Full Vault Export (Markdown, JSON, CSV)",
                "Priority AI Processing Pipeline",
                "Android App + Share Sheet Integration",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check size={16} weight="bold" className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/register"
            className="w-full py-3.5 rounded-ds-md bg-[#4A5D4E] hover:bg-[#3e4f42] text-white transition-all text-center font-medium shadow-sm flex items-center justify-center gap-2"
          >
            <span>Claim Free Beta Access</span>
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </div>

      {/* Security & Reassurance Strip */}
      <div className="mt-12 max-w-[800px] mx-auto pt-6 border-t border-ds-border/60 flex flex-wrap items-center justify-center sm:justify-between gap-4 text-xs text-on-surface-secondary font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={16} weight="fill" className="text-brand" />
          <span>256-Bit Encrypted Vault</span>
        </span>
        <span className="flex items-center gap-1.5">
          <LockSimple size={16} weight="fill" className="text-brand" />
          <span>Zero Data Selling or Ad Tracking</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Lightning size={16} weight="fill" className="text-brand" />
          <span>No Credit Card Required</span>
        </span>
      </div>
    </section>
  );
}

export default PricingSection;
