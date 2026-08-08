import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PaperPlaneTilt, ArrowsClockwise, Trash, DownloadSimple } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { TabHeader, RefreshButton, SearchInput, ErrorBanner, EmptyState, StatCard, StatusPill } from "./_primitives";

function toCSV(rows) {
  const header = ["position", "email", "status", "created_at", "invited_at"];
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((r) => header.map((k) => escape(r[k])).join(","));
  return [header.join(","), ...body].join("\n");
}

export function WaitlistTab() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminListWaitlist({
        limit: 500,
        ...(q ? { q } : {}),
        ...(status ? { status } : {}),
      });
      setEntries(res.entries || []);
      setTotal(res.total || 0);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load waitlist");
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { pending: 0, invited: 0, registered: 0 };
    for (const e of entries) c[e.status] = (c[e.status] || 0) + 1;
    return c;
  }, [entries]);

  const doApprove = async (id) => {
    setBusyId(id);
    try {
      await api.adminApproveWaitlist(id);
      toast.success("Invite sent");
      await load();
    } catch (e) {
      toast.error(e?.message || "Approve failed");
    } finally {
      setBusyId(null);
    }
  };

  const doResend = async (id) => {
    setBusyId(id);
    try {
      await api.adminResendInvite(id);
      toast.success("Invite re-sent");
      await load();
    } catch (e) {
      toast.error(e?.message || "Resend failed");
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm("Remove this waitlist entry?")) return;
    setBusyId(id);
    try {
      await api.adminDeleteWaitlist(id);
      toast.success("Removed");
      await load();
    } catch (e) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const exportCSV = () => {
    const blob = new Blob([toCSV(entries)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `postrecaller-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <TabHeader
        title="Waitlist"
        subtitle={`${total.toLocaleString()} ${total === 1 ? "person" : "people"} on the list.`}
        testId="waitlist-tab-header"
        actions={
          <>
            <button
              onClick={exportCSV}
              className="btn-outline !min-h-[40px] !px-4"
              disabled={!entries.length}
              data-testid="waitlist-export-csv"
            >
              <DownloadSimple size={16} weight="regular" />
              Export CSV
            </button>
            <RefreshButton onClick={load} loading={loading} testId="waitlist-refresh" />
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={total.toLocaleString()} testId="waitlist-stat-total" />
        <StatCard label="Pending" value={counts.pending.toLocaleString()} testId="waitlist-stat-pending" />
        <StatCard label="Invited" value={counts.invited.toLocaleString()} testId="waitlist-stat-invited" />
        <StatCard label="Registered" value={counts.registered.toLocaleString()} hint="Completed signup" testId="waitlist-stat-registered" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <SearchInput value={q} onChange={setQ} placeholder="Search by email…" testId="waitlist-search" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          data-testid="waitlist-status-filter"
          className="min-h-[40px] px-3 rounded-ds-md bg-surface-secondary border border-ds-border text-ds-base focus:outline-none focus:border-brand"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="invited">Invited</option>
          <option value="registered">Registered</option>
        </select>
      </div>

      <ErrorBanner message={err} />

      {entries.length === 0 && !loading ? (
        <EmptyState title="Nobody on the list yet" body="Waitlist entries will appear here as visitors sign up." testId="waitlist-empty" />
      ) : (
        <div className="rounded-ds-lg border border-ds-border bg-surface overflow-hidden">
          <table className="w-full text-left border-collapse" data-testid="waitlist-table">
            <thead className="bg-surface-secondary text-on-surface-secondary text-ds-sm uppercase tracking-[0.12em]">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-on-surface-secondary">Loading…</td>
                </tr>
              )}
              {!loading && entries.map((e) => (
                <tr key={e.id} className="border-t border-ds-border" data-testid={`waitlist-row-${e.id}`}>
                  <td className="px-5 py-3.5 text-on-surface-secondary tabular-nums">{e.position}</td>
                  <td className="px-5 py-3.5 text-on-surface" style={{ fontWeight: 500 }}>{e.email}</td>
                  <td className="px-5 py-3.5 text-on-surface-secondary text-ds-sm">
                    {e.created_at ? new Date(e.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3.5"><StatusPill status={e.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {e.status === "pending" && (
                        <button
                          onClick={() => doApprove(e.id)}
                          disabled={busyId === e.id}
                          data-testid={`waitlist-approve-${e.id}`}
                          className="btn-brand !min-h-[34px] !px-3 !text-ds-sm"
                        >
                          <PaperPlaneTilt size={14} weight="regular" />
                          Approve & invite
                        </button>
                      )}
                      {e.status === "invited" && (
                        <button
                          onClick={() => doResend(e.id)}
                          disabled={busyId === e.id}
                          data-testid={`waitlist-resend-${e.id}`}
                          className="btn-outline !min-h-[34px] !px-3 !text-ds-sm"
                        >
                          <ArrowsClockwise size={14} weight="regular" />
                          Resend
                        </button>
                      )}
                      {e.status !== "registered" && (
                        <button
                          onClick={() => doDelete(e.id)}
                          disabled={busyId === e.id}
                          data-testid={`waitlist-delete-${e.id}`}
                          className="btn-ghost !min-h-[34px] !px-2.5 !text-ds-sm text-on-surface-secondary hover:text-ds-error"
                          aria-label="Remove entry"
                        >
                          <Trash size={14} weight="regular" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
