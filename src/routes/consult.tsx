import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { assess, type Assessment, COMMON_SYMPTOMS } from "@/lib/clinical-data";
import { AlertTriangle, ClipboardCopy, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/consult")({
  head: () => ({
    meta: [
      { title: "AI Consultation — Atlas Sanctum Health" },
      {
        name: "description",
        content:
          "Structured clinical intake and offline AI-assisted differential with evidence and confidence.",
      },
    ],
  }),
  component: ConsultPage,
});

function ConsultPage() {
  const [age, setAge] = useState("34");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [symptoms, setSymptoms] = useState<string[]>(["Fever", "Cough", "Headache"]);
  const [duration, setDuration] = useState("3");
  const [history, setHistory] = useState("Hypertension");
  const [meds, setMeds] = useState("None");
  const [result, setResult] = useState<Assessment | null>(null);
  const [running, setRunning] = useState(false);

  const toggle = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      setResult(
        assess({
          age: Number(age) || 0,
          gender,
          symptoms,
          durationDays: Number(duration) || 0,
          history,
          meds,
        }),
      );
      setRunning(false);
    }, 350);
  };

  return (
    <>
      <PageHeader
        title="AI Consultation"
        subtitle="Structured input → differential, investigations, and immediate advice."
      />
      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-0 min-h-[calc(100vh-6.5rem)]">
        <form
          className="p-5 border-r bg-panel/50 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <Field label="Patient age (years)">
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="clinical-input"
            />
          </Field>

          <Field label="Gender">
            <div className="flex gap-4 text-[13px]">
              {(["male", "female"] as const).map((g) => (
                <label key={g} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    className="accent-[color:var(--color-primary)]"
                  />
                  <span className="capitalize">{g}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Symptoms" hint={`${symptoms.length} selected`}>
            <div className="grid grid-cols-2 gap-1">
              {COMMON_SYMPTOMS.map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-2 px-2 py-1 rounded border text-[12px] cursor-pointer ${
                    symptoms.includes(s)
                      ? "bg-primary/10 border-primary/40"
                      : "border-border hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={symptoms.includes(s)}
                    onChange={() => toggle(s)}
                    className="accent-[color:var(--color-primary)]"
                  />
                  {s}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Duration (days)">
            <input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="clinical-input"
            />
          </Field>

          <Field label="Medical history">
            <textarea
              rows={2}
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              className="clinical-input"
            />
          </Field>

          <Field label="Current medication">
            <textarea
              rows={2}
              value={meds}
              onChange={(e) => setMeds(e.target.value)}
              className="clinical-input"
            />
          </Field>

          <button
            type="submit"
            disabled={running || symptoms.length === 0}
            className="w-full h-10 rounded bg-primary text-primary-foreground font-medium text-[13px] inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" strokeWidth={2} /> Generate Clinical Assessment
              </>
            )}
          </button>
          <p className="text-[11px] text-muted-foreground">
            Runs locally · no data leaves this device.
          </p>
        </form>

        <div className="p-5 space-y-4">
          {!result ? (
            <EmptyResult />
          ) : (
            <AssessmentView data={result} patient={{ age, gender, symptoms, duration }} />
          )}
        </div>
      </div>

      <style>{`
        .clinical-input {
          width: 100%;
          padding: 6px 10px;
          background: var(--color-card);
          border: 1px solid var(--color-input);
          border-radius: var(--radius);
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--color-foreground);
        }
        .clinical-input:focus {
          outline: 2px solid var(--color-ring);
          outline-offset: -1px;
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
          {label}
        </span>
        {hint ? <span className="text-[10px] mono text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function EmptyResult() {
  return (
    <div className="clinical-card p-8 text-center text-muted-foreground">
      <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
      <div className="text-[13px]">Complete the intake, then generate an assessment.</div>
      <div className="text-[11px] mono mt-1">All processing runs offline on this device.</div>
    </div>
  );
}

function AssessmentView({
  data,
  patient,
}: {
  data: Assessment;
  patient: { age: string; gender: string; symptoms: string[]; duration: string };
}) {
  const note = useMemo(
    () => buildClinicalNote(data, patient),
    [data, patient],
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold">Clinical Assessment</h2>
          <p className="text-[11px] text-muted-foreground mono">
            {patient.age}y {patient.gender} · {patient.symptoms.length} symptoms · {patient.duration}d
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 h-8 px-3 rounded border text-[12px] hover:bg-accent"
          onClick={() => navigator.clipboard?.writeText(note)}
        >
          <ClipboardCopy className="h-3.5 w-3.5" /> Copy clinical note
        </button>
      </div>

      {data.redFlags.length > 0 && (
        <div className="clinical-card border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/5 p-3">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-danger)]">
            <AlertTriangle className="h-4 w-4" /> Red flags — consider urgent referral
          </div>
          <ul className="mt-1.5 text-[12px] space-y-1">
            {data.redFlags.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Possible Conditions">
          <ol className="space-y-2">
            {data.conditions.map((c, i) => (
              <li key={c.name} className="flex items-start gap-3">
                <span className="mono text-[11px] text-muted-foreground w-4">{i + 1}.</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium">{c.name}</span>
                    <ConfidenceBadge level={c.confidence} />
                  </div>
                  <div className="text-[11px] text-muted-foreground">{c.rationale}</div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Suggested Questions">
          <ul className="text-[12px] space-y-1">
            {data.questions.map((q) => (
              <li key={q}>• {q}</li>
            ))}
          </ul>
        </Section>

        <Section title="Recommended Investigations">
          <ul className="text-[12px] space-y-1">
            {data.investigations.map((inv) => (
              <li key={inv} className="flex items-center gap-2">
                <span className="text-[color:var(--color-ok)]">✓</span> {inv}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Immediate Advice">
          <ul className="text-[12px] space-y-1">
            {data.advice.map((a) => (
              <li key={a}>• {a}</li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Evidence & Sources">
        <ul className="text-[12px] space-y-1">
          {data.sources.map((s) => (
            <li key={s.ref} className="flex items-center gap-2">
              <span className="mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                {s.ref}
              </span>
              {s.title}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="clinical-card p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  const map = {
    high: { text: "HIGH", cls: "bg-[color:var(--color-ok)]/15 text-[color:var(--color-ok)]" },
    medium: { text: "MED", cls: "bg-[color:var(--color-warn)]/15 text-[color:var(--color-warn)]" },
    low: { text: "LOW", cls: "bg-muted text-muted-foreground" },
  } as const;
  const m = map[level];
  return (
    <span className={`mono text-[10px] px-1.5 py-0.5 rounded ${m.cls}`}>{m.text} CONFIDENCE</span>
  );
}

function buildClinicalNote(
  d: Assessment,
  p: { age: string; gender: string; symptoms: string[]; duration: string },
) {
  return [
    `CLINICAL ASSESSMENT — Atlas Sanctum Health (offline)`,
    ``,
    `Patient: ${p.age}y ${p.gender}`,
    `Symptoms: ${p.symptoms.join(", ")}`,
    `Duration: ${p.duration} day(s)`,
    ``,
    `Differential:`,
    ...d.conditions.map((c, i) => `  ${i + 1}. ${c.name} — ${c.confidence.toUpperCase()} confidence (${c.rationale})`),
    ``,
    `Investigations: ${d.investigations.join(", ") || "—"}`,
    `Advice:`,
    ...d.advice.map((a) => `  - ${a}`),
    d.redFlags.length ? `\nRED FLAGS:\n${d.redFlags.map((r) => `  ! ${r}`).join("\n")}` : "",
    ``,
    `Sources: ${d.sources.map((s) => s.ref).join("; ")}`,
  ].join("\n");
}
