import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { ClipboardCopy } from "lucide-react";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Patient Education — Atlas Sanctum Health" },
      {
        name: "description",
        content: "Generate plain-language, multilingual explanations for patients and caregivers.",
      },
    ],
  }),
  component: EducationPage,
});

const TOPICS = [
  "Malaria",
  "High blood pressure",
  "Diabetes",
  "Asthma",
  "Diarrhea in children",
  "Pneumonia",
] as const;

const LANGS = ["English", "Kiswahili", "French"] as const;
const LEVELS = ["Simple", "Medium", "Advanced"] as const;

const CONTENT: Record<
  string,
  Record<(typeof LANGS)[number], Record<(typeof LEVELS)[number], string>>
> = {
  Malaria: {
    English: {
      Simple:
        "Malaria comes from mosquito bites. Take all your medicine, even when you feel better. Drink water and rest. Come back right away if you feel very weak, cannot breathe well, or become confused.",
      Medium:
        "Malaria is caused by parasites spread through mosquito bites. Most people recover well when treatment starts early. Take your medicine exactly as prescribed and return immediately if you develop severe weakness, difficulty breathing, or confusion.",
      Advanced:
        "Uncomplicated malaria is treated with an artemisinin-based combination therapy (ACT). Adherence to the full 3-day regimen prevents recrudescence and resistance. Warning signs of severe malaria include impaired consciousness, respiratory distress, jaundice, and hypoglycaemia; these require immediate referral.",
    },
    Kiswahili: {
      Simple:
        "Malaria husababishwa na mbu. Meza dawa yote hata ukijisikia vizuri. Kunywa maji na pumzika. Rudi haraka ukipata udhaifu mkubwa, shida ya kupumua, au kuchanganyikiwa.",
      Medium:
        "Malaria husababishwa na vimelea vinavyoenezwa na mbu. Watu wengi hupona haraka wakianza matibabu mapema. Tumia dawa kama ilivyoagizwa na urudi mara moja ukipata udhaifu, ugumu wa kupumua, au kuchanganyikiwa.",
      Advanced:
        "Malaria isiyo kali hutibiwa kwa dawa mchanganyiko wa artemisinin (ACT) kwa siku 3. Kumaliza dozi yote huzuia kurudi tena kwa ugonjwa. Dalili za hatari ni pamoja na kupoteza fahamu, shida ya kupumua, na sukari ya chini — hizi zinahitaji rufaa ya haraka.",
    },
    French: {
      Simple:
        "Le paludisme est causé par les piqûres de moustiques. Prenez tous vos médicaments, même quand vous vous sentez mieux. Buvez de l'eau et reposez-vous. Revenez immédiatement en cas de faiblesse grave, difficulté à respirer, ou confusion.",
      Medium:
        "Le paludisme est causé par des parasites transmis par les moustiques. La plupart des personnes guérissent bien avec un traitement précoce. Prenez le traitement comme prescrit et revenez immédiatement si vous développez faiblesse sévère, difficulté respiratoire ou confusion.",
      Advanced:
        "Le paludisme non compliqué est traité par une combinaison thérapeutique à base d'artémisinine (ACT) sur 3 jours. L'observance complète prévient la recrudescence et la résistance. Les signes de gravité (troubles de la conscience, détresse respiratoire, ictère) nécessitent un transfert urgent.",
    },
  },
  "High blood pressure": {
    English: {
      Simple:
        "High blood pressure often has no symptoms. Take your medicine every day. Eat less salt. Walk 30 minutes daily. Come to clinic every month.",
      Medium:
        "High blood pressure is silent but damages the heart, brain, and kidneys over time. Take your medication daily, reduce salt to under a teaspoon a day, exercise regularly, and avoid tobacco.",
      Advanced:
        "Untreated hypertension increases stroke, MI, and CKD risk. Target BP <140/90 mmHg (<130/80 if diabetic or CKD). Combination therapy is usually required; monitor adherence and side effects.",
    },
    Kiswahili: {
      Simple:
        "Shinikizo la juu la damu mara nyingi halina dalili. Tumia dawa kila siku. Punguza chumvi. Tembea dakika 30 kila siku.",
      Medium:
        "Shinikizo la juu la damu haliji na dalili wazi lakini huharibu moyo, ubongo na figo. Meza dawa kila siku, kula chumvi kidogo, fanya mazoezi, na epuka tumbaku.",
      Advanced:
        "Shinikizo la damu lisilotibiwa huongeza hatari ya kiharusi, mshtuko wa moyo, na ugonjwa wa figo. Lengo ni <140/90 mmHg. Fuatilia matumizi ya dawa kila mwezi.",
    },
    French: {
      Simple:
        "L'hypertension n'a souvent pas de symptômes. Prenez vos médicaments chaque jour. Mangez moins de sel. Marchez 30 minutes par jour.",
      Medium:
        "L'hypertension est silencieuse mais endommage le cœur, le cerveau et les reins. Prenez vos médicaments quotidiennement, réduisez le sel, faites de l'exercice, évitez le tabac.",
      Advanced:
        "L'HTA non traitée augmente le risque d'AVC, IDM et IRC. Cible TA <140/90 mmHg (<130/80 si diabète ou IRC). Traitement combiné souvent nécessaire.",
    },
  },
  Diabetes: {
    English: {
      Simple: "Sugar in your blood is high. Take your medicine, eat less sugar and starch, walk daily.",
      Medium:
        "Diabetes means your body cannot control blood sugar well. Take medicine, monitor sugar, eat balanced meals, exercise, and check your feet daily.",
      Advanced:
        "Type 2 diabetes management targets HbA1c <7% in most adults. Metformin is first-line unless contraindicated. Screen annually for retinopathy, nephropathy, and neuropathy.",
    },
    Kiswahili: {
      Simple: "Sukari ya damu iko juu. Tumia dawa, punguza sukari na wanga, tembea kila siku.",
      Medium:
        "Kisukari maana yake mwili hauwezi kudhibiti sukari vizuri. Tumia dawa, pima sukari, kula milo iliyosawazishwa, fanya mazoezi.",
      Advanced:
        "Malengo ya HbA1c ni <7% kwa watu wazima wengi. Metformin ni chaguo la kwanza. Pima macho, figo, na miguu kila mwaka.",
    },
    French: {
      Simple: "Votre sucre sanguin est élevé. Prenez vos médicaments, mangez moins de sucre, marchez chaque jour.",
      Medium:
        "Le diabète signifie que votre corps ne contrôle pas bien la glycémie. Prenez les médicaments, surveillez la glycémie, mangez équilibré, faites du sport.",
      Advanced:
        "Cible HbA1c <7% chez la plupart des adultes. Metformine en 1re ligne. Dépistage annuel rétinopathie, néphropathie, neuropathie.",
    },
  },
  Asthma: {
    English: {
      Simple: "Use your blue inhaler when you cannot breathe. Take the brown inhaler every day.",
      Medium:
        "Asthma tightens your airways. Use a reliever inhaler for attacks and a preventer inhaler daily. Avoid smoke and known triggers.",
      Advanced:
        "Stepwise management per GINA: SABA PRN → low-dose ICS → ICS/LABA. Assess control every visit; provide a written action plan.",
    },
    Kiswahili: {
      Simple: "Tumia pampu ya bluu unaposhindwa kupumua. Tumia pampu ya kahawia kila siku.",
      Medium:
        "Pumu hufunga njia za hewa. Tumia pampu ya haraka wakati wa shambulio na pampu ya kudhibiti kila siku. Epuka moshi.",
      Advanced:
        "Fuata hatua za GINA: SABA inapohitajika → ICS ya kiwango cha chini → ICS/LABA. Toa mpango wa maandishi wa hatua.",
    },
    French: {
      Simple: "Utilisez votre inhalateur bleu quand vous manquez d'air. L'inhalateur marron chaque jour.",
      Medium:
        "L'asthme resserre les voies respiratoires. Utilisez un bronchodilatateur en crise et un préventif quotidien. Évitez la fumée.",
      Advanced:
        "Prise en charge selon GINA: SABA à la demande → CSI faible dose → CSI/LABA. Plan d'action écrit.",
    },
  },
  "Diarrhea in children": {
    English: {
      Simple: "Give ORS after every loose stool. Keep breastfeeding. Give zinc for 10 days. Return if the child is weak or cannot drink.",
      Medium:
        "Most diarrhea in children is caused by viruses and resolves in a few days. Give ORS after each stool, continue feeding, and give zinc 20 mg daily for 10 days (10 mg if under 6 months).",
      Advanced:
        "Per IMCI: assess dehydration (Plan A/B/C), treat with ORS + zinc, continue feeding. Antibiotics only for dysentery or cholera.",
    },
    Kiswahili: {
      Simple: "Mpe ORS baada ya kila choo. Endelea kunyonyesha. Mpe zinki kwa siku 10.",
      Medium:
        "Kuharisha kwa watoto husababishwa mara nyingi na virusi. Mpe ORS baada ya kila choo, endelea kumlisha, na mpe zinki mg 20 kwa siku 10.",
      Advanced:
        "Fuata IMCI: tathmini upungufu wa maji (Plan A/B/C), tibu kwa ORS + zinki. Antibiotics ni kwa kuhara damu au kipindupindu tu.",
    },
    French: {
      Simple: "Donnez SRO après chaque selle. Continuez l'allaitement. Donnez du zinc pendant 10 jours.",
      Medium:
        "La plupart des diarrhées de l'enfant sont virales. Donnez SRO après chaque selle, continuez à nourrir, zinc 20 mg/j 10 jours.",
      Advanced:
        "PCIME: évaluer la déshydratation (Plan A/B/C), SRO + zinc, alimentation continue. Antibiotiques réservés à la dysenterie/choléra.",
    },
  },
  Pneumonia: {
    English: {
      Simple: "You have a chest infection. Take antibiotics as told. Drink water. Come back if breathing gets worse.",
      Medium:
        "Pneumonia is a lung infection. Take the full course of antibiotics, rest, and drink fluids. Return urgently for fast breathing, chest pain, or blue lips.",
      Advanced:
        "Community-acquired pneumonia treated with amoxicillin first-line (7 days). Assess severity with CURB-65; consider referral for score ≥2.",
    },
    Kiswahili: {
      Simple: "Una maambukizi kifuani. Meza dawa zote. Kunywa maji. Rudi ikiwa upumuaji unazidi kuwa mbaya.",
      Medium:
        "Nimonia ni maambukizi ya mapafu. Maliza dozi ya antibiotiki, pumzika, kunywa maji. Rudi haraka ikiwa unapumua haraka au midomo inakuwa bluu.",
      Advanced:
        "Nimonia ya jamii hutibiwa kwa amoxicillin ya kwanza (siku 7). Tathmini uzito kwa CURB-65; rufaa kwa ≥2.",
    },
    French: {
      Simple: "Vous avez une infection pulmonaire. Prenez les antibiotiques. Buvez. Revenez si la respiration empire.",
      Medium:
        "La pneumonie est une infection des poumons. Terminez le traitement, reposez-vous, hydratez-vous. Revenez d'urgence si respiration rapide ou lèvres bleues.",
      Advanced:
        "Pneumonie communautaire: amoxicilline en 1re ligne (7 jours). CURB-65 pour la sévérité; hospitalisation si ≥2.",
    },
  },
};

