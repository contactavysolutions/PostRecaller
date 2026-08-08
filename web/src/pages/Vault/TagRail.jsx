// Horizontal tag rail — brand-tertiary pills, All + top tags, no visible scrollbar.
export function TagRail({ tags, activeTag, onSelect }) {
  return (
    <div
      className="scrollbar-none overflow-x-auto -mx-5 md:-mx-10 px-5 md:px-10 pt-5 pb-1"
      data-testid="vault-tag-rail"
    >
      <div className="flex items-center gap-2 min-w-max">
        <button
          onClick={() => onSelect(null)}
          data-testid="vault-tag-all"
          className={`px-3.5 py-1.5 rounded-ds-pill text-ds-sm transition-all whitespace-nowrap ${
            !activeTag
              ? "bg-brand text-on-brand"
              : "bg-brand-tertiary text-on-brand-tertiary hover:brightness-95"
          }`}
          style={{ fontWeight: 500 }}
        >
          All
        </button>
        {tags.map(({ tag, count }) => {
          const active = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onSelect(active ? null : tag)}
              data-testid={`vault-tag-${tag}`}
              className={`px-3.5 py-1.5 rounded-ds-pill text-ds-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                active
                  ? "bg-brand text-on-brand"
                  : "bg-brand-tertiary text-on-brand-tertiary hover:brightness-95"
              }`}
              style={{ fontWeight: 500 }}
            >
              <span>#{tag}</span>
              <span className={`text-[10.5px] ${active ? "opacity-70" : "opacity-60"}`}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
