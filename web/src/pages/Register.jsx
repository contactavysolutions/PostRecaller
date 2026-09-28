import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Warning } from "@phosphor-icons/react";
import { toast } from "sonner";

import { AuthShell, Field } from "@/components/AuthShell";
import { api, auth } from "@/lib/api";
import { IS_WAITLIST_MODE } from "@/constants/config";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Register() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const inviteToken = params.get("invite") || "";

  const [checking, setChecking] = useState(true);
  const [inviteError, setInviteError] = useState("");
  const [email, setEmail] = useState("");
  const [emailLocked, setEmailLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Preflight the invite token.
  useEffect(() => {
    if (!inviteToken) {
      setChecking(false);
      return;
    }
    api
      .validateInvite(inviteToken)
      .then((res) => {
        setEmail(res.email || "");
        setEmailLocked(true);
        setInviteError("");
      })
      .catch((err) => {
        setInviteError(err?.message || "This invite link is invalid or has expired.");
      })
      .finally(() => setChecking(false));
  }, [inviteToken]);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email";
    if (!password || password.length < 6) next.password = "At least 6 characters";
    if (password !== confirm) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await api.register({
        email: email.trim().toLowerCase(),
        password,
        invite_token: inviteToken || undefined,
      });
      // Auto sign-in for a smooth first-run.
      const loginRes = await api.login(email.trim().toLowerCase(), password);
      auth.token = loginRes.access_token;
      toast.success("Welcome to PostRecaller");
      if (loginRes.user?.is_admin) nav("/admin", { replace: true });
      else nav("/vault", { replace: true });
    } catch (err) {
      toast.error(err?.message || "Registration failed");
      setErrors({ password: err?.message || "Registration failed" });
    } finally {
      setSubmitting(false);
    }
  };

  // --- No invite token → invite-only gate (only in waitlist mode).
  if (IS_WAITLIST_MODE && !inviteToken) {
    return (
      <AuthShell
        title="Registration is invite-only"
        subtitle="PostRecaller is in private beta. Join the waitlist and we'll email you the moment your invite is ready."
        testId="register-locked"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-ds-md bg-surface-secondary p-4 text-ds-base text-on-surface-secondary">
            <Warning size={20} weight="regular" className="text-brand-secondary mt-0.5 shrink-0" />
            <p>You need a valid invite link to create an account. Already have one? Open it from your email.</p>
          </div>
          <Link
            to="/"
            data-testid="register-locked-cta"
            className="btn-brand"
          >
            Join the waitlist
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  // --- Checking token.
  if (checking) {
    return (
      <AuthShell title="Checking your invite…" subtitle="One moment." testId="register-checking">
        <div className="h-12 rounded-ds-md bg-surface-secondary animate-pulse" />
      </AuthShell>
    );
  }

  // --- Invite invalid / expired.
  if (inviteError) {
    return (
      <AuthShell title="This invite can't be used" subtitle={inviteError} testId="register-invalid">
        <div className="flex flex-col gap-3">
          <Link to="/" className="btn-brand" data-testid="register-invalid-cta">
            Back to the waitlist
            <ArrowRight size={18} weight="bold" />
          </Link>
          <div className="text-ds-base text-on-surface-secondary">
            Already have an account?{" "}
            <Link to="/login" className="text-brand hover:underline" style={{ fontWeight: 500 }}>
              Sign in
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  // --- Valid invite or open registration → registration form.
  return (
    <AuthShell
      title={inviteToken ? "Claim your invite" : "Create your account"}
      subtitle={inviteToken ? "One quick form and your vault is ready." : "One quick form and your vault is ready."}
      testId="register-page"
      footer={
        <span>
          Already registered?{" "}
          <Link to="/login" className="text-brand hover:underline" data-testid="register-login-link" style={{ fontWeight: 500 }}>
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="reg-email" error={errors.email} testId="register-email-field">
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            data-testid="register-email-input"
            value={email}
            readOnly={emailLocked}
            onChange={(e) => setEmail(e.target.value)}
            className={`field-input ${errors.email ? "field-input-error" : ""} ${emailLocked ? "opacity-70 cursor-not-allowed" : ""}`}
          />
        </Field>
        <Field label="Password" htmlFor="reg-pw" error={errors.password} testId="register-password-field">
          <input
            id="reg-pw"
            type="password"
            autoComplete="new-password"
            data-testid="register-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`field-input ${errors.password ? "field-input-error" : ""}`}
            placeholder="At least 6 characters"
          />
        </Field>
        <Field label="Confirm password" htmlFor="reg-pw-c" error={errors.confirm} testId="register-confirm-field">
          <input
            id="reg-pw-c"
            type="password"
            autoComplete="new-password"
            data-testid="register-confirm-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`field-input ${errors.confirm ? "field-input-error" : ""}`}
          />
        </Field>

        <p className="text-ds-sm text-on-surface-secondary">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="text-on-surface hover:underline">Terms</Link> and{" "}
          <Link to="/privacy" className="text-on-surface hover:underline">Privacy Policy</Link>.
        </p>

        <button type="submit" data-testid="register-submit" disabled={submitting} className="btn-brand mt-1">
          {submitting ? "Creating account…" : "Create my vault"}
          {!submitting && <ArrowRight size={18} weight="bold" />}
        </button>
      </form>
    </AuthShell>
  );
}
