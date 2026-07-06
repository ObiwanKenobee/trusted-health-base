// Local, offline clinical knowledge base (illustrative MVP data).
// All content is bundled; no network calls.

export type Confidence = "high" | "medium" | "low";

export type Condition = {
  name: string;
  confidence: Confidence;
  rationale: string;
  icd10?: string;
};

export type Assessment = {
  conditions: Condition[];
  questions: string[];
  investigations: string[];
  advice: string[];
  redFlags: string[];
  sources: { title: string; ref: string }[];
};

const symptomWeights: Record<string, { condition: string; weight: number }[]> = {
  fever: [
    { condition: "Malaria", weight: 3 },
    { condition: "Influenza", weight: 2 },
    { condition: "Pneumonia", weight: 2 },
    { condition: "Typhoid", weight: 2 },
  ],
  cough: [
    { condition: "Pneumonia", weight: 3 },
    { condition: "Influenza", weight: 2 },
    { condition: "Tuberculosis", weight: 2 },
  ],
  headache: [
    { condition: "Malaria", weight: 2 },
    { condition: "Influenza", weight: 1 },
    { condition: "Meningitis", weight: 2 },
  ],
  chills: [{ condition: "Malaria", weight: 2 }],
  "sore throat": [{ condition: "Influenza", weight: 2 }],
  "shortness of breath": [
    { condition: "Pneumonia", weight: 3 },
    { condition: "Asthma", weight: 2 },
  ],
  vomiting: [{ condition: "Gastroenteritis", weight: 2 }, { condition: "Malaria", weight: 1 }],
  diarrhea: [{ condition: "Gastroenteritis", weight: 3 }, { condition: "Cholera", weight: 2 }],
  rash: [{ condition: "Measles", weight: 2 }],
  "neck stiffness": [{ condition: "Meningitis", weight: 4 }],
  fatigue: [{ condition: "Anemia", weight: 1 }, { condition: "Malaria", weight: 1 }],
};

export const COMMON_SYMPTOMS = [
  "Fever",
  "Cough",
  "Headache",
  "Chills",
  "Sore throat",
  "Shortness of breath",
  "Vomiting",
  "Diarrhea",
  "Rash",
  "Neck stiffness",
  "Fatigue",
];

const investigationsMap: Record<string, string[]> = {
  Malaria: ["Malaria RDT", "Thick & thin blood film", "CBC", "Temperature"],
  Influenza: ["Clinical diagnosis", "Rapid influenza test (if available)"],
  Pneumonia: ["Chest X-ray", "SpO₂", "CBC", "Sputum culture"],
  Typhoid: ["Widal test", "Blood culture", "CBC"],
  Tuberculosis: ["Sputum GeneXpert", "Chest X-ray"],
  Meningitis: ["Lumbar puncture", "Blood culture", "CBC"],
  Asthma: ["Peak expiratory flow", "SpO₂"],
  Gastroenteritis: ["Stool exam", "Hydration status"],
  Cholera: ["Stool exam", "Rapid cholera test", "Electrolytes"],
  Measles: ["Clinical diagnosis", "Measles IgM"],
  Anemia: ["Hemoglobin", "CBC"],
};

const questionsMap: Record<string, string[]> = {
  Malaria: ["Recent travel to endemic area?", "Mosquito exposure?", "Prior antimalarial use?"],
  Pneumonia: ["Difficulty breathing?", "Chest pain?", "Sputum colour?"],
  Meningitis: ["Photophobia?", "Altered consciousness?", "Recent ear infection?"],
  Influenza: ["Sick contacts?", "Vaccination status?"],
  Tuberculosis: ["Night sweats?", "Weight loss?", "Known TB contact?"],
};

const RED_FLAG_SYMPTOMS = ["neck stiffness", "shortness of breath"];

