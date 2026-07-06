import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";

export const Route = createFileRoute("/calculators")({
  head: () => ({
    meta: [
      { title: "Medical Calculators — Atlas Sanctum Health" },
      {
        name: "description",
        content: "Offline clinical calculators: BMI, pediatric dosing, IV fluids, GCS, qSOFA, CURB-65, APGAR, Cockcroft-Gault, EDD.",
      },
    ],
  }),
  component: CalculatorsPage,
});

const CALCS = [
  { key: "bmi", label: "BMI" },
  { key: "peds", label: "Pediatric dosing" },
  { key: "iv", label: "IV fluids (maintenance)" },
  { key: "crcl", label: "Cockcroft-Gault CrCl" },
  { key: "edd", label: "Pregnancy EDD" },
  { key: "apgar", label: "APGAR score" },
  { key: "gcs", label: "Glasgow Coma Scale" },
  { key: "qsofa", label: "qSOFA" },
  { key: "curb", label: "CURB-65" },
] as const;

type CalcKey = (typeof CALCS)[number]["key"];

function CalculatorsPage() {
  const [active, setActive] = useState<CalcKey>("bmi");

  return (
    <>
      <PageHeader title="Medical Calculators" subtitle="All calculations run locally." />
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-[calc(100vh-6.5rem)]">
        <aside className="border-r bg-panel/50 p-2">
          <ul>
            {CALCS.map((c) => (
              <li key={c.key}>
                <button
                  onClick={() => setActive(c.key)}
                  className={`w-full text-left px-3 py-1.5 rounded text-[13px] ${
                    active === c.key ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="p-5 max-w-2xl">
          {active === "bmi" && <BMI />}
          {active === "peds" && <Peds />}
          {active === "iv" && <IVFluids />}
          {active === "crcl" && <CrCl />}
          {active === "edd" && <EDD />}
          {active === "apgar" && <APGAR />}
          {active === "gcs" && <GCS />}
          {active === "qsofa" && <QSofa />}
          {active === "curb" && <Curb />}
        </div>
      </div>
    </>
  );
}

function CalcShell({
  title,
  children,
  result,
  interpretation,
}: {
  title: string;
  children: React.ReactNode;
  result?: string;
  interpretation?: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <div className="clinical-card p-4 space-y-3">{children}</div>
      {result && (
        <div className="clinical-card p-4 border-primary/40 bg-primary/5">
          <div className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
            Result
          </div>
          <div className="text-[22px] font-semibold mono mt-1">{result}</div>
          {interpretation && (
            <div className="text-[12.5px] text-muted-foreground mt-1">{interpretation}</div>
          )}
        </div>
      )}
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 h-8 px-2 border rounded mono text-[12px] bg-card text-right"
        />
        {suffix && <span className="mono text-[11px] text-muted-foreground w-10">{suffix}</span>}
      </span>
    </label>
  );
}

function BMI() {
  const [h, setH] = useState("170");
  const [w, setW] = useState("70");
  const m = Number(h) / 100;
  const bmi = m > 0 ? Number(w) / (m * m) : 0;
  const interp =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  return (
    <CalcShell
      title="Body Mass Index"
      result={bmi ? `${bmi.toFixed(1)} kg/m²` : "—"}
      interpretation={bmi ? interp : undefined}
    >
      <NumInput label="Height" value={h} onChange={setH} suffix="cm" />
      <NumInput label="Weight" value={w} onChange={setW} suffix="kg" />
    </CalcShell>
  );
}

function Peds() {
  const [wt, setWt] = useState("15");
  const [dose, setDose] = useState("10");
  const total = Number(wt) * Number(dose);
  return (
    <CalcShell
      title="Pediatric Weight-Based Dose"
      result={total ? `${total.toFixed(1)} mg / dose` : "—"}
      interpretation="Verify against age, indication, and formulary max."
    >
      <NumInput label="Child weight" value={wt} onChange={setWt} suffix="kg" />
      <NumInput label="Dose" value={dose} onChange={setDose} suffix="mg/kg" />
    </CalcShell>
  );
}

function IVFluids() {
  const [wt, setWt] = useState("20");
  const w = Number(wt);
  // Holliday-Segar
  let rate = 0;
  if (w <= 10) rate = w * 4;
  else if (w <= 20) rate = 40 + (w - 10) * 2;
  else rate = 60 + (w - 20) * 1;
  const daily = w <= 10 ? w * 100 : w <= 20 ? 1000 + (w - 10) * 50 : 1500 + (w - 20) * 20;
  return (
    <CalcShell
      title="IV Maintenance Fluids (Holliday-Segar)"
      result={w ? `${rate} mL/h  ·  ${daily} mL/24 h` : "—"}
      interpretation="Adjust for fever, dehydration, cardiac/renal disease."
    >
      <NumInput label="Weight" value={wt} onChange={setWt} suffix="kg" />
    </CalcShell>
  );
}

function CrCl() {
  const [age, setAge] = useState("60");
  const [wt, setWt] = useState("70");
  const [cr, setCr] = useState("1.0");
  const [female, setFemale] = useState(false);
  const crcl =
    ((140 - Number(age)) * Number(wt)) / (72 * Number(cr)) * (female ? 0.85 : 1);
  return (
    <CalcShell
      title="Cockcroft-Gault CrCl"
      result={crcl ? `${crcl.toFixed(0)} mL/min` : "—"}
      interpretation="Adjust drug dosing accordingly (aminoglycosides, DOACs, etc.)."
    >
      <NumInput label="Age" value={age} onChange={setAge} suffix="yr" />
      <NumInput label="Weight" value={wt} onChange={setWt} suffix="kg" />
      <NumInput label="Serum creatinine" value={cr} onChange={setCr} suffix="mg/dL" />
      <label className="flex items-center gap-2 text-[12px]">
        <input
          type="checkbox"
          checked={female}
          onChange={(e) => setFemale(e.target.checked)}
        />
        Female (×0.85)
      </label>
    </CalcShell>
  );
}

function EDD() {
  const [lmp, setLmp] = useState(new Date().toISOString().slice(0, 10));
  const d = new Date(lmp);
  const edd = new Date(d.getTime() + 280 * 24 * 3600 * 1000);
  return (
    <CalcShell
      title="Pregnancy EDD (Naegele)"
      result={isNaN(edd.getTime()) ? "—" : edd.toDateString()}
      interpretation="LMP + 280 days. Confirm by early ultrasound if available."
    >
      <label className="flex items-center justify-between gap-3">
        <span className="text-[12px] text-muted-foreground">Last menstrual period</span>
        <input
          type="date"
          value={lmp}
          onChange={(e) => setLmp(e.target.value)}
          className="h-8 px-2 border rounded mono text-[12px] bg-card"
        />
      </label>
    </CalcShell>
  );
}

function APGAR() {
  const items = ["Appearance", "Pulse", "Grimace", "Activity", "Respiration"];
  const [scores, setScores] = useState<number[]>([2, 2, 2, 2, 2]);
  const total = scores.reduce((a, b) => a + b, 0);
  const interp = total >= 7 ? "Reassuring" : total >= 4 ? "Moderately depressed" : "Severely depressed";
  return (
    <CalcShell title="APGAR Score" result={`${total} / 10`} interpretation={interp}>
      {items.map((label, i) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-[12px]">{label}</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((v) => (
              <button
                key={v}
                onClick={() =>
                  setScores((prev) => prev.map((x, idx) => (idx === i ? v : x)))
                }
                className={`h-7 w-7 mono text-[12px] border rounded ${
                  scores[i] === v ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
    </CalcShell>
  );
}

function GCS() {
  const groups = [
    { label: "Eye", max: 4, options: ["None (1)", "To pain (2)", "To voice (3)", "Spontaneous (4)"] },
    {
      label: "Verbal",
      max: 5,
      options: [
        "None (1)",
        "Incomprehensible (2)",
        "Inappropriate (3)",
        "Confused (4)",
        "Oriented (5)",
      ],
    },
    {
      label: "Motor",
      max: 6,
      options: [
        "None (1)",
        "Extension (2)",
        "Flexion (3)",
        "Withdraws (4)",
        "Localizes (5)",
        "Obeys (6)",
      ],
    },
  ];
  const [vals, setVals] = useState([4, 5, 6]);
  const total = vals.reduce((a, b) => a + b, 0);
  const interp = total >= 13 ? "Mild" : total >= 9 ? "Moderate" : "Severe (consider intubation)";
  return (
    <CalcShell title="Glasgow Coma Scale" result={`${total} / 15`} interpretation={interp}>
      {groups.map((g, i) => (
        <label key={g.label} className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-muted-foreground">{g.label}</span>
          <select
            value={vals[i]}
            onChange={(e) =>
              setVals((prev) =>
                prev.map((x, idx) => (idx === i ? Number(e.target.value) : x)),
              )
            }
            className="h-8 border rounded px-2 mono text-[12px] bg-card"
          >
            {g.options.map((o, oi) => (
              <option key={o} value={oi + 1}>
                {o}
              </option>
            ))}
          </select>
        </label>
      ))}
    </CalcShell>
  );
}

function CheckList({
  items,
  values,
  onChange,
}: {
  items: string[];
  values: boolean[];
  onChange: (i: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((label, i) => (
        <label
          key={label}
          className="flex items-center gap-2 px-2 py-1.5 border rounded cursor-pointer hover:bg-accent/40"
        >
          <input type="checkbox" checked={values[i]} onChange={() => onChange(i)} />
          <span className="text-[12.5px]">{label}</span>
        </label>
      ))}
    </div>
  );
}

function QSofa() {
  const items = ["RR ≥ 22/min", "Altered mentation", "SBP ≤ 100 mmHg"];
  const [v, setV] = useState([false, false, false]);
  const total = v.filter(Boolean).length;
  const interp = total >= 2 ? "High risk — consider sepsis workup" : "Low risk";
  return (
    <CalcShell title="qSOFA" result={`${total} / 3`} interpretation={interp}>
      <CheckList
        items={items}
        values={v}
        onChange={(i) => setV((p) => p.map((x, idx) => (idx === i ? !x : x)))}
      />
    </CalcShell>
  );
}

function Curb() {
  const items = [
    "Confusion",
    "Urea > 7 mmol/L",
    "RR ≥ 30/min",
    "SBP < 90 or DBP ≤ 60",
    "Age ≥ 65",
  ];
  const [v, setV] = useState<boolean[]>(items.map(() => false));
  const total = v.filter(Boolean).length;
  const interp =
    total <= 1
      ? "Low mortality — outpatient possible"
      : total === 2
        ? "Consider admission"
        : "High mortality — admit; consider ICU if ≥ 4";
  return (
    <CalcShell title="CURB-65 (pneumonia severity)" result={`${total} / 5`} interpretation={interp}>
      <CheckList
        items={items}
        values={v}
        onChange={(i) => setV((p) => p.map((x, idx) => (idx === i ? !x : x)))}
      />
    </CalcShell>
  );
}
