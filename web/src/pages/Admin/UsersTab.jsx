import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserMinus, ArrowsClockwise, Trash, ShieldCheck } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { TabHeader, RefreshButton, SearchInput, ErrorBanner, EmptyState, StatCard, StatusPill } from "./_primitives";

function userStatus(u) {
  if (u.is_deleted) return "deleted";
  if (u.is_suspended) return "suspended";
  return "active";
}

export function UsersTab() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminUsers({ limit: 500, ...(q ? { q } : {}) });
      setUsers(res.users || []);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const doSuspend = async (id) => {
    setBusyId(id);
    try {
      await api.adminSuspendUser(id);
      toast.success("User suspended");
      await load();
    } catch (e) {
      toast.error(e?.message || "Suspend failed");
    } finally {
      setBusyId(null);
    }
  };

  const doRestore = async (id) => {
    setBusyId(id);
    try {
      await api.adminRestoreUser(id);
      toast.success("User restored");
      await load();
    } catch (e) {
      toast.error(e?.message || "Restore failed");
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm("Soft-delete this user? Their items will be hidden but preserved.")) return;
    setBusyId(id);
    try {
      await api.adminSoftDeleteUser(id);
      toast.success("User soft-deleted");
      await load();
    } catch (e) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const active = users.filter((u) => userStatus(u) === "active").length;
  const suspended = users.filter((u) => userStatus(u) === "suspended").length;
  const deleted = users.filter((u) => userStatus(u) === "deleted").length;

  return (
    <>
      <TabHeader
        title="Users"
        subtitle={`${users.length.toLocaleString()} registered ${users.length === 1 ? "account" : "accounts"}.`}
        testId="users-tab-header"
        actions={<RefreshButton onClick={load} loading={loading} testId="users-refresh" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={users.length.toLocaleString()} testId="users-stat-total" />
        <StatCard label="Active" value={active.toLocaleString()} testId="users-stat-active" />
        <StatCard label="Suspended" value={suspended.toLocaleString()} testId="users-stat-suspended" />
        <StatCard label="Soft-deleted" value={deleted.toLocaleString()} testId="users-stat-deleted" />
      </div>

      <div className="mb-5">
        <SearchInput value={q} onChange={setQ} placeholder="Search by email…" testId="users-search" />
      </div>

      <ErrorBanner message={err} />

      {users.length === 0 && !loading ? (
        <EmptyState title="No users yet" body="Users appear here after they claim an invite." testId="users-empty" />
      ) : (
        <div className="rounded-ds-lg border border-ds-border bg-surface overflow-hidden">
          <table className="w-full text-left border-collapse" data-testid="users-table">
            <thead className="bg-surface-secondary text-on-surface-secondary text-ds-sm uppercase tracking-[0.12em]">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Items</th>
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
              {!loading && users.map((u) => {
                const st = userStatus(u);
                return (
                  <tr key={u.id} className="border-t border-ds-border" data-testid={`users-row-${u.id}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface" style={{ fontWeight: 500 }}>{u.email}</span>
                        {u.is_admin && (
                          <span className="pill !px-2 !py-0.5 !text-[10.5px]">
                            <ShieldCheck size={11} weight="fill" className="text-brand" />
                            admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-secondary text-ds-sm">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-on-surface tabular-nums">{u.item_count}</td>
                    <td className="px-5 py-3.5"><StatusPill status={st} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {st === "active" && (
                          <button
                            onClick={() => doSuspend(u.id)}
                            disabled={busyId === u.id || u.is_admin}
                            data-testid={`users-suspend-${u.id}`}
                            className="btn-outline !min-h-[34px] !px-3 !text-ds-sm"
                            title={u.is_admin ? "Cannot suspend admin" : "Suspend"}
                          >
                            <UserMinus size={14} weight="regular" />
                            Suspend
                          </button>
                        )}
                        {st !== "active" && (
                          <button
                            onClick={() => doRestore(u.id)}
                            disabled={busyId === u.id}
                            data-testid={`users-restore-${u.id}`}
                            className="btn-brand !min-h-[34px] !px-3 !text-ds-sm"
                          >
                            <ArrowsClockwise size={14} weight="regular" />
                            Restore
                          </button>
                        )}
                        {!u.is_admin && st !== "deleted" && (
                          <button
                            onClick={() => doDelete(u.id)}
                            disabled={busyId === u.id}
                            data-testid={`users-delete-${u.id}`}
                            className="btn-ghost !min-h-[34px] !px-2.5 !text-ds-sm text-on-surface-secondary hover:text-ds-error"
                            aria-label="Soft-delete"
                          >
                            <Trash size={14} weight="regular" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