export function assess(input: {
  age: number;
  gender: "male" | "female";
  symptoms: string[];
  durationDays: number;
  history: string;
  meds: string;
}): Assessment {
  const scores: Record<string, number> = {};
  const lower = input.symptoms.map((s) => s.toLowerCase());
  for (const s of lower) {
    const weights = symptomWeights[s];
    if (weights) {
      for (const { condition, weight } of weights) {
        scores[condition] = (scores[condition] ?? 0) + weight;
      }
    }
  }

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const maxScore = ranked[0]?.[1] ?? 0;

  const conditions: Condition[] = ranked.map(([name, score]) => {
    const ratio = maxScore ? score / maxScore : 0;
    const confidence: Confidence = ratio >= 0.8 ? "high" : ratio >= 0.5 ? "medium" : "low";
    return {
      name,
      confidence,
      rationale: `Matches ${score} weighted symptom${score === 1 ? "" : "s"}.`,
    };
  });

  if (conditions.length === 0) {
    conditions.push({
      name: "Insufficient data",
      confidence: "low",
      rationale: "Add more symptoms to refine differential.",
    });
  }

  const investigations = new Set<string>();
  const questions = new Set<string>();
  for (const c of conditions.slice(0, 3)) {
    (investigationsMap[c.name] ?? []).forEach((i) => investigations.add(i));
    (questionsMap[c.name] ?? []).forEach((q) => questions.add(q));
  }

  const redFlags: string[] = [];
  for (const rf of RED_FLAG_SYMPTOMS) {
    if (lower.includes(rf)) redFlags.push(`Presence of "${rf}" — evaluate for emergency referral.`);
  }
  if (input.age < 5 && lower.includes("fever")) {
    redFlags.push("Child under 5 with fever — assess for severe malaria / sepsis.");
  }
  if (input.durationDays >= 7) {
    redFlags.push("Symptoms persisting ≥ 7 days — reconsider differential, investigate further.");
  }

  const advice: string[] = [
    "Ensure adequate hydration and rest.",
    "Monitor temperature every 4 hours.",
    "Complete prescribed course of medication.",
    "Return immediately for worsening symptoms.",
  ];

  const sources = [
    { title: "WHO Guidelines for the Treatment of Malaria (3rd ed.)", ref: "WHO/2015" },
    { title: "Kenya MoH Clinical Guidelines, 2018", ref: "MoH-KE/2018" },
    { title: "IMCI Chart Booklet", ref: "WHO/IMCI/2014" },
  ];

  return { conditions, questions: [...questions], investigations: [...investigations], advice, redFlags, sources };
}

// ---------- Drugs ----------

export type Drug = {
  name: string;
  class: string;
  indications: string[];
  adultDose: string;
  pediatricDose: string;
  contraindications: string[];
  interactions: string[];
  pregnancy: string;
  storage: string;
  sideEffects: string[];
  references: string[];
};

