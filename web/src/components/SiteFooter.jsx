// Public footer — legal only. No auth links during waitlist-only launch.
import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="container-page px-5 md:px-12 pt-16 md:pt-24 pb-14">
      <div className="border-t border-ds-border pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-ds-base text-on-surface-secondary">
          © 2026 PostRecaller — a memory for your internet.
        </p>
        <nav className="flex items-center gap-6" aria-label="Legal">
          <Link
            to="/privacy"
            data-testid="footer-privacy"
            className="text-ds-base text-on-surface-secondary hover:text-on-surface transition-colors"
            style={{ fontWeight: 500 }}
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            data-testid="footer-terms"
            className="text-ds-base text-on-surface-secondary hover:text-on-surface transition-colors"
            style={{ fontWeight: 500 }}
          >
            Terms
          </Link>
          <a
            href="mailto:support@postrecaller.com"
            data-testid="footer-contact"
            className="text-ds-base text-on-surface-secondary hover:text-on-surface transition-colors"
            style={{ fontWeight: 500 }}
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
