import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Trash,
  DeviceMobile,
  Star,
  DownloadSimple,
  CurrencyDollar,
  CursorClick,
  Eye,
  CheckCircle,
  X,
} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { TabHeader, RefreshButton, ErrorBanner, StatCard, EmptyState, StatusPill } from "./_primitives";

export function CampaignsTab() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New campaign form state
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("meta");
  const [spend, setSpend] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminCampaigns();
      setData(res);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load campaigns telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = data?.totals || {
    total_spend_usd: 0,
    total_impressions: 0,
    total_clicks: 0,
    active_campaigns: 0,
  };
  const campaigns = data?.campaigns || [];
  const appStore = data?.app_store || null;

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a campaign name");
      return;
    }
    setIsSaving(true);
    try {
      await api.adminCreateCampaign({
        name: name.trim(),
        channel,
        spend_usd: parseFloat(spend) || 0,
        status: "active",
        utm_source: utmSource.trim() || undefined,
        utm_campaign: utmCampaign.trim() || undefined,
        impressions: parseInt(impressions, 10) || 0,
        clicks: parseInt(clicks, 10) || 0,
        notes: notes.trim() || undefined,
      });
      toast.success("Campaign recorded successfully!");
      setIsModalOpen(false);
      // Reset form
      setName("");
      setSpend("");
      setUtmSource("");
      setUtmCampaign("");
      setImpressions("");
      setClicks("");
      setNotes("");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to create campaign");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Delete this campaign record?")) return;
    try {
      await api.adminDeleteCampaign(id);
      toast.success("Campaign record removed");
      await load();
    } catch (e) {
      toast.error(e?.message || "Failed to delete campaign");
    }
  };

  return (
    <>
      <TabHeader
        title="Campaigns & App Store Hub"
        subtitle="Manage ad spend, calculate CAC from UTM sources, and monitor mobile App Store release tracks."
        testId="campaigns-tab-header"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-brand !min-h-[40px] !px-4 text-ds-sm flex items-center gap-1.5"
            >
              <Plus size={16} weight="bold" />
              Add Campaign / Spend
            </button>
            <RefreshButton onClick={load} loading={loading} testId="campaigns-refresh" />
          </div>
        }
      />

      <ErrorBanner message={err} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Ad Spend"
          value={`$${Number(totals.total_spend_usd).toFixed(2)}`}
          hint="All channels combined"
          testId="campaigns-stat-spend"
        />
        <StatCard
          label="Total Impressions"
          value={Number(totals.total_impressions).toLocaleString()}
          hint="Recorded audience reach"
          testId="campaigns-stat-impressions"
        />
        <StatCard
          label="Total Clicks"
          value={Number(totals.total_clicks).toLocaleString()}
          hint={
            totals.total_impressions > 0
              ? `${((totals.total_clicks / totals.total_impressions) * 100).toFixed(2)}% CTR`
              : "0.00% CTR"
          }
          testId="campaigns-stat-clicks"
        />
        <StatCard
          label="Active Campaigns"
          value={totals.active_campaigns}
          hint="Currently running"
          testId="campaigns-stat-active"
        />
      </div>

      {/* Mobile App Store Section */}
      {appStore && (
        <div className="mb-8">
          <h3 className="text-ds-sm font-semibold uppercase tracking-[0.14em] text-on-surface-secondary mb-3 flex items-center gap-2">
            <DeviceMobile size={18} weight="duotone" className="text-brand" />
            Mobile App Store Telemetry (iOS & Android)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Apple App Store */}
            <div className="rounded-ds-lg border border-ds-border bg-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-on-surface font-bold text-ds-sm">
                    
                  </span>
                  <div>
                    <h4 className="text-ds-base font-semibold text-on-surface">Apple App Store</h4>
                    <span className="text-ds-xs text-on-surface-secondary">{appStore.ios.version}</span>
                  </div>
                </div>
                <span className="pill text-ds-xs bg-brand-tertiary text-brand font-medium">
                  {appStore.ios.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ds-border/60 text-center">
                <div>
                  <div className="text-ds-xs text-on-surface-secondary">Rating</div>
                  <div className="text-ds-base font-bold text-on-surface flex items-center justify-center gap-1">
                    <Star size={14} weight="fill" className="text-amber-500" />
                    {appStore.ios.rating}
                  </div>
                </div>
                <div>
                  <div className="text-ds-xs text-on-surface-secondary">30d Installs</div>
                  <div className="text-ds-base font-bold text-on-surface">
                    {appStore.ios.installs_30d.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-ds-xs text-on-surface-secondary">Active Devices</div>
                  <div className="text-ds-base font-bold text-on-surface">
                    {appStore.ios.active_devices.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Google Play Store */}
            <div className="rounded-ds-lg border border-ds-border bg-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-brand font-bold text-ds-sm">
                    ▶
                  </span>
                  <div>
                    <h4 className="text-ds-base font-semibold text-on-surface">Google Play Store</h4>
                    <span className="text-ds-xs text-on-surface-secondary">{appStore.android.version}</span>
                  </div>
                </div>
                <span className="pill text-ds-xs bg-brand-tertiary text-brand font-medium">
                  {appStore.android.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ds-border/60 text-center">
                <div>
                  <div className="text-ds-xs text-on-surface-secondary">Rating</div>
                  <div className="text-ds-base font-bold text-on-surface flex items-center justify-center gap-1">
                    <Star size={14} weight="fill" className="text-amber-500" />
                    {appStore.android.rating}
                  </div>
                </div>
                <div>
                  <div className="text-ds-xs text-on-surface-secondary">30d Installs</div>
                  <div className="text-ds-base font-bold text-on-surface">
                    {appStore.android.installs_30d.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-ds-xs text-on-surface-secondary">Active Devices</div>
                  <div className="text-ds-base font-bold text-on-surface">
                    {appStore.android.active_devices.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns & Ad Spend Table */}
      <div className="rounded-ds-lg border border-ds-border bg-surface overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-ds-border bg-surface-secondary/40 flex items-center justify-between">
          <span className="text-ds-sm font-semibold uppercase tracking-[0.1em] text-on-surface flex items-center gap-2">
            <Megaphone size={16} weight="duotone" className="text-brand" />
            Ad Spend & Acquisition Campaigns
          </span>
          <span className="text-ds-xs text-on-surface-secondary">
            {campaigns.length} recorded campaign{campaigns.length === 1 ? "" : "s"}
          </span>
        </div>

        {campaigns.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <p className="text-ds-base font-medium text-on-surface">No ad campaigns recorded yet</p>
            <p className="text-ds-sm text-on-surface-secondary mt-1 max-w-md mx-auto">
              Track your Meta, Google, TikTok, or influencer ad spend to calculate true customer acquisition cost (CAC).
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-brand mt-4 !min-h-[38px] !px-4 text-ds-sm inline-flex items-center gap-1.5"
            >
              <Plus size={15} weight="bold" />
              Add First Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-ds-sm">
              <thead className="bg-surface-secondary text-on-surface-secondary uppercase text-[11px] tracking-wider border-b border-ds-border">
                <tr>
                  <th className="py-3.5 px-6">Campaign</th>
                  <th className="py-3.5 px-4">Channel</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Spend</th>
                  <th className="py-3.5 px-4">Impr / Clicks</th>
                  <th className="py-3.5 px-4">Signups</th>
                  <th className="py-3.5 px-4">CAC</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ds-border">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-secondary/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-on-surface">
                      <div>{c.name}</div>
                      {c.utm_source && (
                        <span className="text-ds-xs text-on-surface-secondary font-mono">
                          utm_source={c.utm_source}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 capitalize text-on-surface font-medium">
                      {c.channel}
                    </td>
                    <td className="py-4 px-4">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="py-4 px-4 font-semibold text-on-surface">
                      ${c.spend_usd.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-on-surface-secondary">
                      {c.impressions.toLocaleString()} / <b>{c.clicks.toLocaleString()}</b>
                      {c.ctr_percent != null && (
                        <div className="text-[11px] text-brand">{c.ctr_percent}% CTR</div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-on-surface">
                      {c.signups}
                    </td>
                    <td className="py-4 px-4">
                      {c.cac_usd != null ? (
                        <span className="font-semibold text-brand">${c.cac_usd.toFixed(2)}</span>
                      ) : (
                        <span className="text-on-surface-secondary text-ds-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteCampaign(c.id)}
                        className="text-on-surface-secondary hover:text-ds-error transition-colors p-1.5 rounded-lg hover:bg-surface-secondary"
                        title="Delete campaign record"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-[2px]">
          <div className="bg-surface border border-ds-border rounded-2xl w-full max-w-lg overflow-hidden shadow-tier-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-ds-border flex items-center justify-between bg-surface-secondary/40">
              <h3 className="text-ds-lg font-semibold text-on-surface flex items-center gap-2">
                <Megaphone size={18} className="text-brand" weight="duotone" />
                Add Ad Campaign / Spend
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-secondary hover:text-on-surface p-1 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 flex flex-col gap-4 text-ds-sm">
              <div>
                <label className="block text-on-surface-secondary font-medium mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Meta Reels Video Ad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-on-surface-secondary font-medium mb-1">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="field-input w-full"
                  >
                    <option value="meta">Meta (Instagram / Facebook)</option>
                    <option value="google">Google Search / Display</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="apple_search">Apple Search Ads</option>
                    <option value="influencer">Influencer / Sponsorship</option>
                    <option value="newsletter">Newsletter Ad</option>
                    <option value="organic">Organic Campaign</option>
                  </select>
                </div>
                <div>
                  <label className="block text-on-surface-secondary font-medium mb-1">
                    Total Spend (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 250.00"
                    value={spend}
                    onChange={(e) => setSpend(e.target.value)}
                    className="field-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-on-surface-secondary font-medium mb-1">
                    UTM Source (for attribution)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ig_reels"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="field-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-secondary font-medium mb-1">
                    UTM Campaign
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. fall_launch"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    className="field-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-on-surface-secondary font-medium mb-1">
                    Impressions
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 15000"
                    value={impressions}
                    onChange={(e) => setImpressions(e.target.value)}
                    className="field-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-secondary font-medium mb-1">
                    Clicks
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 420"
                    value={clicks}
                    onChange={(e) => setClicks(e.target.value)}
                    className="field-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-secondary font-medium mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Target audience, creative variant, or coupon notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="field-input w-full !text-ds-sm resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-ds-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-2 px-4"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brand py-2 px-5"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving…" : "Save Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
