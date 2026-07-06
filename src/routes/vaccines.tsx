import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { KENYA_EPI, vaccineStatusFor } from "@/lib/clinical-data";

export const Route = createFileRoute("/vaccines")({
  head: () => ({
    meta: [
      { title: "Vaccination Assistant — Atlas Sanctum Health" },
      { name: "description", content: "Kenya EPI schedule with catch-up guidance." },
    ],
  }),
  component: VaccinesPage,
});

function VaccinesPage() {
  const [ageMonths, setAgeMonths] = useState(6);
  const { due, upcoming } = vaccineStatusFor(ageMonths);

  return (
    <>
      <PageHeader
        title="Vaccination Assistant"
        subtitle="Kenya EPI schedule · offline reference"
      />
      <div className="p-5 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <div className="clinical-card p-4 space-y-3 h-fit">
          <label className="block">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
              Patient age (months)
            </div>
            <input
              type="number"
              min={0}
              max={216}
              value={ageMonths}
              onChange={(e) => setAgeMonths(Number(e.target.value) || 0)}
              className="w-full h-9 px-2 border rounded mono text-[13px] bg-card"
            />
          </label>
          <div className="flex flex-wrap gap-1">
            {[0, 1.5, 2.5, 3.5, 6, 9, 12, 18].map((m) => (
              <button
                key={m}
                onClick={() => setAgeMonths(m)}
                className={`text-[11px] mono px-2 py-1 rounded border ${
                  ageMonths === m ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Schedule reflects Kenya MoH EPI, 2024 revision.
          </p>
        </div>

        <div className="space-y-4">
          <Section title="Due / already recommended by this age" tone="ok">
            <VaxList items={due} showAge />
          </Section>
          <Section title="Upcoming doses" tone="info">
            <VaxList items={upcoming} showAge />
          </Section>
          <Section title="Full Kenya EPI schedule" tone="muted">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-muted-foreground uppercase text-[10px] tracking-wide">
                  <th className="py-1">Age</th>
                  <th>Vaccine</th>
                </tr>
              </thead>
              <tbody>
                {KENYA_EPI.map((v) => (
                  <tr key={v.vaccine} className="border-t">
                    <td className="py-1 mono text-muted-foreground w-24">{v.ageLabel}</td>
                    <td>{v.vaccine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </div>
    </>
  );
}

function VaxList({
  items,
  showAge,
}: {
  items: { vaccine: string; ageLabel: string }[];
  showAge?: boolean;
}) {
  if (items.length === 0)
    return <div className="text-[12px] text-muted-foreground">None.</div>;
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {items.map((v) => (
        <li key={v.vaccine} className="flex items-center gap-2 px-2 py-1.5 border rounded bg-card">
          <span className="text-[color:var(--color-ok)]">✓</span>
          <div className="min-w-0">
            <div className="text-[13px] truncate">{v.vaccine}</div>
            {showAge && (
              <div className="text-[10px] mono text-muted-foreground">{v.ageLabel}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "ok" | "info" | "muted";
  children: React.ReactNode;
}) {
  const border =
    tone === "ok"
      ? "border-[color:var(--color-ok)]/40"
      : tone === "info"
        ? "border-primary/40"
        : "";
  return (
    <div className={`clinical-card p-4 ${border}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}
