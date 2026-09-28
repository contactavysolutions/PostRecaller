import { useCallback, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  BookmarkSimple,
  Globe,
  Tag,
  TrendUp,
  FolderSimple,
} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { TabHeader, RefreshButton, ErrorBanner, EmptyState, StatCard } from "./_primitives";

const RANGE_OPTIONS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

const PLATFORM_COLORS = {
  youtube: "#E05A47",
  reddit: "#FF4500",
  twitter: "#1DA1F2",
  x: "#1DA1F2",
  instagram: "#E1306C",
  tiktok: "#00F2FE",
  facebook: "#1877F2",
  pinterest: "#BD081C",
  github: "#6e5494",
  web: "#4A5D4E",
};

export function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminAnalytics(days);
      setData(res);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load product analytics");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = data?.totals || {
    total_items: 0,
    total_users: 0,
    saves_this_period: 0,
    active_savers: 0,
  };
  const platforms = data?.platforms || [];
  const intents = data?.intents || [];
  const topTags = data?.top_tags || [];
  const dailySaves = data?.daily_saves || [];

  return (
    <>
      <TabHeader
        title="Product & Vault Analytics"
        subtitle={`User saving activity, platform distribution, and intent trends across the last ${days} days.`}
        testId="analytics-tab-header"
        actions={
          <>
            <div
              className="inline-flex bg-surface-secondary rounded-ds-pill p-1"
              role="tablist"
              aria-label="Time range"
            >
              {RANGE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setDays(o.value)}
                  data-testid={`analytics-range-${o.value}`}
                  className={`px-3 py-1.5 text-ds-sm rounded-ds-pill transition-colors ${
                    days === o.value
                      ? "bg-brand text-on-brand"
                      : "text-on-surface-secondary hover:text-on-surface"
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <RefreshButton onClick={load} loading={loading} testId="analytics-refresh" />
          </>
        }
      />

      <ErrorBanner message={err} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Items Saved"
          value={Number(totals.total_items).toLocaleString()}
          hint="All-time active saves"
          testId="analytics-stat-total-items"
        />
        <StatCard
          label="Saves This Period"
          value={Number(totals.saves_this_period).toLocaleString()}
          hint={`Last ${days} days velocity`}
          testId="analytics-stat-period-saves"
        />
        <StatCard
          label="Active Savers"
          value={Number(totals.active_savers).toLocaleString()}
          hint="Distinct users saving links"
          testId="analytics-stat-active-users"
        />
        <StatCard
          label="Total Registered Users"
          value={Number(totals.total_users).toLocaleString()}
          hint="Total vault accounts"
          testId="analytics-stat-total-users"
        />
      </div>

      {dailySaves.length === 0 && !loading && (
        <EmptyState
          title="No save data recorded"
          body="Visualizations will populate as users save articles, social posts, and bookmarks."
          testId="analytics-empty"
        />
      )}

      {/* Save Velocity Chart */}
      {dailySaves.length > 0 && (
        <div className="rounded-ds-lg border border-ds-border bg-surface p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-ds-lg font-semibold text-on-surface flex items-center gap-2">
                <TrendUp size={18} weight="bold" className="text-brand" />
                Daily Save Velocity
              </h3>
              <p className="text-ds-sm text-on-surface-secondary">
                Number of URLs and bookmarks ingested per day.
              </p>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySaves} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="saveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A5D4E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4A5D4E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} saves`, "Volume"]}
                  contentStyle={{
                    background: "rgb(var(--surface))",
                    border: "1px solid rgb(var(--ds-border))",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="saves"
                  stroke="#4A5D4E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#saveGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Platform & Intent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Saves by Platform */}
        <div className="rounded-ds-lg border border-ds-border bg-surface p-6 flex flex-col">
          <h3 className="text-ds-lg font-semibold text-on-surface mb-1 flex items-center gap-2">
            <Globe size={18} weight="duotone" className="text-brand" />
            Saves by Source Platform
          </h3>
          <p className="text-ds-sm text-on-surface-secondary mb-4">
            Where your users discover content they want to remember.
          </p>

          {platforms.length > 0 ? (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platforms} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="platform"
                    type="category"
                    tick={{ fontSize: 12, textTransform: "capitalize" }}
                    width={75}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} items`, "Count"]}
                    contentStyle={{
                      background: "rgb(var(--surface))",
                      border: "1px solid rgb(var(--ds-border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {platforms.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PLATFORM_COLORS[entry.platform.toLowerCase()] || "#4A5D4E"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-on-surface-secondary text-ds-sm">
              No platform signals detected yet.
            </div>
          )}
        </div>

        {/* Intent Distribution */}
        <div className="rounded-ds-lg border border-ds-border bg-surface p-6 flex flex-col">
          <h3 className="text-ds-lg font-semibold text-on-surface mb-1 flex items-center gap-2">
            <FolderSimple size={18} weight="duotone" className="text-brand" />
            AI Intent Collections
          </h3>
          <p className="text-ds-sm text-on-surface-secondary mb-4">
            How Gemini automatically classifies content intent.
          </p>

          {intents.length > 0 ? (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={intents} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="intent" tick={{ fontSize: 11 }} />
                  <YAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val} saves`, "Intent"]}
                    contentStyle={{
                      background: "rgb(var(--surface))",
                      border: "1px solid rgb(var(--ds-border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#C26E5D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-on-surface-secondary text-ds-sm">
              No intent classifications populated yet.
            </div>
          )}
        </div>
      </div>

      {/* Top 20 Tags Cloud */}
      <div className="rounded-ds-lg border border-ds-border bg-surface p-6">
        <h3 className="text-ds-lg font-semibold text-on-surface mb-1 flex items-center gap-2">
          <Tag size={18} weight="duotone" className="text-brand" />
          Top 20 Topic Tags
        </h3>
        <p className="text-ds-sm text-on-surface-secondary mb-4">
          Most frequent tags across user vaults and browser folders.
        </p>

        {topTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {topTags.map((t) => (
              <span
                key={t.tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-ds-pill bg-surface-secondary text-on-surface text-ds-sm border border-ds-border/60 hover:border-brand/40 transition-colors"
              >
                <span className="font-medium">#{t.tag}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-tertiary text-brand">
                  {t.count}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-secondary text-ds-sm py-4">
            Tags will appear here as items are enriched or imported.
          </p>
        )}
      </div>
    </>
  );
}