export const DRUGS: Drug[] = [
  {
    name: "Artemether-Lumefantrine",
    class: "Antimalarial (ACT)",
    indications: ["Uncomplicated P. falciparum malaria"],
    adultDose: "4 tabs (80/480 mg) at 0, 8, 24, 36, 48, 60 h with fatty food.",
    pediatricDose: "Weight-based; 5–14 kg: 1 tab per dose × 6 doses.",
    contraindications: ["1st trimester pregnancy", "Severe malaria", "QT prolongation"],
    interactions: ["CYP3A4 inducers (rifampicin)", "QT-prolonging drugs"],
    pregnancy: "Category C — avoid 1st trimester unless no alternative.",
    storage: "Below 30 °C, protect from moisture.",
    sideEffects: ["Headache", "Dizziness", "GI upset"],
    references: ["WHO Malaria Treatment Guidelines 2015", "Kenya MoH 2018"],
  },
  {
    name: "Amoxicillin",
    class: "Aminopenicillin antibiotic",
    indications: ["Community-acquired pneumonia", "Otitis media", "UTI (susceptible)"],
    adultDose: "500 mg PO TDS × 5–7 days.",
    pediatricDose: "40–90 mg/kg/day divided BD–TDS.",
    contraindications: ["Penicillin allergy"],
    interactions: ["Methotrexate", "Warfarin (monitor INR)"],
    pregnancy: "Category B — considered safe.",
    storage: "Room temperature; suspension refrigerate after reconstitution.",
    sideEffects: ["Diarrhea", "Rash", "Nausea"],
    references: ["WHO EML", "Kenya MoH 2018"],
  },
  {
    name: "Paracetamol",
    class: "Analgesic / antipyretic",
    indications: ["Fever", "Mild-to-moderate pain"],
    adultDose: "500–1000 mg PO 4–6 hourly, max 4 g/day.",
    pediatricDose: "10–15 mg/kg PO 4–6 hourly, max 60 mg/kg/day.",
    contraindications: ["Severe hepatic impairment"],
    interactions: ["Warfarin (with prolonged use)", "Isoniazid"],
    pregnancy: "Category B — first-line antipyretic in pregnancy.",
    storage: "Room temperature.",
    sideEffects: ["Rare hepatotoxicity in overdose"],
    references: ["WHO EML"],
  },
  {
    name: "ORS (Oral Rehydration Salts)",
    class: "Rehydration therapy",
    indications: ["Dehydration due to diarrhea", "Cholera"],
    adultDose: "200–400 mL after each loose stool.",
    pediatricDose: "<2 y: 50–100 mL / stool; 2–10 y: 100–200 mL / stool.",
    contraindications: ["Intestinal obstruction", "Severe shock (use IV first)"],
    interactions: ["None significant"],
    pregnancy: "Safe.",
    storage: "Store sachets dry; use within 24 h once reconstituted.",
    sideEffects: ["Vomiting if given too quickly"],
    references: ["WHO IMCI", "Kenya MoH 2018"],
  },
  {
    name: "Magnesium sulfate",
    class: "Anticonvulsant / tocolytic",
    indications: ["Eclampsia", "Severe pre-eclampsia"],
    adultDose: "Loading 4 g IV over 20 min + 10 g IM; maintenance 5 g IM 4-hourly.",
    pediatricDose: "Not routinely used.",
    contraindications: ["Heart block", "Myasthenia gravis"],
    interactions: ["CNS depressants", "Nifedipine (hypotension)"],
    pregnancy: "Indicated in eclampsia.",
    storage: "Room temperature.",
    sideEffects: ["Flushing", "Respiratory depression (monitor reflexes)"],
    references: ["WHO PEC Guidelines", "Kenya MoH Maternal Protocol"],
  },
  {
    name: "Adrenaline (Epinephrine)",
    class: "Sympathomimetic",
    indications: ["Anaphylaxis", "Cardiac arrest"],
    adultDose: "Anaphylaxis: 0.5 mg IM (1:1000) thigh, repeat every 5 min.",
    pediatricDose: "0.01 mg/kg IM (max 0.5 mg).",
    contraindications: ["No absolute in emergency"],
    interactions: ["Beta blockers may blunt response"],
    pregnancy: "Use if indicated in anaphylaxis.",
    storage: "2–8 °C, protect from light.",
    sideEffects: ["Tachycardia", "Tremor", "Anxiety"],
    references: ["WHO PEC", "Resuscitation Council Guidelines"],
  },
];

// ---------- Emergency protocols ----------

export type Protocol = {
  key: string;
  title: string;
  urgency: "immediate" | "urgent";
  steps: string[];
  drugs?: string[];
  refer: string;
};

