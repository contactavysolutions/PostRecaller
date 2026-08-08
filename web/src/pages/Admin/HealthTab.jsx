import { useCallback, useEffect, useState } from "react";
import { CheckCircle, WarningCircle, Info } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { TabHeader, RefreshButton, ErrorBanner } from "./_primitives";

function CheckRow({ check, testId }) {
  const isOK = check.ok;
  const isOptional = check.optional;
  const Icon = isOK ? CheckCircle : isOptional ? Info : WarningCircle;
  const tone = isOK
    ? "text-ds-success bg-brand-tertiary"
    : isOptional
    ? "text-ds-warning bg-ds-warning/10"
    : "text-ds-error bg-ds-error/10";
  const label = isOK ? "Healthy" : isOptional ? "Optional" : "Attention";

  return (
    <div
      className="flex items-start justify-between gap-4 px-6 py-5 border-b border-ds-border last:border-b-0"
      data-testid={testId}
    >
      <div className="flex items-start gap-4">
        <span className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${tone}`}>
          <Icon size={20} weight="fill" />
        </span>
        <div>
          <p className="text-ds-lg text-on-surface" style={{ fontWeight: 500, letterSpacing: "-0.01em" }}>
            {check.name}
          </p>
          <p className="text-ds-base text-on-surface-secondary mt-1">{check.detail}</p>
        </div>
      </div>
      <span
        className={`text-[11px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-ds-pill shrink-0 ${tone}`}
        style={{ fontWeight: 500 }}
      >
        {label}
      </span>
    </div>
  );
}

export function HealthTab() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminHealth();
      setData(res);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load health");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checks = data?.checks || [];
  const anyFail = checks.some((c) => !c.ok && !c.optional);

  return (
    <>
      <TabHeader
        title="System health"
        subtitle={
          data?.checked_at
            ? `Last checked ${new Date(data.checked_at).toLocaleString()}`
            : "Ping every dependency the app needs to run."
        }
        testId="health-tab-header"
        actions={<RefreshButton onClick={load} loading={loading} testId="health-refresh" />}
      />

      <ErrorBanner message={err} />

      <div
        className={`rounded-ds-md px-5 py-4 mb-6 border ${
          anyFail
            ? "border-ds-error/40 bg-ds-error/5 text-ds-error"
            : "border-brand/30 bg-brand-tertiary text-on-brand-tertiary"
        }`}
        data-testid="health-summary"
      >
        <p className="text-ds-lg" style={{ fontWeight: 500 }}>
          {anyFail ? "One or more critical dependencies need attention" : "All critical systems operational"}
        </p>
        <p className="text-ds-base opacity-80 mt-0.5">
          {anyFail
            ? "Fix the flagged items below to restore normal service."
            : "Optional dependencies (e.g. Reddit) are informational only."}
        </p>
      </div>

      <div className="rounded-ds-lg border border-ds-border bg-surface overflow-hidden" data-testid="health-checks">
        {loading && (
          <div className="px-6 py-8 text-on-surface-secondary text-ds-base">Checking…</div>
        )}
        {!loading && checks.map((c) => (
          <CheckRow key={c.name} check={c} testId={`health-check-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} />
        ))}
      </div>
    </>
  );
}
