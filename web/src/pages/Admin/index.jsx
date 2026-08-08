// Admin dashboard shell — sidebar nav + tab renderer.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ChartLineUp,
  PaperPlaneTilt,
  Rows,
  Heartbeat,
  SignOut,
  ShieldCheck,
} from "@phosphor-icons/react";

import { api, auth } from "@/lib/api";
import { WaitlistTab } from "./WaitlistTab";
import { UsersTab } from "./UsersTab";
import { UsageTab } from "./UsageTab";
import { ItemsTab } from "./ItemsTab";
import { HealthTab } from "./HealthTab";

const TABS = [
  { key: "waitlist", label: "Waitlist", Icon: PaperPlaneTilt, Component: WaitlistTab },
  { key: "users", label: "Users", Icon: Users, Component: UsersTab },
  { key: "usage", label: "AI Usage", Icon: ChartLineUp, Component: UsageTab },
  { key: "items", label: "Items", Icon: Rows, Component: ItemsTab },
  { key: "health", label: "System", Icon: Heartbeat, Component: HealthTab },
];

export default function AdminDashboard() {
  const nav = useNavigate();
  const [active, setActive] = useState(() => localStorage.getItem("admin.tab") || "waitlist");
  const [me, setMe] = useState(null);

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("admin.tab", active);
  }, [active]);

  const ActiveTab = TABS.find((t) => t.key === active)?.Component || WaitlistTab;

  const signOut = () => {
    auth.clear();
    nav("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface flex" data-testid="admin-dashboard">
      {/* ---------- Sidebar ---------- */}
      <aside className="w-[260px] shrink-0 border-r border-ds-border bg-surface flex flex-col sticky top-0 h-screen">
        <div className="px-6 pt-8 pb-6 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[10px] bg-brand text-on-brand flex items-center justify-center">
            <span className="inline-block w-3.5 h-2 rounded-[2px] bg-on-brand/95" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[17px] text-on-surface" style={{ fontWeight: 500, letterSpacing: "-0.02em" }}>
              PostRecaller
            </span>
            <span className="text-ds-sm text-brand" style={{ fontWeight: 500, letterSpacing: "0.05em" }}>
              ADMIN
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-2 flex flex-col gap-1" aria-label="Admin sections">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                data-testid={`admin-tab-${key}`}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-ds-md transition-all group ${
                  isActive
                    ? "bg-brand-tertiary text-on-brand-tertiary"
                    : "text-on-surface-secondary hover:bg-surface-secondary hover:text-on-surface"
                }`}
                style={{ fontWeight: 500 }}
              >
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                <span className="text-ds-base">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ds-border flex flex-col gap-3">
          {me && (
            <div className="px-2">
              <p className="text-ds-sm text-on-surface-secondary">Signed in as</p>
              <p className="text-ds-base text-on-surface truncate" style={{ fontWeight: 500 }} data-testid="admin-me-email">
                {me.email}
              </p>
              <div className="pill mt-2">
                <ShieldCheck size={12} weight="fill" className="text-brand" />
                Admin
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            data-testid="admin-signout"
            className="btn-ghost !justify-start !min-h-[40px] !px-3"
          >
            <SignOut size={16} weight="regular" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ---------- Content ---------- */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[1200px] mx-auto px-8 md:px-10 py-10">
          <ActiveTab />
        </div>
      </main>
    </div>
  );
}