export const PROTOCOLS: Protocol[] = [
  {
    key: "anaphylaxis",
    title: "Anaphylaxis",
    urgency: "immediate",
    steps: [
      "Call for help. Remove trigger.",
      "Adrenaline 0.5 mg IM (1:1000) into anterolateral thigh.",
      "Position supine; elevate legs. If pregnant, left lateral.",
      "High-flow oxygen; secure airway.",
      "Establish IV access — normal saline 20 mL/kg bolus if hypotensive.",
      "Repeat adrenaline every 5 min if no improvement.",
      "Adjuncts: hydrocortisone 200 mg IV, chlorphenamine 10 mg IV.",
    ],
    drugs: ["Adrenaline 1:1000", "Hydrocortisone", "Chlorphenamine"],
    refer: "Admit / refer to higher care after stabilization.",
  },
  {
    key: "stroke",
    title: "Stroke (Acute)",
    urgency: "immediate",
    steps: [
      "FAST assessment: Face, Arm, Speech, Time.",
      "Note time of onset — critical for thrombolysis window.",
      "Airway, breathing, circulation.",
      "Check blood glucose — exclude hypoglycemia.",
      "Oxygen only if SpO₂ < 94%.",
      "Do NOT give aspirin until hemorrhage excluded.",
      "Urgent transfer to CT-capable centre.",
    ],
    refer: "Immediate referral for imaging within 4.5 h window.",
  },
  {
    key: "trauma",
    title: "Major Trauma",
    urgency: "immediate",
    steps: [
      "Scene safety; PPE.",
      "Primary survey: A-B-C-D-E.",
      "Control catastrophic hemorrhage first (tourniquet, pressure).",
      "C-spine immobilization if suspected.",
      "Large-bore IV × 2; tranexamic acid 1 g IV within 3 h.",
      "Secondary survey head-to-toe.",
      "Prepare for transfer.",
    ],
    drugs: ["Tranexamic acid", "IV fluids", "Analgesia"],
    refer: "Refer to trauma-capable facility.",
  },
  {
    key: "mi",
    title: "Acute Coronary Syndrome",
    urgency: "immediate",
    steps: [
      "12-lead ECG within 10 min.",
      "Aspirin 300 mg PO (chew), Clopidogrel 300 mg loading.",
      "Oxygen if SpO₂ < 94%.",
      "GTN sublingual if SBP > 90 mmHg.",
      "Morphine 2–5 mg IV for pain.",
      "Consider thrombolysis if STEMI and no PCI within 120 min.",
    ],
    drugs: ["Aspirin", "Clopidogrel", "GTN", "Morphine", "Streptokinase"],
    refer: "Immediate cardiology referral.",
  },
  {
    key: "shock",
    title: "Shock",
    urgency: "immediate",
    steps: [
      "Identify type: hypovolemic, septic, cardiogenic, anaphylactic, obstructive.",
      "High-flow oxygen.",
      "2 large-bore IVs; crystalloid 20–30 mL/kg bolus.",
      "Reassess every 5–10 min (HR, BP, urine output, capillary refill).",
      "Treat cause — antibiotics for sepsis within 1 h.",
      "Consider vasopressors if fluid-refractory.",
    ],
    refer: "ICU-level care required.",
  },
  {
    key: "snake",
    title: "Snake Bite",
    urgency: "urgent",
    steps: [
      "Reassure, immobilize limb below heart level.",
      "Do NOT cut, suck, apply tourniquet or ice.",
      "Remove tight items (rings, watches).",
      "Assess for envenomation: bleeding, swelling, neuro signs, 20-min WBCT.",
      "Antivenom if signs of envenomation — start with 10 vials in saline over 1 h.",
      "Monitor for anaphylaxis to antivenom; adrenaline ready.",
    ],
    drugs: ["Polyvalent antivenom", "Adrenaline (standby)", "Tetanus toxoid"],
    refer: "Refer all envenomations to hospital.",
  },
  {
    key: "burns",
    title: "Burns",
    urgency: "urgent",
    steps: [
      "Stop the burning; remove clothing not stuck to skin.",
      "Cool with running water 20 min (within 3 h of burn).",
      "Estimate %TBSA using Rule of Nines.",
      "Fluid resuscitation (Parkland): 4 mL × kg × %TBSA in 24 h, half in first 8 h.",
      "Analgesia; tetanus prophylaxis.",
      "Cover with clean dry dressing — no creams initially.",
    ],
    refer: "Refer >10% TBSA, face/hands/perineum, or full-thickness burns.",
  },
  {
    key: "cpr",
    title: "Adult CPR (BLS)",
    urgency: "immediate",
    steps: [
      "Check responsiveness; call for help / AED.",
      "Open airway; check breathing for ≤ 10 s.",
      "Start compressions: 30:2, rate 100–120/min, depth 5–6 cm.",
      "Attach AED as soon as available; follow prompts.",
      "Minimize interruptions; rotate compressor every 2 min.",
      "Consider reversible causes (4H 4T).",
    ],
    refer: "Continue until ROSC or handover to advanced team.",
  },
];

// ---------- Vaccination (Kenya EPI baseline) ----------

export type VaccineDose = { vaccine: string; ageLabel: string; ageMonths: number };

export const KENYA_EPI: VaccineDose[] = [
  { vaccine: "BCG", ageLabel: "At birth", ageMonths: 0 },
  { vaccine: "OPV 0", ageLabel: "At birth", ageMonths: 0 },
  { vaccine: "OPV 1", ageLabel: "6 weeks", ageMonths: 1.5 },
  { vaccine: "Pentavalent 1", ageLabel: "6 weeks", ageMonths: 1.5 },
  { vaccine: "PCV 1", ageLabel: "6 weeks", ageMonths: 1.5 },
  { vaccine: "Rota 1", ageLabel: "6 weeks", ageMonths: 1.5 },
  { vaccine: "OPV 2", ageLabel: "10 weeks", ageMonths: 2.5 },
  { vaccine: "Pentavalent 2", ageLabel: "10 weeks", ageMonths: 2.5 },
  { vaccine: "PCV 2", ageLabel: "10 weeks", ageMonths: 2.5 },
  { vaccine: "Rota 2", ageLabel: "10 weeks", ageMonths: 2.5 },
  { vaccine: "OPV 3", ageLabel: "14 weeks", ageMonths: 3.5 },
  { vaccine: "Pentavalent 3", ageLabel: "14 weeks", ageMonths: 3.5 },
  { vaccine: "PCV 3", ageLabel: "14 weeks", ageMonths: 3.5 },
  { vaccine: "IPV", ageLabel: "14 weeks", ageMonths: 3.5 },
  { vaccine: "Measles-Rubella 1", ageLabel: "9 months", ageMonths: 9 },
  { vaccine: "Yellow Fever", ageLabel: "9 months", ageMonths: 9 },
  { vaccine: "Measles-Rubella 2", ageLabel: "18 months", ageMonths: 18 },
];

