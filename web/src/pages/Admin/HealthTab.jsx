import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  WarningCircle,
  Info,
  Database,
  HardDrives,
  Stack,
  FolderSimple,
} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { TabHeader, RefreshButton, ErrorBanner, StatCard } from "./_primitives";

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
      className="flex items-start justify-between gap-4 px-6 py-4 border-b border-ds-border last:border-b-0"
      data-testid={testId}
    >
      <div className="flex items-start gap-4">
        <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${tone}`}>
          <Icon size={18} weight="fill" />
        </span>
        <div>
          <p className="text-ds-base text-on-surface font-medium">
            {check.name}
          </p>
          <p className="text-ds-sm text-on-surface-secondary mt-0.5">{check.detail}</p>
        </div>
      </div>
      <span
        className={`text-[11px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-ds-pill shrink-0 ${tone}`}
        style={{ fontWeight: 500 }}
      >
        {label}
      </span>
    </div>
  );
}

export function HealthTab() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [dbData, setDbData] = useState(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, dbRes] = await Promise.all([
        api.adminHealth(),
        api.adminDatabase().catch((e) => ({ ok: false, error: e?.message })),
      ]);
      setHealthData(hRes);
      setDbData(dbRes);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load system diagnostics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checks = healthData?.checks || [];
  const anyFail = checks.some((c) => !c.ok && !c.optional);

  return (
    <>
      <TabHeader
        title="System Health & Database"
        subtitle={
          healthData?.checked_at
            ? `Last checked ${new Date(healthData.checked_at).toLocaleTimeString()} • MongoDB "${dbData?.db_name || "postrecaller"}"`
            : "Live diagnostics, storage footprint, and external service checks."
        }
        testId="health-tab-header"
        actions={<RefreshButton onClick={load} loading={loading} testId="health-refresh" />}
      />

      <ErrorBanner message={err} />

      {/* Database Footprint Stat Cards */}
      <div className="mb-6">
        <h3 className="text-ds-sm font-semibold uppercase tracking-[0.14em] text-on-surface-secondary mb-3 flex items-center gap-2">
          <Database size={16} weight="duotone" className="text-brand" />
          MongoDB Storage & Footprint
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Disk Storage"
            value={dbData?.storage_size_mb != null ? `${dbData.storage_size_mb} MB` : "—"}
            hint="Allocated disk footprint"
            testId="db-stat-storage"
          />
          <StatCard
            label="Data Size"
            value={dbData?.data_size_mb != null ? `${dbData.data_size_mb} MB` : "—"}
            hint="Uncompressed raw payload"
            testId="db-stat-data"
          />
          <StatCard
            label="Index Size"
            value={dbData?.index_size_mb != null ? `${dbData.index_size_mb} MB` : "—"}
            hint="Memory/disk index memory"
            testId="db-stat-index"
          />
          <StatCard
            label="Total Documents"
            value={dbData?.total_objects != null ? Number(dbData.total_objects).toLocaleString() : "—"}
            hint={`Across ${dbData?.collections_count || 6} collections`}
            testId="db-stat-docs"
          />
        </div>
      </div>

      {/* Collections Breakdown Table */}
      {dbData?.collections && (
        <div className="mb-8 rounded-ds-lg border border-ds-border bg-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-ds-border bg-surface-secondary/40 flex items-center justify-between">
            <span className="text-ds-sm font-semibold uppercase tracking-[0.1em] text-on-surface flex items-center gap-2">
              <FolderSimple size={16} weight="duotone" className="text-brand" />
              Collections Breakdown
            </span>
            <span className="text-ds-xs text-on-surface-secondary">
              Ping latency: <b>{dbData.ping_ms || 1} ms</b>
            </span>
          </div>
          <div className="divide-y divide-ds-border">
            {dbData.collections.map((c) => (
              <div key={c.name} className="px-6 py-3.5 flex items-center justify-between hover:bg-surface-secondary/20 transition-colors">
                <div>
                  <span className="font-mono text-ds-sm font-semibold text-brand">
                    {c.name}
                  </span>
                  <p className="text-ds-xs text-on-surface-secondary">{c.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-ds-base font-semibold text-on-surface">
                    {c.count.toLocaleString()}
                  </span>
                  <span className="text-ds-xs text-on-surface-secondary ml-1">docs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Service Health Checks */}
      <div className="mb-4">
        <h3 className="text-ds-sm font-semibold uppercase tracking-[0.14em] text-on-surface-secondary mb-3 flex items-center gap-2">
          <HardDrives size={16} weight="duotone" className="text-brand" />
          Service Integrations & APIs
        </h3>
        <div
          className={`rounded-ds-md px-5 py-3 mb-4 border ${
            anyFail
              ? "border-ds-error/40 bg-ds-error/5 text-ds-error"
              : "border-brand/30 bg-brand-tertiary text-on-brand-tertiary"
          }`}
          data-testid="health-summary"
        >
          <p className="text-ds-base font-medium">
            {anyFail ? "One or more critical dependencies need attention" : "All critical services operational"}
          </p>
          <p className="text-ds-xs opacity-80 mt-0.5">
            {anyFail
              ? "Check credentials in backend/.env to restore full functionality."
              : "MongoDB, Gemini LLM, and Resend are properly connected."}
          </p>
        </div>

        <div className="rounded-ds-lg border border-ds-border bg-surface overflow-hidden" data-testid="health-checks">
          {loading && (
            <div className="px-6 py-6 text-on-surface-secondary text-ds-base">Checking services…</div>
          )}
          {!loading && checks.map((c) => (
            <CheckRow key={c.name} check={c} testId={`health-check-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} />
          ))}
        </div>
      </div>
    </>
  );
}
