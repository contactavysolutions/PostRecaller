// Small primitives shared across admin tabs.
import { ArrowsClockwise, MagnifyingGlass } from "@phosphor-icons/react";

export function TabHeader({ title, subtitle, actions, testId }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8" data-testid={testId}>
      <div>
        <h1 className="text-[28px] md:text-[32px] tracking-[-0.02em] text-on-surface" style={{ fontWeight: 500 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-on-surface-secondary text-ds-lg mt-1.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function RefreshButton({ onClick, loading, testId }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      data-testid={testId || "tab-refresh"}
      className="btn-outline !min-h-[40px] !px-4"
    >
      <ArrowsClockwise size={16} weight="regular" className={loading ? "animate-spin" : ""} />
      Refresh
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder, testId }) {
  return (
    <div className="relative">
      <MagnifyingGlass size={16} weight="regular" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-secondary pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testId}
        className="min-h-[40px] pl-10 pr-4 rounded-ds-md bg-surface-secondary border border-ds-border text-ds-base focus:outline-none focus:border-brand focus:bg-surface w-full max-w-[320px]"
      />
    </div>
  );
}

export function StatCard({ label, value, hint, testId }) {
  return (
    <div className="rounded-ds-lg border border-ds-border bg-surface p-6 flex flex-col gap-2" data-testid={testId}>
      <p className="text-ds-sm uppercase tracking-[0.14em] text-on-surface-secondary" style={{ fontWeight: 500 }}>
        {label}
      </p>
      <p className="text-[32px] md:text-[36px] text-on-surface leading-none tracking-[-0.02em]" style={{ fontWeight: 500 }}>
        {value}
      </p>
      {hint && <p className="text-ds-sm text-on-surface-secondary">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, body, testId }) {
  return (
    <div
      className="rounded-ds-lg border border-dashed border-ds-border p-10 text-center bg-surface-secondary/40"
      data-testid={testId}
    >
      <p className="text-ds-xl text-on-surface" style={{ fontWeight: 500 }}>{title}</p>
      {body && <p className="text-on-surface-secondary mt-2 text-ds-base">{body}</p>}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-6 rounded-ds-md border border-ds-error/40 bg-ds-error/10 text-ds-error px-4 py-3 text-ds-base">
      {message}
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    pending: "bg-surface-tertiary text-on-surface-secondary",
    invited: "bg-brand-tertiary text-on-brand-tertiary",
    registered: "bg-brand text-on-brand",
    suspended: "bg-ds-warning/15 text-ds-warning",
    deleted: "bg-ds-error/15 text-ds-error",
    active: "bg-brand text-on-brand",
  };
  return (
    <span
      className={`text-[11px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-ds-pill ${map[status] || map.pending}`}
      style={{ fontWeight: 500 }}
    >
      {status}
    </span>
  );
}
