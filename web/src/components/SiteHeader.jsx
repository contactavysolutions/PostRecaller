// Public-only header — logo + auth CTAs + theme toggle.
import { Link } from "react-router-dom";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "@/lib/theme";
import { IS_WAITLIST_MODE } from "@/constants/config";
import { LogoIcon } from "@/components/LogoIcon";

export function PublicHeader() {
  const { mode, toggle } = useTheme();

  return (
    <header className="container-page px-5 md:px-12 pt-6 md:pt-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          data-testid="site-logo"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="PostRecaller home"
        >
          <LogoIcon size={38} />
          <span className="text-[20px] md:text-[22px] text-on-surface" style={{ fontWeight: 500, letterSpacing: "-0.02em" }}>
            PostRecaller
          </span>
        </Link>
        <div className="flex items-center gap-3 md:gap-5">
          <Link
            to="/login"
            data-testid="header-login"
            className="text-on-surface-secondary hover:text-on-surface text-ds-base transition-colors"
            style={{ fontWeight: 500 }}
          >
            Log in
          </Link>
          {!IS_WAITLIST_MODE && (
            <Link
              to="/register"
              data-testid="header-register"
              className="px-4 py-2 rounded-ds-md bg-brand text-on-brand text-ds-sm hover:opacity-90 transition-opacity"
              style={{ fontWeight: 500 }}
            >
              Sign up
            </Link>
          )}
          <button
            data-testid="theme-toggle"
            onClick={toggle}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="w-10 h-10 rounded-ds-pill flex items-center justify-center text-on-surface-secondary hover:text-on-surface hover:bg-surface-secondary transition-colors"
          >
            {mode === "dark" ? <Sun size={20} weight="regular" /> : <Moon size={20} weight="regular" />}
          </button>
        </div>
      </div>
    </header>
  );
}

// Alias for existing imports.
export { PublicHeader as SiteHeader };

