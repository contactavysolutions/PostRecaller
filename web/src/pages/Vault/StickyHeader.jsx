// Sticky glass search header with brand logo, search input, add button, user menu.
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlass,
  Plus,
  SignOut,
  Moon,
  Sun,
  ShieldCheck,
  X,
} from "@phosphor-icons/react";
import { auth } from "@/lib/api";
import { useTheme } from "@/lib/theme";

export function StickyHeader({ me, query, onQueryChange, onAdd }) {
  const nav = useNavigate();
  const { mode, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const signOut = () => {
    auth.clear();
    nav("/login", { replace: true });
  };

  const initials = (me?.email || "").slice(0, 2).toUpperCase();

  return (
    <header
      className="glass-header sticky top-0 z-30 border-b border-ds-border/60"
      data-testid="vault-sticky-header"
    >
      <div className="container-page px-5 md:px-10 py-3.5 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/vault"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="Vault"
        >
          <span className="w-9 h-9 rounded-[10px] bg-brand text-on-brand flex items-center justify-center">
            <span className="inline-block w-3.5 h-2 rounded-[2px] bg-on-brand/95" />
          </span>
          <span className="hidden md:block text-[18px] text-on-surface" style={{ fontWeight: 500, letterSpacing: "-0.02em" }}>
            PostRecaller
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 min-w-0 max-w-[560px] relative">
          <MagnifyingGlass size={17} weight="regular" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-secondary pointer-events-none" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search your vault…"
            aria-label="Search your vault"
            data-testid="vault-search-input"
            className="w-full min-h-[42px] pl-11 pr-9 rounded-ds-pill bg-surface-secondary/90 border border-ds-border text-ds-base focus:outline-none focus:border-brand focus:bg-surface transition-colors"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              data-testid="vault-search-clear"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-on-surface-secondary hover:bg-surface-tertiary transition-colors"
            >
              <X size={13} weight="bold" />
            </button>
          )}
        </div>

        {/* Add + theme + menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onAdd}
            data-testid="vault-add-button"
            className="btn-brand !min-h-[42px] !px-3.5 !text-ds-base"
          >
            <Plus size={17} weight="bold" />
            <span className="hidden md:inline">Save link</span>
          </button>
          <button
            data-testid="theme-toggle"
            onClick={toggle}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="w-10 h-10 rounded-ds-pill flex items-center justify-center text-on-surface-secondary hover:text-on-surface hover:bg-surface-secondary transition-colors"
          >
            {mode === "dark" ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              data-testid="vault-user-menu-button"
              aria-label="Account menu"
              aria-expanded={menuOpen}
              className="w-10 h-10 rounded-full bg-brand-tertiary text-brand flex items-center justify-center hover:brightness-95 transition"
              style={{ fontWeight: 500 }}
            >
              {initials || "PR"}
            </button>
            {menuOpen && (
              <div
                data-testid="vault-user-menu"
                className="absolute right-0 top-12 w-[240px] rounded-ds-md bg-surface border border-ds-border shadow-tier-1 overflow-hidden animate-fade-in-up"
              >
                <div className="px-4 py-3 border-b border-ds-border">
                  <p className="text-ds-sm text-on-surface-secondary">Signed in as</p>
                  <p className="text-ds-base text-on-surface truncate" style={{ fontWeight: 500 }}>
                    {me?.email || "…"}
                  </p>
                </div>
                {me?.is_admin && (
                  <button
                    onClick={() => nav("/admin")}
                    data-testid="vault-menu-admin"
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-ds-base text-on-surface hover:bg-surface-secondary text-left"
                    style={{ fontWeight: 500 }}
                  >
                    <ShieldCheck size={16} weight="regular" className="text-brand" />
                    Admin dashboard
                  </button>
                )}
                <button
                  onClick={signOut}
                  data-testid="vault-menu-signout"
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-ds-base text-on-surface hover:bg-surface-secondary text-left"
                  style={{ fontWeight: 500 }}
                >
                  <SignOut size={16} weight="regular" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
