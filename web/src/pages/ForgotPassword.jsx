import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { toast } from "sonner";

import { AuthShell, Field } from "@/components/AuthShell";
import { api } from "@/lib/api";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.forgotPassword(email.trim().toLowerCase());
      setSent(true);
      toast.success("If an account exists, a 6-digit code is on its way.");
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="If we have an account for that email, we've sent a 6-digit reset code. It expires in 15 minutes."
        testId="forgot-sent"
        footer={
          <Link to="/login" className="text-brand hover:underline" data-testid="forgot-back-login" style={{ fontWeight: 500 }}>
            ← Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-ds-md bg-brand-tertiary p-4 text-ds-base text-on-brand-tertiary">
            <Check size={20} weight="bold" className="mt-0.5 shrink-0" />
            <p>Enter the code on the next screen along with a new password.</p>
          </div>
          <button
            onClick={() => nav(`/reset-password?email=${encodeURIComponent(email)}`)}
            className="btn-brand"
            data-testid="forgot-continue"
          >
            Enter reset code
            <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email you signed up with. We'll email you a 6-digit reset code."
      testId="forgot-page"
      footer={
        <Link to="/login" className="text-brand hover:underline" data-testid="forgot-back-login" style={{ fontWeight: 500 }}>
          ← Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="fp-email" error={error} testId="forgot-email-field">
          <input
            id="fp-email"
            type="email"
            autoComplete="email"
            data-testid="forgot-email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`field-input ${error ? "field-input-error" : ""}`}
            placeholder="you@example.com"
          />
        </Field>
        <button type="submit" disabled={submitting} data-testid="forgot-submit" className="btn-brand mt-1">
          {submitting ? "Sending…" : "Send reset code"}
          {!submitting && <ArrowRight size={18} weight="bold" />}
        </button>
      </form>
    </AuthShell>
  );
}
