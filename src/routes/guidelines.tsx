import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { GUIDELINES, searchGuidelines, type GuidelineDoc } from "@/lib/clinical-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/guidelines")({
  head: () => ({
    meta: [
      { title: "Guideline Search — Atlas Sanctum Health" },
      { name: "description", content: "Search bundled WHO, Kenya MoH, and emergency guidelines." },
    ],
  }),
  component: GuidelinesPage,
});

const SOURCES = ["All", "WHO", "Kenya MoH", "Emergency Care", "Patient Education"] as const;

function GuidelinesPage() {
  const [q, setQ] = useState("Hypertension");
  const [source, setSource] = useState<(typeof SOURCES)[number]>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const results: GuidelineDoc[] = useMemo(() => {
    const base = searchGuidelines(q);
    return source === "All" ? base : base.filter((g) => g.source === source);
  }, [q, source]);

  const open = results.find((r) => r.id === openId) ?? results[0];

  return (
    <>
      <PageHeader
        title="Guideline Search"
        subtitle={`${GUIDELINES.length} documents in local index · latest sync 03 Jul 2026`}
      />
      <div className="p-5 space-y-4">
        <div className="clinical-card p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search e.g. hypertension, malaria, sepsis…"
              className="w-full h-9 pl-8 pr-2 border rounded bg-card mono text-[13px]"
            />
          </div>
          <div className="flex gap-1">
            {SOURCES.map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`text-[11px] mono px-2 py-1 border rounded ${
                  source === s ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
          <ul className="clinical-card divide-y max-h-[70vh] overflow-auto">
            {results.length === 0 && (
              <li className="p-4 text-[12px] text-muted-foreground text-center">
                No matching guidelines.
              </li>
            )}
            {results.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => setOpenId(g.id)}
                  className={`w-full text-left px-3 py-2 hover:bg-accent/40 ${
                    open?.id === g.id ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="text-[13px] font-medium">{g.title}</div>
                  <div className="text-[11px] mono text-muted-foreground">
                    {g.source} · {g.section}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {open ? (
            <article className="clinical-card p-5 space-y-3">
              <header>
                <div className="text-[11px] mono uppercase tracking-wide text-muted-foreground">
                  {open.source} · {open.section}
                </div>
                <h2 className="text-[16px] font-semibold">{open.title}</h2>
              </header>
              <p className="text-[13.5px] leading-relaxed">{open.body}</p>
              <div className="pt-2 border-t">
                <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1">
                  {open.tags.map((t) => (
                    <span
                      key={t}
                      className="mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[11px] mono text-muted-foreground">
                Citation: {open.source} — {open.title} ({open.id})
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </>
  );
}
