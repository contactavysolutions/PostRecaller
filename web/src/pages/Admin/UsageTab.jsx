import { useCallback, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { api } from "@/lib/api";
import { TabHeader, RefreshButton, ErrorBanner, EmptyState, StatCard } from "./_primitives";

const RANGE_OPTIONS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

function fmtCost(n) {
  return `$${(n || 0).toFixed(4)}`;
}
function fmtInt(n) {
  return (n || 0).toLocaleString();
}

export function UsageTab() {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminUsage(days);
      setData(res);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load usage");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = data?.totals || { calls: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 };
  const daily = data?.daily || [];
  const topUsers = data?.top_users || [];
  const perModel = data?.per_model || [];

  return (
    <>
      <TabHeader
        title="AI Usage"
        subtitle={`Enrichment activity across all users. Last ${days} days.`}
        testId="usage-tab-header"
        actions={
          <>
            <div className="inline-flex bg-surface-secondary rounded-ds-pill p-1" role="tablist" aria-label="Time range">
              {RANGE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setDays(o.value)}
                  data-testid={`usage-range-${o.value}`}
                  className={`px-3 py-1.5 text-ds-sm rounded-ds-pill transition-colors ${
                    days === o.value ? "bg-brand text-on-brand" : "text-on-surface-secondary hover:text-on-surface"
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <RefreshButton onClick={load} loading={loading} testId="usage-refresh" />
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total calls" value={fmtInt(totals.calls)} testId="usage-stat-calls" />
        <StatCard label="Input tokens" value={fmtInt(totals.input_tokens)} testId="usage-stat-in-tokens" />
        <StatCard label="Output tokens" value={fmtInt(totals.output_tokens)} testId="usage-stat-out-tokens" />
        <StatCard label="Estimated cost" value={fmtCost(totals.cost_usd)} hint="USD, based on model rate card" testId="usage-stat-cost" />
      </div>

      <ErrorBanner message={err} />

      {daily.length === 0 && !loading ? (
        <EmptyState
          title="No enrichment activity yet"
          body="Charts will populate as users start saving and re-enriching links."
          testId="usage-empty"
        />
      ) : (
        <>
          {/* --- Daily cost area chart --- */}
          <div className="rounded-ds-lg border border-ds-border bg-surface p-6 mb-8" data-testid="usage-chart-daily">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-ds-xl text-on-surface" style={{ fontWeight: 500, letterSpacing: "-0.015em" }}>
                Daily cost
              </h3>
              <span className="text-ds-sm text-on-surface-secondary">USD</span>
            </div>
            <div className="w-full h-[240px]">
              <ResponsiveContainer>
                <AreaChart data={daily} margin={{ top: 6, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(74,93,78)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="rgb(74,93,78)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgb(235,235,230)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="rgb(78,78,74)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgb(78,78,74)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(3)}`} />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(251,251,249)",
                      border: "1px solid rgb(235,235,230)",
                      borderRadius: 12,
                      fontFamily: "'Satoshi','Plus Jakarta Sans',sans-serif",
                      fontSize: 13,
                    }}
                    formatter={(v) => [fmtCost(v), "Cost"]}
                    labelStyle={{ color: "rgb(78,78,74)" }}
                  />
                  <Area type="monotone" dataKey="cost_usd" stroke="rgb(74,93,78)" strokeWidth={2} fill="url(#costFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --- Daily calls bar chart --- */}
          <div className="rounded-ds-lg border border-ds-border bg-surface p-6 mb-8" data-testid="usage-chart-calls">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-ds-xl text-on-surface" style={{ fontWeight: 500, letterSpacing: "-0.015em" }}>
                Daily calls
              </h3>
              <span className="text-ds-sm text-on-surface-secondary">count</span>
            </div>
            <div className="w-full h-[220px]">
              <ResponsiveContainer>
                <BarChart data={daily} margin={{ top: 6, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid stroke="rgb(235,235,230)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="rgb(78,78,74)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgb(78,78,74)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(251,251,249)",
                      border: "1px solid rgb(235,235,230)",
                      borderRadius: 12,
                      fontFamily: "'Satoshi','Plus Jakarta Sans',sans-serif",
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="calls" fill="rgb(194,110,93)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* --- Top spenders + per-model breakdown side by side --- */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-ds-lg border border-ds-border bg-surface overflow-hidden" data-testid="usage-top-users">
          <div className="px-6 pt-5 pb-3 flex items-baseline justify-between">
            <h3 className="text-ds-xl text-on-surface" style={{ fontWeight: 500, letterSpacing: "-0.015em" }}>
              Top spenders
            </h3>
            <span className="text-ds-sm text-on-surface-secondary">By cost</span>
          </div>
          {topUsers.length === 0 ? (
            <div className="px-6 pb-6 text-on-surface-secondary text-ds-base">No usage data yet.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="text-on-surface-secondary text-ds-sm uppercase tracking-[0.12em] bg-surface-secondary">
                <tr>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-right">Calls</th>
                  <th className="px-5 py-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u) => (
                  <tr key={u.user_id} className="border-t border-ds-border">
                    <td className="px-5 py-3 text-on-surface truncate max-w-[220px]" style={{ fontWeight: 500 }}>{u.email}</td>
                    <td className="px-5 py-3 text-right text-on-surface tabular-nums">{fmtInt(u.calls)}</td>
                    <td className="px-5 py-3 text-right text-on-surface tabular-nums" style={{ fontWeight: 500 }}>{fmtCost(u.cost_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-ds-lg border border-ds-border bg-surface overflow-hidden" data-testid="usage-per-model">
          <div className="px-6 pt-5 pb-3">
            <h3 className="text-ds-xl text-on-surface" style={{ fontWeight: 500, letterSpacing: "-0.015em" }}>
              Per model
            </h3>
          </div>
          {perModel.length === 0 ? (
            <div className="px-6 pb-6 text-on-surface-secondary text-ds-base">No usage data yet.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="text-on-surface-secondary text-ds-sm uppercase tracking-[0.12em] bg-surface-secondary">
                <tr>
                  <th className="px-5 py-3 text-left">Model</th>
                  <th className="px-5 py-3 text-right">Calls</th>
                  <th className="px-5 py-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {perModel.map((m) => (
                  <tr key={m.model} className="border-t border-ds-border">
                    <td className="px-5 py-3 text-on-surface" style={{ fontWeight: 500 }}>{m.model}</td>
                    <td className="px-5 py-3 text-right text-on-surface tabular-nums">{fmtInt(m.calls)}</td>
                    <td className="px-5 py-3 text-right text-on-surface tabular-nums" style={{ fontWeight: 500 }}>{fmtCost(m.cost_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
