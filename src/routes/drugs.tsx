import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { DRUGS } from "@/lib/clinical-data";
import { Pill, Search } from "lucide-react";

export const Route = createFileRoute("/drugs")({
  head: () => ({
    meta: [
      { title: "Drug Reference — Atlas Sanctum Health" },
      {
        name: "description",
        content: "Offline drug reference: dosing, contraindications, interactions, pregnancy, storage.",
      },
    ],
  }),
  component: DrugsPage,
});

function DrugsPage() {
  const [q, setQ] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return DRUGS;
    return DRUGS.filter(
      (d) =>
        d.name.toLowerCase().includes(s) ||
        d.class.toLowerCase().includes(s) ||
        d.indications.some((i) => i.toLowerCase().includes(s)),
    );
  }, [q]);

  const drug = filtered[selectedIdx] ?? filtered[0];

  return (
    <>
      <PageHeader title="Drug Reference" subtitle="Offline formulary · WHO EML + Kenya MoH." />
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-[calc(100vh-6.5rem)]">
        <aside className="border-r bg-panel/50 flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSelectedIdx(0);
                }}
                placeholder="Search drug, class, or indication…"
                className="w-full h-9 pl-8 pr-2 rounded border bg-card text-[13px] mono"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-auto">
            {filtered.map((d, i) => (
              <li key={d.name}>
                <button
                  onClick={() => setSelectedIdx(i)}
                  className={`w-full text-left px-3 py-2 border-b hover:bg-accent/40 ${
                    drug?.name === d.name ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="text-[13px] font-medium flex items-center gap-2">
                    <Pill className="h-3.5 w-3.5 text-primary" /> {d.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground mono">{d.class}</div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="p-4 text-center text-[12px] text-muted-foreground">No matches.</li>
            )}
          </ul>
        </aside>

        {drug ? (
          <section className="p-5 space-y-4 overflow-auto">
            <header>
              <h2 className="text-[16px] font-semibold">{drug.name}</h2>
              <p className="text-[12px] text-muted-foreground mono uppercase tracking-wide">
                {drug.class}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card title="Indications">
                <ul className="list-disc pl-4 space-y-0.5">
                  {drug.indications.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </Card>
              <Card title="Adult dose">{drug.adultDose}</Card>
              <Card title="Pediatric dose">{drug.pediatricDose}</Card>
              <Card title="Pregnancy">{drug.pregnancy}</Card>
              <Card title="Contraindications" danger>
                <ul className="list-disc pl-4 space-y-0.5">
                  {drug.contraindications.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Card>
              <Card title="Interactions" warn>
                <ul className="list-disc pl-4 space-y-0.5">
                  {drug.interactions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Card>
              <Card title="Common side effects">
                <ul className="list-disc pl-4 space-y-0.5">
                  {drug.sideEffects.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Card>
              <Card title="Storage">{drug.storage}</Card>
            </div>

            <Card title="References">
              <ul className="space-y-0.5">
                {drug.references.map((r) => (
                  <li key={r} className="mono text-[11px]">
                    · {r}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ) : null}
      </div>
    </>
  );
}

function Card({
  title,
  children,
  danger,
  warn,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
  warn?: boolean;
}) {
  const border = danger
    ? "border-[color:var(--color-danger)]/40"
    : warn
      ? "border-[color:var(--color-warn)]/40"
      : "";
  return (
    <div className={`clinical-card p-3 ${border}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
        {title}
      </div>
      <div className="text-[12.5px] leading-relaxed">{children}</div>
    </div>
  );
}
