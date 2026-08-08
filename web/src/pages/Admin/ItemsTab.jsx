import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowSquareOut, Trash, Sparkle } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { TabHeader, RefreshButton, SearchInput, ErrorBanner, EmptyState } from "./_primitives";

const PLATFORM_STYLE = {
  instagram: "bg-brand-secondary/20 text-brand-secondary",
  tiktok: "bg-on-surface/10 text-on-surface",
  youtube: "bg-ds-error/15 text-ds-error",
  x: "bg-on-surface/10 text-on-surface",
  reddit: "bg-brand-secondary/25 text-brand-secondary",
  article: "bg-brand-tertiary text-on-brand-tertiary",
  web: "bg-brand-tertiary text-on-brand-tertiary",
};

function PlatformTag({ platform }) {
  const cls = PLATFORM_STYLE[platform] || PLATFORM_STYLE.web;
  return (
    <span className={`text-[11px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-ds-pill ${cls}`} style={{ fontWeight: 500 }}>
      {platform || "web"}
    </span>
  );
}

export function ItemsTab() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminItems({
        limit: 100,
        include_deleted: includeDeleted,
        ...(q ? { q } : {}),
      });
      setItems(res.items || []);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [q, includeDeleted]);

  useEffect(() => {
    load();
  }, [load]);

  const doDelete = async (id) => {
    if (!window.confirm("Soft-delete this item? It will be hidden from the vault but preserved.")) return;
    setBusyId(id);
    try {
      await api.adminDeleteItem(id);
      toast.success("Item removed");
      await load();
    } catch (e) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const doReenrich = async (id) => {
    setBusyId(id);
    try {
      await api.adminReEnrich(id);
      toast.success("Re-enriched");
      await load();
    } catch (e) {
      toast.error(e?.message || "Re-enrich failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <TabHeader
        title="Items"
        subtitle="Recent saves across all users. Moderate, re-enrich, or remove."
        testId="items-tab-header"
        actions={<RefreshButton onClick={load} loading={loading} testId="items-refresh" />}
      />

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <SearchInput value={q} onChange={setQ} placeholder="Search by title or URL…" testId="items-search" />
        <label className="flex items-center gap-2 text-ds-base text-on-surface-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            data-testid="items-include-deleted"
            className="w-4 h-4 rounded border border-ds-border-strong accent-brand"
          />
          Include deleted
        </label>
      </div>

      <ErrorBanner message={err} />

      {items.length === 0 && !loading ? (
        <EmptyState title="No items yet" body="Saved links from members will appear here." testId="items-empty" />
      ) : (
        <div className="flex flex-col gap-3" data-testid="items-list">
          {loading && <div className="text-on-surface-secondary text-ds-base">Loading…</div>}
          {!loading && items.map((it) => (
            <div
              key={it.id}
              data-testid={`items-row-${it.id}`}
              className={`grid md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-start p-5 rounded-ds-lg border ${
                it.is_deleted ? "border-ds-error/25 bg-ds-error/5" : "border-ds-border bg-surface"
              }`}
            >
              <div className="min-w-0 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <PlatformTag platform={it.platform} />
                  {it.intent && (
                    <span className="text-[11px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-ds-pill bg-surface-secondary text-on-surface-secondary" style={{ fontWeight: 500 }}>
                      {it.intent}
                    </span>
                  )}
                  {it.is_deleted && (
                    <span className="text-[11px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-ds-pill bg-ds-error/15 text-ds-error" style={{ fontWeight: 500 }}>
                      deleted
                    </span>
                  )}
                </div>
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ds-lg text-on-surface hover:text-brand transition-colors truncate"
                  style={{ fontWeight: 500, letterSpacing: "-0.01em" }}
                >
                  {it.title || it.url}
                  <ArrowSquareOut size={14} weight="regular" className="inline ml-1.5 -mt-0.5 text-on-surface-secondary" />
                </a>
                {it.summary && (
                  <p className="text-on-surface-secondary text-ds-base leading-relaxed line-clamp-2">
                    {it.summary}
                  </p>
                )}
                <div className="flex items-center gap-3 text-ds-sm text-on-surface-secondary">
                  <span>{it.user_email || it.user_id}</span>
                  <span aria-hidden>·</span>
                  <span>{it.created_at ? new Date(it.created_at).toLocaleString() : ""}</span>
                  {it.tags?.length ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className="truncate">#{it.tags.slice(0, 4).join(" #")}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => doReenrich(it.id)}
                  disabled={busyId === it.id || it.is_deleted}
                  data-testid={`items-reenrich-${it.id}`}
                  className="btn-outline !min-h-[36px] !px-3 !text-ds-sm"
                >
                  <Sparkle size={14} weight="regular" />
                  Re-enrich
                </button>
                {!it.is_deleted && (
                  <button
                    onClick={() => doDelete(it.id)}
                    disabled={busyId === it.id}
                    data-testid={`items-delete-${it.id}`}
                    className="btn-ghost !min-h-[36px] !px-2.5 text-on-surface-secondary hover:text-ds-error"
                    aria-label="Delete"
                  >
                    <Trash size={14} weight="regular" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
