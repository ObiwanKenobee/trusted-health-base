import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Activity,
  AlertOctagon,
  Calculator,
  BookOpen,
  Pill,
  Stethoscope,
  Syringe,
  LayoutDashboard,
  MessageSquareHeart,
  Settings,
  Search,
  CircleDot,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, key: "F1" },
  { to: "/consult", label: "AI Consultation", icon: Stethoscope, key: "F2" },
  { to: "/drugs", label: "Drug Reference", icon: Pill, key: "F3" },
  { to: "/emergency", label: "Emergency", icon: AlertOctagon, key: "F4" },
  { to: "/vaccines", label: "Vaccination", icon: Syringe, key: "F5" },
  { to: "/calculators", label: "Calculators", icon: Calculator, key: "F6" },
  { to: "/guidelines", label: "Guidelines", icon: Search, key: "F7" },
  { to: "/education", label: "Patient Education", icon: MessageSquareHeart, key: "F8" },
  { to: "/settings", label: "Settings", icon: Settings, key: "F9" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col text-[13px] leading-snug">
      <TopBar />
      <div className="flex-1 flex min-h-0">
        <aside className="w-56 shrink-0 border-r bg-panel flex flex-col">
          <nav className="flex-1 p-2 space-y-0.5">
            {NAV.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-[13px] transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span className="flex-1 truncate">{item.label}</span>
                  <kbd>{item.key}</kbd>
                </Link>
              );
            })}
          </nav>
          <SystemStatus />
        </aside>
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="h-10 shrink-0 border-b bg-card flex items-center px-3 gap-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-sm bg-primary flex items-center justify-center">
          <Activity className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="leading-none">
          <div className="text-[13px] font-semibold tracking-tight">Atlas Sanctum Health</div>
          <div className="text-[10px] text-muted-foreground mono">
            OFFLINE CLINICAL INTELLIGENCE · v0.9.0-mvp
          </div>
        </div>
      </div>
      <div className="flex-1" />
      <StatusPill ok label="AI Ready" />
      <StatusPill ok label="Offline" />
      <StatusPill ok label="KE Pack" />
      <span className="text-[11px] text-muted-foreground mono">
        {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
    </header>
  );
}

function StatusPill({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border bg-panel text-[11px]">
      <CircleDot
        className={`h-2.5 w-2.5 ${ok ? "text-[color:var(--color-ok)]" : "text-[color:var(--color-warn)]"}`}
        strokeWidth={3}
      />
      <span className="mono uppercase tracking-wide text-[10px]">{label}</span>
    </span>
  );
}

function SystemStatus() {
  const rows = [
    { label: "AI STATUS", value: "Offline · CPU", ok: true },
    { label: "MEMORY", value: "4.3 GB / 8 GB" },
    { label: "KB DOCS", value: "52,148" },
    { label: "RESP TIME", value: "1.7 s" },
    { label: "BATTERY", value: "6h 12m" },
  ];
  return (
    <div className="border-t p-2 text-[11px] mono">
      <div className="text-muted-foreground uppercase tracking-wide mb-1 text-[10px]">
        System Status
      </div>
      <dl className="space-y-0.5">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="border-b bg-card px-5 py-3 flex items-center gap-4">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="text-[12px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex-1" />
      {right}
    </div>
  );
}
