import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Stethoscope,
  Pill,
  AlertOctagon,
  Syringe,
  Calculator,
  Search,
  MessageSquareHeart,
  ChevronRight,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Atlas Sanctum Health" },
      {
        name: "description",
        content:
          "Launch clinical AI consultation, drug reference, emergency protocols, vaccination, calculators, and guideline search — all offline.",
      },
    ],
  }),
  component: Dashboard,
});

const ACTIONS = [
  { to: "/consult", label: "Ask Medical Question", desc: "Open a new clinical consult", icon: Stethoscope, key: "F2" },
  { to: "/consult", label: "Assess Patient", desc: "Structured symptom intake", icon: Stethoscope, key: "⏎" },
  { to: "/drugs", label: "Drug Information", desc: "Doses, interactions, storage", icon: Pill, key: "F3" },
  { to: "/emergency", label: "Emergency Protocols", desc: "Step-by-step algorithms", icon: AlertOctagon, key: "F4" },
  { to: "/vaccines", label: "Vaccination Guide", desc: "Kenya EPI schedule", icon: Syringe, key: "F5" },
  { to: "/calculators", label: "Medical Calculator", desc: "BMI, qSOFA, GCS, more", icon: Calculator, key: "F6" },
  { to: "/guidelines", label: "Search Guidelines", desc: "WHO, MoH, local protocols", icon: Search, key: "F7" },
  { to: "/education", label: "Patient Education", desc: "Plain-language guidance", icon: MessageSquareHeart, key: "F8" },
] as const;

const RECENT = [
  { title: "Pediatric Fever", detail: "3 y · M · Nairobi", ago: "12 min ago" },
  { title: "Malaria Assessment", detail: "34 y · M · Kisumu", ago: "1 h ago" },
  { title: "Maternal Hypertension", detail: "28 y · F · G3P2", ago: "3 h ago" },
  { title: "Snake Bite Triage", detail: "22 y · M · rural", ago: "yesterday" },
];

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Welcome — ready for clinical work"
        subtitle="Offline. All knowledge packs loaded. Response time 1.7 s."
      />
      <div className="p-5 space-y-5">
        <section className="clinical-card p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mono text-[11px]">
            <StatusLine label="AI Engine" value="Ready · 7B Q4" />
            <StatusLine label="Medical Knowledge" value="Loaded" />
            <StatusLine label="Country Pack" value="Kenya (2024.11)" />
            <StatusLine label="WHO Guidelines" value="Installed" />
            <StatusLine label="Drug Database" value="1,204 entries" />
            <StatusLine label="Emergency Protocols" value="24 loaded" />
            <StatusLine label="Vaccination EPI" value="Kenya schedule" />
            <StatusLine label="Sync" value="Deferred — offline" warn />
          </div>
        </section>

        <section>
          <SectionHeader title="What would you like to do?" hint="Press F-keys or click." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  to={a.to}
                  className="clinical-card p-3 hover:border-primary hover:bg-accent/40 flex items-start gap-3 group"
                >
                  <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium flex items-center gap-2">
                      {a.label}
                      <kbd className="ml-auto">{a.key}</kbd>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{a.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 clinical-card">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                Recent Cases
              </span>
              <span className="text-[11px] mono text-muted-foreground">
                stored locally · not synced
              </span>
            </div>
            <ul className="divide-y">
              {RECENT.map((r) => (
                <li key={r.title}>
                  <Link
                    to="/consult"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-accent/40"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{r.title}</div>
                      <div className="text-[11px] text-muted-foreground mono">{r.detail}</div>
                    </div>
                    <span className="text-[11px] text-muted-foreground mono flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {r.ago}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="clinical-card p-4">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Today's brief
            </div>
            <ul className="text-[12px] space-y-2">
              <li>
                <span className="mono text-[color:var(--color-warn)]">ALERT</span> — Malaria
                caseload trending up in Nyanza (local ministry advisory, 6 Jul).
              </li>
              <li>
                <span className="mono text-[color:var(--color-ok)]">TIP</span> — Verify RDT
                before initiating antimalarials, per Kenya MoH.
              </li>
              <li>
                <span className="mono text-muted-foreground">NOTE</span> — Cold chain: PCV
                between 2–8 °C, discard if frozen.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

function StatusLine({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          warn ? "bg-[color:var(--color-warn)]" : "bg-[color:var(--color-ok)]"
        }`}
      />
      <span className="text-muted-foreground uppercase text-[10px] tracking-wide">{label}</span>
      <span className="ml-auto">{value}</span>
    </div>
  );
}
