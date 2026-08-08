// Vault Home — Pinterest masonry with sticky glass search, tag rail, infinite scroll.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookmarkSimple, Warning } from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { StickyHeader } from "./StickyHeader";
import { TagRail } from "./TagRail";
import { MasonryGrid } from "./MasonryGrid";
import { AddLinkModal } from "./AddLinkModal";

function useDebouncedValue(value, ms = 220) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

function filterClientSide(items, q) {
  if (!q) return items;
  const needle = q.toLowerCase();
  return items.filter((it) => {
    const hay = [it.title, it.summary, it.original_url, (it.tags || []).join(" ")].join(" ").toLowerCase();
    return hay.includes(needle);
  });
}

// ------------------ empty / loading states ------------------
function VaultEmpty({ onAdd }) {
  return (
    <div className="mt-16 md:mt-24 flex flex-col items-center text-center max-w-[520px] mx-auto px-6" data-testid="vault-empty">
      <div className="w-16 h-16 rounded-ds-md bg-brand-tertiary text-brand flex items-center justify-center mb-5">
        <BookmarkSimple size={30} weight="regular" />
      </div>
      <h2 className="text-[26px] md:text-[32px] tracking-[-0.02em] text-on-surface" style={{ fontWeight: 500 }}>
        Your vault is empty — for now.
      </h2>
      <p className="mt-3 text-on-surface-secondary text-ds-lg leading-relaxed">
        Paste a link — from Instagram, TikTok, YouTube, X, Reddit, or an article — and PostRecaller will read, tag, and file it for you.
      </p>
      <button onClick={onAdd} className="btn-brand mt-7" data-testid="vault-empty-add">
        <Plus size={17} weight="bold" />
        Save your first link
      </button>
    </div>
  );
}

function VaultSkeleton() {
  const heights = [180, 240, 160, 220, 200, 190, 260, 170, 210, 230, 180, 250];
  return (
    <div
      className="columns-2 sm:columns-3 lg:columns-4 2xl:columns-5"
      style={{ columnGap: "12px" }}
      data-testid="vault-skeleton"
      aria-hidden
    >
      {heights.map((h, i) => (
        <div
          key={i}
          className="rounded-ds-md mb-[12px] break-inside-avoid bg-gradient-to-br from-surface-secondary via-surface-tertiary/60 to-surface-secondary bg-[length:800px_100%] animate-shimmer"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

// ------------------ main ------------------
export default function VaultPage() {
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 220);

  const [activeTag, setActiveTag] = useState(null);
  const [tags, setTags] = useState([]);

  const [addOpen, setAddOpen] = useState(false);

  const sentinelRef = useRef(null);
  const inFlight = useRef(false);

  // -------- initial + tag-change load --------
  const loadFirst = useCallback(async (tag) => {
    setLoadingPage(true);
    setError("");
    inFlight.current = true;
    try {
      const res = await api.listItems({ limit: 30, ...(tag ? { tag } : {}) });
      setItems(res.items || []);
      setCursor(res.next_cursor || null);
      setHasMore(!!res.has_more);
    } catch (e) {
      setError(e?.message || "Couldn't load your vault");
    } finally {
      setLoadingPage(false);
      inFlight.current = false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasMore || !cursor) return;
    inFlight.current = true;
    setLoadingMore(true);
    try {
      const res = await api.listItems({
        limit: 30,
        cursor,
        ...(activeTag ? { tag: activeTag } : {}),
      });
      setItems((prev) => [...prev, ...(res.items || [])]);
      setCursor(res.next_cursor || null);
      setHasMore(!!res.has_more);
    } catch (e) {
      setError(e?.message || "Couldn't load more");
    } finally {
      setLoadingMore(false);
      inFlight.current = false;
    }
  }, [cursor, hasMore, activeTag]);

  // -------- initial mount --------
  useEffect(() => {
    api.me().then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    loadFirst(activeTag);
  }, [loadFirst, activeTag]);

  // -------- tags rail --------
  const refreshTags = useCallback(() => {
    api
      .listTags()
      .then((r) => setTags(r.tags || []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    refreshTags();
  }, [refreshTags]);

  // -------- IntersectionObserver for infinite scroll --------
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "600px 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [loadMore]);

  // -------- open item (external for now; detail page ships in Phase 5) --------
  const openItem = useCallback((it) => {
    if (it?.original_url) window.open(it.original_url, "_blank", "noopener,noreferrer");
  }, []);

  // -------- optimistic prepend after save --------
  const onAdded = useCallback(
    (res) => {
      if (!res?.item) return;
      if (res.duplicate) {
        // Bring the duplicate to the front so the user can see it.
        setItems((prev) => {
          const filtered = prev.filter((p) => p.id !== res.item.id);
          return [res.item, ...filtered];
        });
      } else {
        setItems((prev) => [res.item, ...prev]);
      }
      refreshTags();
    },
    [refreshTags]
  );

  const visibleItems = useMemo(
    () => filterClientSide(items, debouncedQuery),
    [items, debouncedQuery]
  );

  const showEmpty =
    !loadingPage && !error && items.length === 0 && !activeTag && !debouncedQuery;
  const showNoResults =
    !loadingPage && !error && visibleItems.length === 0 && (activeTag || debouncedQuery);

  return (
    <div className="min-h-screen bg-surface" data-testid="vault-page">
      <StickyHeader
        me={me}
        query={query}
        onQueryChange={setQuery}
        onAdd={() => setAddOpen(true)}
      />

      {(items.length > 0 || tags.length > 0) && (
        <div className="container-page">
          <TagRail tags={tags} activeTag={activeTag} onSelect={setActiveTag} />
        </div>
      )}

      <main className="container-page px-5 md:px-10 pt-5 pb-24">
        {error && (
          <div className="mb-6 rounded-ds-md border border-ds-error/40 bg-ds-error/10 text-ds-error px-4 py-3 text-ds-base flex items-center gap-2" data-testid="vault-error">
            <Warning size={16} weight="fill" />
            {error}
          </div>
        )}

        {loadingPage && <VaultSkeleton />}

        {showEmpty && <VaultEmpty onAdd={() => setAddOpen(true)} />}

        {!loadingPage && !showEmpty && (
          <>
            {showNoResults ? (
              <div className="py-14 text-center text-on-surface-secondary" data-testid="vault-no-results">
                <p className="text-ds-xl text-on-surface" style={{ fontWeight: 500 }}>Nothing matches that.</p>
                <p className="mt-2 text-ds-base">Try a different word, or clear filters.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <MasonryGrid items={visibleItems} onOpen={openItem} />
              </motion.div>
            )}

            {/* infinite-scroll sentinel */}
            <div ref={sentinelRef} data-testid="vault-sentinel" aria-hidden />

            {loadingMore && (
              <div className="text-center text-on-surface-secondary text-ds-sm py-6" data-testid="vault-loading-more">
                Loading more…
              </div>
            )}
            {!hasMore && items.length > 0 && !showNoResults && (
              <div className="text-center text-on-surface-secondary text-ds-sm py-8" data-testid="vault-end">
                — end of the vault —
              </div>
            )}
          </>
        )}
      </main>

      <AddLinkModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={onAdded}
      />
    </div>
  );
}