function EducationPage() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("Malaria");
  const [lang, setLang] = useState<(typeof LANGS)[number]>("English");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Medium");

  const text = useMemo(() => CONTENT[topic][lang][level], [topic, lang, level]);

  return (
    <>
      <PageHeader
        title="Patient Education"
        subtitle="Plain-language explanations you can hand to patients or read aloud."
      />
      <div className="p-5 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <div className="clinical-card p-4 space-y-4 h-fit">
          <FieldGroup label="Topic">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as typeof topic)}
              className="w-full h-9 border rounded px-2 mono text-[13px] bg-card"
            >
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Language">
            <div className="grid grid-cols-3 gap-1">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`h-8 text-[12px] border rounded ${
                    lang === l ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Reading level">
            <div className="grid grid-cols-3 gap-1">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`h-8 text-[12px] border rounded ${
                    level === l ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>

        <article className="clinical-card p-5 space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <div className="text-[11px] mono uppercase tracking-wide text-muted-foreground">
                {lang} · {level}
              </div>
              <h2 className="text-[16px] font-semibold">{topic}</h2>
            </div>
            <button
              className="inline-flex items-center gap-2 h-8 px-3 rounded border text-[12px] hover:bg-accent"
              onClick={() => navigator.clipboard?.writeText(text)}
            >
              <ClipboardCopy className="h-3.5 w-3.5" /> Copy
            </button>
          </header>
          <p className="text-[15px] leading-relaxed">{text}</p>
          <p className="text-[11px] text-muted-foreground mono border-t pt-2">
            Written for patients. Do not replace individualized clinical judgement.
          </p>
        </article>
      </div>
    </>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
