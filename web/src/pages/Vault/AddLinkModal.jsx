// Add-link modal — paste URL → shimmer while POST /api/items scrapes + enriches.
// Two states: (1) input, (2) enriching (shimmer), (3) result preview with save-close.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LinkSimple,
  Sparkle,
  ArrowSquareOut,
  Check,
  Warning,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PLATFORM_META, platformOf } from "./platforms";

const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;

export function AddLinkModal({ open, onClose, onAdded }) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("input"); // input | enriching | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUrl("");
      setResult(null);
      setError("");
      setPhase("input");
      // Focus after enter transition
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && !isBusy && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phase]);

  const isBusy = phase === "enriching";

  const submit = async (e) => {
    e?.preventDefault?.();
    let clean = url.trim();
    if (!clean) return;
    if (!/^https?:\/\//i.test(clean)) clean = "https://" + clean;
    if (!URL_RE.test(clean)) {
      setError("That doesn't look like a valid URL");
      return;
    }
    setError("");
    setPhase("enriching");
    try {
      const res = await api.createItem(clean);
      setResult(res);
      setPhase("done");
      onAdded?.(res); // optimistic prepend at page level
      if (res.duplicate) {
        toast("Already in your vault", { icon: null });
      } else {
        toast.success("Saved to your vault");
      }
    } catch (err) {
      setPhase("error");
      setError(err?.message || "Save failed — try again");
    }
  };

  const close = () => {
    if (isBusy) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          data-testid="add-link-modal"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
            onClick={close}
            aria-hidden
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative w-full sm:max-w-[540px] bg-surface border border-ds-border rounded-t-[24px] sm:rounded-ds-lg shadow-tier-1 overflow-hidden"
          >
            {/* Glass handle strip (design guideline: glass allowed on modal handle) */}
            <div className="glass-header px-6 pt-5 pb-4 flex items-center justify-between border-b border-ds-border/60">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-ds-md bg-brand-tertiary text-brand flex items-center justify-center">
                  <LinkSimple size={17} weight="regular" />
                </span>
                <div className="leading-tight">
                  <p className="text-on-surface text-ds-lg" style={{ fontWeight: 500 }}>Save a link</p>
                  <p className="text-on-surface-secondary text-ds-sm">Paste any URL — we'll do the rest.</p>
                </div>
              </div>
              <button
                onClick={close}
                disabled={isBusy}
                aria-label="Close"
                data-testid="add-link-close"
                className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-secondary hover:bg-surface-secondary transition-colors disabled:opacity-50"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Body: input or preview */}
            {phase === "done" && result?.item ? (
              <SavedPreview result={result} onOpen={() => window.open(result.item.original_url, "_blank")} onClose={close} />
            ) : (
              <form onSubmit={submit} className="px-6 pt-5 pb-6 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="sr-only">URL</span>
                  <input
                    ref={inputRef}
                    type="url"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck={false}
                    value={url}
                    disabled={isBusy}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                    data-testid="add-link-input"
                    className={`field-input !text-ds-lg ${error ? "field-input-error" : ""}`}
                  />
                  {error ? (
                    <span className="text-ds-sm text-ds-error flex items-center gap-1.5" data-testid="add-link-error">
                      <Warning size={13} weight="fill" />
                      {error}
                    </span>
                  ) : (
                    <span className="text-ds-sm text-on-surface-secondary">
                      Instagram, TikTok, YouTube, X, Reddit, articles — anything.
                    </span>
                  )}
                </label>

                {isBusy ? (
                  <EnrichingShimmer />
                ) : (
                  <button
                    type="submit"
                    disabled={!url.trim()}
                    data-testid="add-link-submit"
                    className="btn-brand"
                  >
                    <Sparkle size={17} weight="fill" />
                    Save & enrich
                  </button>
                )}
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- shimmer placeholder shown during POST /api/items ----------
function EnrichingShimmer() {
  return (
    <div className="flex flex-col gap-3 py-1" data-testid="add-link-enriching">
      <div className="flex items-center gap-2 text-brand text-ds-base" style={{ fontWeight: 500 }}>
        <Sparkle size={16} weight="fill" className="animate-pulse" />
        Reading the page…
      </div>
      <div className="grid grid-cols-[76px_1fr] gap-3 items-start">
        <div className="aspect-square rounded-ds-sm bg-gradient-to-r from-surface-secondary via-surface-tertiary to-surface-secondary bg-[length:800px_100%] animate-shimmer" />
        <div className="flex flex-col gap-2 pt-0.5">
          <div className="h-3.5 w-4/5 rounded-full bg-gradient-to-r from-surface-secondary via-surface-tertiary to-surface-secondary bg-[length:800px_100%] animate-shimmer" />
          <div className="h-3 w-full rounded-full bg-gradient-to-r from-surface-secondary via-surface-tertiary to-surface-secondary bg-[length:800px_100%] animate-shimmer" />
          <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-surface-secondary via-surface-tertiary to-surface-secondary bg-[length:800px_100%] animate-shimmer" />
          <div className="flex gap-1.5 pt-1">
            {[42, 60, 36].map((w) => (
              <div key={w} className={`h-4 rounded-ds-pill bg-gradient-to-r from-surface-secondary via-surface-tertiary to-surface-secondary bg-[length:800px_100%] animate-shimmer`} style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>
      <p className="text-on-surface-secondary text-ds-sm mt-1">
        Extracting title, summary, and smart tags — takes a few seconds.
      </p>
    </div>
  );
}

// ---------- success / duplicate preview ----------
function SavedPreview({ result, onOpen, onClose }) {
  const item = result.item;
  const plat = platformOf(item);
  const meta = PLATFORM_META[plat] || PLATFORM_META.web;
  const status = item.enrichment_status;

  return (
    <div className="px-6 pt-5 pb-6 flex flex-col gap-4" data-testid="add-link-saved">
      <div className="flex items-center gap-2 text-ds-success text-ds-base" style={{ fontWeight: 500 }}>
        <Check size={17} weight="bold" />
        {result.duplicate ? "Already saved — jumping to it" : "Added to your vault"}
      </div>

      <div className="flex gap-3 items-start p-3 rounded-ds-md bg-surface-secondary border border-ds-border/70">
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt="" className="w-16 h-16 rounded-ds-sm object-cover shrink-0 select-none" draggable={false} />
        ) : (
          <div className={`w-16 h-16 rounded-ds-sm shrink-0 flex items-center justify-center ${meta.tint}`}>
            <LinkSimple size={22} weight="regular" />
          </div>
        )}
        <div className="min-w-0 flex flex-col gap-1">
          <span className={`self-start px-2 py-0.5 rounded-ds-pill text-[10.5px] uppercase tracking-[0.12em] ${meta.tint}`} style={{ fontWeight: 500 }}>
            {meta.label}
          </span>
          <p className="text-on-surface text-ds-base leading-tight line-clamp-2" style={{ fontWeight: 500 }}>
            {item.title || item.original_url}
          </p>
          {item.summary && (
            <p className="text-on-surface-secondary text-ds-sm leading-relaxed line-clamp-2">
              {item.summary}
            </p>
          )}
          {item.tags?.length ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {item.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-[10.5px] px-2 py-0.5 rounded-ds-pill bg-brand-tertiary text-on-brand-tertiary" style={{ fontWeight: 500 }}>
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {status === "failed" && (
        <div className="flex items-start gap-2 rounded-ds-md bg-ds-warning/10 text-ds-warning p-3 text-ds-sm">
          <Warning size={14} weight="fill" className="mt-0.5 shrink-0" />
          <span>Couldn't fully read this one — you can retry enrichment from the card menu.</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={onOpen} className="btn-outline flex-1" data-testid="add-link-open">
          <ArrowSquareOut size={16} weight="regular" />
          Open link
        </button>
        <button onClick={onClose} className="btn-brand flex-1" data-testid="add-link-done">
          Done
        </button>
      </div>
    </div>
  );
}
