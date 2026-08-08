// CSS-columns masonry — strict 12px gap, responsive breakpoints per design guidelines.
// 2 cols <640px · 3 cols 640-1024 · 4 cols 1024-1440 · 5 cols >1440
import { ItemCard } from "./ItemCard";

export function MasonryGrid({ items, onOpen }) {
  return (
    <div
      className="[column-fill:_balance] columns-2 sm:columns-3 lg:columns-4 2xl:columns-5"
      style={{ columnGap: "12px" }}
      data-testid="vault-masonry"
    >
      {items.map((it, idx) => (
        <ItemCard
          key={it.id || `optimistic-${idx}`}
          item={it}
          index={idx}
          onClick={() => onOpen?.(it)}
        />
      ))}
    </div>
  );
}
