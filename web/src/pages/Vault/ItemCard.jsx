// Single masonry card — variable height, thumbnail with platform badge, title + tags.
import { ArrowSquareOut, CircleNotch, Sparkle, Warning } from "@phosphor-icons/react";
import { PLATFORM_META, platformOf } from "./platforms";

function PlatformBadge({ platform }) {
  const meta = PLATFORM_META[platform] || PLATFORM_META.web;
  return (
    <span
      className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-ds-pill text-[10.5px] uppercase tracking-[0.12em] backdrop-blur-md ${meta.tint}`}
      style={{ fontWeight: 500 }}
    >
      {meta.label}
    </span>
  );
}

export function ItemCard({ item, onClick, index = 0 }) {
  const plat = platformOf(item);
  const isInProgress = item.enrichment_status === "in_progress";
  const isPending = item.enrichment_status === "pending" || item.enrichment_status === "imported" || item._optimistic;
  const isFailed = item.enrichment_status === "failed";
  const hasImage = !!item.thumbnail_url && !isInProgress && !isPending;

  return (
    <article
      className="group cursor-pointer relative rounded-ds-md overflow-hidden bg-surface-secondary border border-ds-border/70 hover:border-brand/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-tier-1 break-inside-avoid mb-[12px] animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
      onClick={onClick}
      data-testid={`vault-card-${item.id}`}
    >
      {hasImage && (
        <div className="relative">
          <img
            src={item.thumbnail_url}
            alt=""
            loading="lazy"
            draggable={false}
            className="w-full h-auto block select-none"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <PlatformBadge platform={plat} />
        </div>
      )}

      {!hasImage && (
        <div className="relative h-12">
          <PlatformBadge platform={plat} />
        </div>
      )}

      <div className="p-3.5 flex flex-col gap-2">
        {isInProgress && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-ds-pill bg-brand-tertiary/80 border border-brand/20 text-brand text-ds-sm w-fit" data-testid="item-card-in-progress">
            <CircleNotch size={14} weight="bold" className="animate-spin text-brand flex-shrink-0" />
            <span style={{ fontWeight: 500 }}>AI Enrichment In Progress</span>
          </div>
        )}
        {!isInProgress && isPending && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-ds-pill bg-surface-tertiary/70 border border-ds-border text-on-surface-secondary text-ds-sm w-fit" data-testid="item-card-pending">
            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-secondary/70 flex-shrink-0" />
            <span style={{ fontWeight: 500 }}>AI Enrichment Pending</span>
          </div>
        )}
        {isFailed && (
          <div className="flex items-center gap-2 text-ds-warning text-ds-sm">
            <Warning size={13} weight="fill" />
            <span style={{ fontWeight: 500 }}>Needs a retry</span>
          </div>
        )}
        <h3 className="text-on-surface text-[14px] leading-[1.35] line-clamp-3" style={{ fontWeight: 500, letterSpacing: "-0.005em" }}>
          {item.title || item.original_url}
        </h3>
        {(isInProgress || isPending) ? (
          <div className="flex flex-col gap-2 pt-1 pb-1" aria-hidden>
            <div className="h-3 w-4/5 rounded-full bg-gradient-to-r from-surface-tertiary/80 via-surface-tertiary to-surface-tertiary/80 bg-[length:800px_100%] animate-shimmer" />
            <div className="h-3 w-3/5 rounded-full bg-gradient-to-r from-surface-tertiary/80 via-surface-tertiary to-surface-tertiary/80 bg-[length:800px_100%] animate-shimmer" />
            <div className="flex gap-1.5 pt-1">
              <div className="h-4 w-14 rounded-ds-pill bg-surface-tertiary/80 animate-pulse" />
              <div className="h-4 w-12 rounded-ds-pill bg-surface-tertiary/80 animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {item.summary && (
              <p className="text-on-surface-secondary text-[12.5px] leading-[1.45] line-clamp-2">
                {item.summary}
              </p>
            )}
            {item.tags?.length ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {item.tags.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10.5px] px-2 py-0.5 rounded-ds-pill bg-brand-tertiary text-on-brand-tertiary" style={{ fontWeight: 500 }}>
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Hover overlay: open-external hint */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-on-surface/0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
      <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-ds-pill bg-surface/95 border border-ds-border text-on-surface text-[10.5px]" style={{ fontWeight: 500 }}>
          <ArrowSquareOut size={11} weight="regular" />
          Open
        </span>
      </div>
    </article>
  );
}
