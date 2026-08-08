import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { toast } from "sonner";

import { AuthShell, Field } from "@/components/AuthShell";
import { api } from "@/lib/api";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ResetPassword() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email";
    if (!/^\d{6}$/.test(code)) next.code = "Enter the 6-digit code";
    if (!password || password.length < 6) next.password = "At least 6 characters";
    if (password !== confirm) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await api.resetPassword(email.trim().toLowerCase(), code, password);
      toast.success("Password updated — you can sign in now.");
      nav("/login", { replace: true });
    } catch (err) {
      toast.error(err?.message || "Invalid or expired code");
      setErrors({ code: err?.message || "Invalid or expired code" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Enter your reset code"
      subtitle="We emailed a 6-digit code. Enter it below with your new password."
      testId="reset-page"
      footer={
        <Link to="/login" className="text-brand hover:underline" data-testid="reset-back-login" style={{ fontWeight: 500 }}>
          ← Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="rp-email" error={errors.email} testId="reset-email-field">
          <input
            id="rp-email"
            type="email"
            data-testid="reset-email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`field-input ${errors.email ? "field-input-error" : ""}`}
          />
        </Field>
        <Field label="6-digit code" htmlFor="rp-code" error={errors.code} testId="reset-code-field">
          <input
            id="rp-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            data-testid="reset-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`field-input tracking-[0.4em] text-center ${errors.code ? "field-input-error" : ""}`}
            placeholder="000000"
          />
        </Field>
        <Field label="New password" htmlFor="rp-pw" error={errors.password} testId="reset-password-field">
          <input
            id="rp-pw"
            type="password"
            autoComplete="new-password"
            data-testid="reset-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`field-input ${errors.password ? "field-input-error" : ""}`}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="rp-pw-c" error={errors.confirm} testId="reset-confirm-field">
          <input
            id="rp-pw-c"
            type="password"
            autoComplete="new-password"
            data-testid="reset-confirm-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`field-input ${errors.confirm ? "field-input-error" : ""}`}
          />
        </Field>

        <button type="submit" disabled={submitting} data-testid="reset-submit" className="btn-brand mt-1">
          {submitting ? "Updating…" : "Update password"}
          {!submitting && <ArrowRight size={18} weight="bold" />}
        </button>
      </form>
    </AuthShell>
  );
}
