import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { PROTOCOLS } from "@/lib/clinical-data";
import { AlertOctagon, ArrowLeft, Timer } from "lucide-react";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Protocols — Atlas Sanctum Health" },
      {
        name: "description",
        content: "Rapid-access emergency algorithms: anaphylaxis, stroke, trauma, ACS, shock, snake bite, burns, CPR.",
      },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = PROTOCOLS.find((p) => p.key === activeKey);

  if (active) {
    return (
      <>
        <PageHeader
          title={active.title}
          subtitle={
            active.urgency === "immediate"
              ? "IMMEDIATE — act now"
              : "URGENT — time-critical"
          }
          right={
            <button
              onClick={() => setActiveKey(null)}
              className="inline-flex items-center gap-1 text-[12px] px-3 h-8 rounded border hover:bg-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All protocols
            </button>
          }
        />
        <div className="p-5 max-w-3xl space-y-4">
          <div className="clinical-card border-[color:var(--color-danger)]/50 bg-[color:var(--color-danger)]/5 p-3 flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-[color:var(--color-danger)]" />
            <span className="text-[12px] font-semibold text-[color:var(--color-danger)] uppercase mono tracking-wide">
              {active.urgency}
            </span>
            <span className="text-[12px] ml-auto flex items-center gap-1 mono text-muted-foreground">
              <Timer className="h-3.5 w-3.5" /> Started {new Date().toLocaleTimeString()}
            </span>
          </div>

          <ol className="space-y-2">
            {active.steps.map((s, i) => (
              <li
                key={i}
                className="clinical-card p-3 flex gap-3 items-start hover:bg-accent/20"
              >
                <span className="h-6 w-6 shrink-0 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold mono flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-[13.5px] leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>

          {active.drugs && (
            <div className="clinical-card p-3">
              <div className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                Drugs on standby
              </div>
              <div className="flex flex-wrap gap-1.5">
                {active.drugs.map((d) => (
                  <span
                    key={d}
                    className="mono text-[11px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="clinical-card p-3 border-[color:var(--color-warn)]/40 bg-[color:var(--color-warn)]/5">
            <div className="text-[11px] uppercase tracking-wide font-semibold text-[color:var(--color-warn)] mb-1">
              Referral
            </div>
            <div className="text-[13px]">{active.refer}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Emergency Protocols"
        subtitle="Tap a protocol for step-by-step algorithm. All content bundled offline."
      />
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {PROTOCOLS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveKey(p.key)}
            className="clinical-card p-4 aspect-[4/3] flex flex-col items-start text-left hover:border-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/5 transition-colors"
          >
            <AlertOctagon
              className={`h-6 w-6 mb-2 ${
                p.urgency === "immediate"
                  ? "text-[color:var(--color-danger)]"
                  : "text-[color:var(--color-warn)]"
              }`}
            />
            <div className="text-[15px] font-semibold">{p.title}</div>
            <div className="mt-auto text-[10px] mono uppercase tracking-wide text-muted-foreground">
              {p.urgency} · {p.steps.length} steps
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
