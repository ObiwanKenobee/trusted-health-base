import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Atlas Sanctum Health" },
      { name: "description", content: "Country pack, language, model, and knowledge pack settings." },
    ],
  }),
  component: SettingsPage,
});

const COUNTRIES = ["Kenya", "Uganda", "Nigeria", "Tanzania"] as const;
const LANGS = ["English", "Swahili", "French"] as const;
const MODELS = [
  { id: "7bq4", name: "7B Quantized (Q4)", size: "4.1 GB", speed: "1.7 s" },
  { id: "3bq4", name: "3B Quantized (Q4)", size: "1.9 GB", speed: "0.8 s" },
  { id: "13bq4", name: "13B Quantized (Q4)", size: "7.4 GB", speed: "3.1 s" },
] as const;

const KP = [
  { id: "who", label: "WHO Guidelines", size: "220 MB", installed: true },
  { id: "moh", label: "National Guidelines — Kenya", size: "140 MB", installed: true },
  { id: "hosp", label: "Hospital Protocols — Kenyatta NH", size: "38 MB", installed: false },
  { id: "trop", label: "Tropical Medicine Atlas", size: "410 MB", installed: false },
];

function SettingsPage() {
  const [country, setCountry] = useState<(typeof COUNTRIES)[number]>("Kenya");
  const [lang, setLang] = useState<(typeof LANGS)[number]>("English");
  const [model, setModel] = useState<string>(MODELS[0].id);
  const [packs, setPacks] = useState(KP);


  return (
    <>
      <PageHeader title="Settings" subtitle="Configure knowledge packs, model, and locale." />
      <div className="p-5 max-w-3xl space-y-4">
        <Section title="Country Pack">
          <ChoiceRow
            options={COUNTRIES}
            value={country}
            onChange={(v) => setCountry(v as typeof country)}
          />
          <p className="text-[11px] text-muted-foreground mt-2">
            Selects national formularies, EPI schedule, and referral pathways.
          </p>
        </Section>

        <Section title="Language">
          <ChoiceRow
            options={LANGS}
            value={lang}
            onChange={(v) => setLang(v as typeof lang)}
          />
        </Section>

        <Section title="AI Model">
          <ul className="divide-y border rounded">
            {MODELS.map((m) => (
              <li key={m.id}>
                <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/40">
                  <input
                    type="radio"
                    checked={model === m.id}
                    onChange={() => setModel(m.id)}
                    className="accent-[color:var(--color-primary)]"
                  />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{m.name}</div>
                    <div className="text-[11px] mono text-muted-foreground">
                      {m.size} on disk · ~{m.speed} typical response
                    </div>
                  </div>
                  {model === m.id && (
                    <span className="text-[10px] mono px-1.5 py-0.5 rounded bg-[color:var(--color-ok)]/15 text-[color:var(--color-ok)]">
                      ACTIVE
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Knowledge Packs">
          <ul className="divide-y border rounded">
            {packs.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{p.label}</div>
                  <div className="text-[11px] mono text-muted-foreground">{p.size}</div>
                </div>
                <button
                  onClick={() =>
                    setPacks((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, installed: !x.installed } : x)),
                    )
                  }
                  className={`text-[11px] mono px-2 py-1 rounded border ${
                    p.installed
                      ? "bg-[color:var(--color-ok)]/15 text-[color:var(--color-ok)] border-[color:var(--color-ok)]/40"
                      : "hover:bg-accent"
                  }`}
                >
                  {p.installed ? "INSTALLED" : "INSTALL"}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground mt-2">
            Packs are installed once and used offline. Organizations may side-load custom packs.
          </p>
        </Section>

        <Section title="About">
          <dl className="grid grid-cols-2 gap-y-1 text-[12px] mono">
            <dt className="text-muted-foreground">Version</dt>
            <dd>0.9.0-mvp</dd>
            <dt className="text-muted-foreground">Build</dt>
            <dd>2026.07.06</dd>
            <dt className="text-muted-foreground">Storage used</dt>
            <dd>5.2 GB / 32 GB</dd>
            <dt className="text-muted-foreground">Device</dt>
            <dd>Clinic-Laptop-04</dd>
          </dl>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="clinical-card p-4">
      <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`text-[12px] px-3 h-8 rounded border ${
            value === o ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
