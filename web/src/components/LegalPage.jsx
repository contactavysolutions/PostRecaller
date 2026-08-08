// Shared legal page shell — used by Privacy and Terms.
import { Link } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";

export function LegalPage({ title, sections, testIdPrefix }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="container-page px-5 md:px-12 pt-8 md:pt-12">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            data-testid={`${testIdPrefix}-back`}
            className="w-11 h-11 rounded-ds-pill flex items-center justify-center text-on-surface hover:bg-surface-secondary transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={22} weight="regular" />
          </Link>
          <h1 className="text-ds-2xl text-on-surface" style={{ fontWeight: 500 }}>
            {title}
          </h1>
        </div>

        <div className="mt-10 max-w-[720px] flex flex-col gap-8 pb-24">
          {sections.map((s) => (
            <section key={s.h} className="flex flex-col gap-2">
              <h2 className="text-ds-lg text-on-surface" style={{ fontWeight: 500 }}>
                {s.h}
              </h2>
              <p className="text-ds-base text-on-surface-secondary leading-[1.65]">
                {s.b}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