export function vaccineStatusFor(ageMonths: number) {
  const due = KENYA_EPI.filter((v) => v.ageMonths <= ageMonths);
  const upcoming = KENYA_EPI.filter((v) => v.ageMonths > ageMonths).slice(0, 4);
  return { due, upcoming };
}

// ---------- Guidelines (mini corpus) ----------

export type GuidelineDoc = {
  id: string;
  title: string;
  source: "WHO" | "Kenya MoH" | "Emergency Care" | "Patient Education";
  section: string;
  body: string;
  tags: string[];
};

export const GUIDELINES: GuidelineDoc[] = [
  {
    id: "who-htn-1",
    title: "Hypertension — Adult Management",
    source: "WHO",
    section: "Cardiovascular",
    body: "Confirm on 2+ visits. Lifestyle: reduce salt <5 g/day, exercise 150 min/week, weight loss. Initiate pharmacotherapy if BP ≥140/90 with CVD risk, or ≥160/100 always. First-line: ACEi/ARB, thiazide, or CCB. Target <140/90 (<130/80 if diabetic/CKD).",
    tags: ["hypertension", "bp", "cardiovascular"],
  },
  {
    id: "moh-mal-1",
    title: "Uncomplicated Malaria — Kenya",
    source: "Kenya MoH",
    section: "Infectious Disease",
    body: "Confirm with RDT or microscopy before treatment. First-line: Artemether-Lumefantrine 6-dose regimen. Refer if severe: impaired consciousness, respiratory distress, jaundice, hypoglycemia, hemoglobin <5 g/dL.",
    tags: ["malaria", "act", "artemether"],
  },
  {
    id: "moh-mat-htn",
    title: "Maternal Hypertension & Pre-eclampsia",
    source: "Kenya MoH",
    section: "Maternal Health",
    body: "Diagnose pre-eclampsia: BP ≥140/90 + proteinuria after 20 weeks. Severe features: BP ≥160/110, headache, visual changes, RUQ pain. Manage with methyldopa/labetalol; magnesium sulfate for eclampsia prophylaxis. Delivery is definitive treatment.",
    tags: ["hypertension", "pregnancy", "pre-eclampsia", "maternal"],
  },
  {
    id: "ec-sepsis",
    title: "Sepsis Recognition & Initial Care",
    source: "Emergency Care",
    section: "Emergency",
    body: "qSOFA ≥2 (RR ≥22, altered mentation, SBP ≤100) suggests sepsis. Start 'Hour-1 bundle': measure lactate, blood cultures, broad-spectrum antibiotics, 30 mL/kg crystalloid if hypotensive or lactate ≥4.",
    tags: ["sepsis", "qsofa", "shock"],
  },
  {
    id: "pe-htn",
    title: "Living with High Blood Pressure",
    source: "Patient Education",
    section: "Chronic Care",
    body: "High blood pressure is often silent. Take medication daily, even when you feel well. Reduce added salt, cook with less oil, walk 30 minutes a day, and avoid tobacco. Come to the clinic if you have chest pain, weakness on one side, or severe headache.",
    tags: ["hypertension", "education"],
  },
  {
    id: "who-imci-fever",
    title: "IMCI — Fever in Under-Fives",
    source: "WHO",
    section: "Pediatrics",
    body: "For any child 2 months–5 years with fever: check for danger signs (unable to drink, vomits everything, convulsions, lethargy). Test for malaria in endemic areas. Look for stiff neck, cough with fast breathing, ear pain, measles rash.",
    tags: ["imci", "fever", "pediatric"],
  },
];

export function searchGuidelines(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return GUIDELINES;
  return GUIDELINES.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.body.toLowerCase().includes(q) ||
      g.tags.some((t) => t.includes(q)) ||
      g.source.toLowerCase().includes(q),
  );
}
