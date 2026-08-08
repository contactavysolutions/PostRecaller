// Waitlist form — used inline (hero + closing CTA). Handles submit, done, error states.
import { useState } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { api } from "@/lib/api";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function WaitlistForm({ onBrand = false, onCount, testIdPrefix = "waitlist" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e?.preventDefault?.();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setState("loading");
    try {
      const res = await api.joinWaitlist(clean);
      setPosition(res.position);
      onCount?.(res.count);
      setState("done");
    } catch (err) {
      setState("error");
      setError(err?.message || "Something went wrong — try again");
    }
  };

  if (state === "done") {
    return (
      <div
        data-testid={`${testIdPrefix}-success`}
        className={`flex items-center gap-4 rounded-ds-md p-5 ${
          onBrand ? "bg-white/15" : "bg-brand-tertiary"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            onBrand ? "bg-white text-brand" : "bg-brand text-on-brand"
          }`}
        >
          <Check size={18} weight="bold" />
        </div>
        <div className="min-w-0">
          <p className={`text-ds-lg leading-tight ${onBrand ? "text-white" : "text-on-surface"}`} style={{ fontWeight: 500 }}>
            You're #{position} on the list
          </p>
          <p
            className={`text-ds-base ${
              onBrand ? "text-white/80" : "text-on-surface-secondary"
            }`}
          >
            We'll email you the moment your invite is ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          data-testid={`${testIdPrefix}-email-input`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="you@example.com"
          className={`flex-1 min-h-[54px] px-[18px] rounded-ds-md text-ds-lg transition-colors focus:outline-none ${
            onBrand
              ? "bg-white/15 border border-white/25 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/60"
              : `field-input ${error ? "field-input-error" : ""}`
          }`}
        />
        <button
          data-testid={`${testIdPrefix}-join-button`}
          type="submit"
          disabled={state === "loading"}
          className={`min-h-[54px] px-6 rounded-ds-md text-ds-lg inline-flex items-center justify-center gap-2 transition-all active:scale-[0.985] disabled:opacity-60 ${
            onBrand
              ? "bg-white text-brand hover:brightness-95"
              : "bg-brand text-on-brand hover:brightness-110"
          }`}
          style={{ fontWeight: 500 }}
        >
          {state === "loading" ? "Joining…" : "Join the waitlist"}
          {state !== "loading" && <ArrowRight size={18} weight="bold" />}
        </button>
      </div>
      <p
        className={`text-ds-sm ${
          error
            ? "text-ds-error"
            : onBrand
            ? "text-white/75"
            : "text-on-surface-secondary"
        }`}
        data-testid={`${testIdPrefix}-helper`}
      >
        {error || "No spam. Just one email when we launch."}
      </p>
    </form>
  );
}
