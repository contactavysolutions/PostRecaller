// Auth screens share this shell — brand banner on desktop left half, form on right.
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Stack } from "@phosphor-icons/react";

export function AuthShell({ title, subtitle, children, footer, testId = "auth-shell" }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row" data-testid={testId}>
      {/* Left: brand hero panel */}
      <aside className="lg:w-[46%] xl:w-[42%] bg-brand text-on-brand p-8 md:p-14 flex flex-col justify-between overflow-hidden relative">
        <div className="relative z-10">
          <Link
            to="/"
            data-testid="auth-shell-logo"
            className="text-[22px] text-on-brand hover:opacity-80 transition-opacity inline-block"
            style={{ fontWeight: 500, letterSpacing: "-0.02em" }}
          >
            PostRecaller
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 flex flex-col gap-5 max-w-[440px]"
        >
          <Stack size={40} weight="fill" className="opacity-90" />
          <p
            className="text-[26px] md:text-[32px] leading-[1.1] tracking-[-0.02em]"
            style={{ fontWeight: 500 }}
          >
            Every link you save, one findable vault.
          </p>
          <p className="text-on-brand/80 text-ds-lg leading-relaxed">
            PostRecaller reads every article, video, and post you save — then files it away with a summary and tags so you actually find it later.
          </p>
        </motion.div>

        {/* Decorative texture */}
        <div className="pointer-events-none absolute -right-32 -bottom-32 w-[420px] h-[420px] rounded-full bg-brand-secondary/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-20 top-40 w-[260px] h-[260px] rounded-full bg-white/10 blur-2xl" aria-hidden />
      </aside>

      {/* Right: form */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px]"
        >
          <h1
            className="text-[28px] md:text-[32px] text-on-surface tracking-[-0.02em]"
            style={{ fontWeight: 500 }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-on-surface-secondary text-ds-lg leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-ds-base text-on-surface-secondary">{footer}</div>}
        </motion.div>
      </main>
    </div>
  );
}

// --- Form primitives -------------------------------------------
export function Field({ label, error, children, htmlFor, testId }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5" data-testid={testId}>
      <span className="text-ds-base text-on-surface" style={{ fontWeight: 500 }}>
        {label}
      </span>
      {children}
      {error && (
        <span className="text-ds-sm text-ds-error" data-testid={`${testId || "field"}-error`}>
          {error}
        </span>
      )}
    </label>
  );
}
