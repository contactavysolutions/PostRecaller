import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { toast } from "sonner";

import { AuthShell, Field } from "@/components/AuthShell";
import { api, auth } from "@/lib/api";
import { IS_WAITLIST_MODE } from "@/constants/config";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const res = await api.login(email.trim().toLowerCase(), password);
      auth.token = res.access_token;
      toast.success("Welcome back");
      // Route admins directly to /admin; others land on /vault (Phase 4).
      if (res.user?.is_admin) nav("/admin", { replace: true });
      else nav("/vault", { replace: true });
    } catch (err) {
      toast.error(err?.message || "Sign-in failed");
      setErrors({ password: err?.message || "Incorrect email or password" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Pick up right where you left off."
      testId="login-page"
      footer={
        <div className="flex items-center justify-between gap-2">
          <span>
            No account yet?{" "}
            <Link
              to={IS_WAITLIST_MODE ? "/" : "/register"}
              className="text-brand hover:underline"
              data-testid="login-back-home"
              style={{ fontWeight: 500 }}
            >
              {IS_WAITLIST_MODE ? "Join the waitlist" : "Create one"}
            </Link>
          </span>
          <Link to="/forgot-password" data-testid="login-forgot" className="text-on-surface hover:underline" style={{ fontWeight: 500 }}>
            Forgot password?
          </Link>
        </div>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="login-email" error={errors.email} testId="login-email-field">
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            data-testid="login-email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`field-input ${errors.email ? "field-input-error" : ""}`}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" htmlFor="login-password" error={errors.password} testId="login-password-field">
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            data-testid="login-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`field-input ${errors.password ? "field-input-error" : ""}`}
            placeholder="••••••••"
          />
        </Field>

        <button
          type="submit"
          data-testid="login-submit"
          disabled={submitting}
          className="btn-brand mt-2"
        >
          {submitting ? "Signing in…" : "Sign in"}
          {!submitting && <ArrowRight size={18} weight="bold" />}
        </button>
      </form>
    </AuthShell>
  );
}
