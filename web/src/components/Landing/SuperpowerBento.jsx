import {
  ChefHat,
  FilmStrip,
  MagnifyingGlass,
  ShieldCheck,
  Sparkle,
  Clock,
  ArrowRight,
  Tag,
  CheckCircle,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export function SuperpowerBento() {
  return (
    <section className="container-page px-5 md:px-12 pt-28 md:pt-40" id="superpowers">
      {/* Section Header */}
      <div className="max-w-[760px] flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-ds-pill bg-brand-tertiary text-brand text-ds-xs md:text-ds-sm font-semibold tracking-wider uppercase self-start">
          <Sparkle size={15} weight="bold" />
          <span>Everyday Superpowers</span>
        </div>

        <h2 className="text-[32px] md:text-[50px] leading-[1.04] tracking-[-0.03em] text-on-surface font-medium">
          Built for how you{" "}
          <span className="text-brand-secondary italic font-serif">actually consume</span> the web.
        </h2>

        <p className="text-on-surface-secondary text-ds-base md:text-ds-lg leading-relaxed max-w-[640px]">
          No manual tagging. No dead folders. PostRecaller works quietly in the background so you can effortlessly recall anything you’ve ever saved.
        </p>
      </div>

      {/* 4-Card Bento Grid */}
      <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Card 1: Recipes without the 50 Pop-up Ads */}
        <div className="rounded-[24px] md:rounded-[28px] border border-ds-border/80 dark:border-white/10 bg-surface/90 dark:bg-zinc-900/80 p-6 sm:p-8 flex flex-col justify-between shadow-tier-1 hover:border-brand/40 transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ChefHat size={26} weight="bold" />
            </div>

            <div className="space-y-2">
              <h3 className="text-ds-xl md:text-[24px] font-semibold text-on-surface tracking-tight">
                Recipes without the 50 pop-up ads.
              </h3>
              <p className="text-on-surface-secondary text-ds-sm md:text-ds-base leading-relaxed">
                Save a 30-second reel from Instagram or TikTok. PostRecaller automatically extracts ingredients, measurements, and cooking time into a clean checklist. No life stories, no video ads.
              </p>
            </div>
          </div>

          {/* Micro-preview box */}
          <div className="mt-6 p-4 rounded-ds-md bg-surface-secondary/70 dark:bg-black/30 border border-ds-border/60 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-on-surface-secondary border-b border-ds-border/40 pb-1.5">
              <span>Creamy Mushroom Rigatoni</span>
              <span className="text-emerald-500 font-semibold">15m prep</span>
            </div>
            <div className="text-on-surface space-y-1">
              <p>• 8oz cremini mushrooms, sliced</p>
              <p>• 2 shallots, finely diced + dry white wine</p>
              <p>• 1/2 cup coconut cream or heavy cream</p>
            </div>
          </div>
        </div>

        {/* Card 2: Audio & Video 30-Second Briefings */}
        <div className="rounded-[24px] md:rounded-[28px] border border-ds-border/80 dark:border-white/10 bg-surface/90 dark:bg-zinc-900/80 p-6 sm:p-8 flex flex-col justify-between shadow-tier-1 hover:border-brand/40 transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FilmStrip size={26} weight="bold" />
            </div>

            <div className="space-y-2">
              <h3 className="text-ds-xl md:text-[24px] font-semibold text-on-surface tracking-tight">
                Video & podcast briefings in 30 seconds.
              </h3>
              <p className="text-on-surface-secondary text-ds-sm md:text-ds-base leading-relaxed">
                Have 40 saved YouTube talks and podcast clips you’ll "watch later"? PostRecaller distills audio and video transcripts into core executive takeaways so you absorb an hour in 60 seconds.
              </p>
            </div>
          </div>

          {/* Micro-preview box */}
          <div className="mt-6 p-4 rounded-ds-md bg-surface-secondary/70 dark:bg-black/30 border border-ds-border/60 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-on-surface-secondary border-b border-ds-border/40 pb-1.5">
              <span>Huberman Lab · Deep Sleep Protocol</span>
              <span className="text-brand font-semibold">0.8s synthesis</span>
            </div>
            <div className="text-on-surface space-y-1">
              <p>• 15 min morning sunlight anchors circadian rhythm</p>
              <p>• Keep bedroom temp &lt;68°F to trigger deep core drop</p>
            </div>
          </div>
        </div>

        {/* Card 3: The "Half-Remembered" Search */}
        <div className="rounded-[24px] md:rounded-[28px] border border-ds-border/80 dark:border-white/10 bg-surface/90 dark:bg-zinc-900/80 p-6 sm:p-8 flex flex-col justify-between shadow-tier-1 hover:border-brand/40 transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4A5D4E]/15 text-[#4A5D4E] dark:text-emerald-400 flex items-center justify-center">
              <MagnifyingGlass size={26} weight="bold" />
            </div>

            <div className="space-y-2">
              <h3 className="text-ds-xl md:text-[24px] font-semibold text-on-surface tracking-tight">
                Search with your memory, not exact keywords.
              </h3>
              <p className="text-on-surface-secondary text-ds-sm md:text-ds-base leading-relaxed">
                Forgot the creator’s handle? Forgot the exact title? Search the way your brain thinks: <span className="font-semibold text-on-surface">"that pasta with the guanciale"</span> or <span className="font-semibold text-on-surface">"minimalist desk cable spine"</span>. PostRecaller finds it in 15ms.
              </p>
            </div>
          </div>

          {/* Micro-preview box */}
          <div className="mt-6 p-4 rounded-ds-md bg-surface-secondary/70 dark:bg-black/30 border border-ds-border/60 flex items-center justify-between text-xs font-mono">
            <span className="text-on-surface-secondary">
              Query: <span className="text-brand font-bold">"cableless desk setup"</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Instant Match (14ms)
            </span>
          </div>
        </div>

        {/* Card 4: Permanent Private Vault */}
        <div className="rounded-[24px] md:rounded-[28px] border border-ds-border/80 dark:border-white/10 bg-surface/90 dark:bg-zinc-900/80 p-6 sm:p-8 flex flex-col justify-between shadow-tier-1 hover:border-brand/40 transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldCheck size={26} weight="bold" />
            </div>

            <div className="space-y-2">
              <h3 className="text-ds-xl md:text-[24px] font-semibold text-on-surface tracking-tight">
                Your permanent archive. Immune to link rot.
              </h3>
              <p className="text-on-surface-secondary text-ds-sm md:text-ds-base leading-relaxed">
                Creators delete reels, switch accounts to private, or take down blogs. Once an item is captured in PostRecaller, your executive summaries, transcripts, and extracted notes stay in your private vault forever.
              </p>
            </div>
          </div>

          {/* Micro-preview box */}
          <div className="mt-6 p-4 rounded-ds-md bg-surface-secondary/70 dark:bg-black/30 border border-ds-border/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-on-surface-secondary">
              <CheckCircle size={15} weight="fill" className="text-emerald-500" />
              <span>256-bit encrypted · Export anytime (JSON/Markdown)</span>
            </div>
            <span className="text-brand font-semibold">Zero lock-in</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SuperpowerBento;
