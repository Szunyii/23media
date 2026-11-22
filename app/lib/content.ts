/**
 * The page copy that is told more than once: on the home page sections, on
 * the Rólunk / Kapcsolat pages, in the Markdown versions agents fetch, in
 * llms.txt and through the MCP endpoint. It lives here so all of them say the
 * same thing — edit the copy here, not in the components.
 *
 * Client copy, verbatim (see the memory notes on each section): only the
 * typography is ours. `{ hl }` marks the self-awareness phrases that get the
 * highlighter on the page; `{ strong }` a phrase set in the lead's weight.
 */

export type HlPart = string | { hl: string };
export type LetterPart = HlPart | { strong: string };

/** The text of a run of parts, marks dropped. */
export function plain(parts: readonly LetterPart[]): string {
  return parts
    .map((p) => (typeof p === "string" ? p : "hl" in p ? p.hl : p.strong))
    .join("");
}

/* ----------------------------------------------------------------- *
 * Manifesto ("Kiáltvány") — on the page the "23media" mark is set inline
 * where the plain text says "A 23media".
 * ----------------------------------------------------------------- */
export const MANIFESTO = {
  lead: "Az online kommunikáció olyan, mint egy szimfonikus zenekar.",
  body: "A 23media egy olyan ökoszisztémát alkotott meg, ahol minden szakértő egyetlen közös kottából olvas! Ha velünk fejlődsz, a teljes kommunikációd egy kézben lesz.",
  points: [
    "Nincsenek felesleges körök. Nincs kidobott idő és nézeteltérés.",
    "Minden szakértő egy irányba halad: Brandet építünk & Pénzt termelünk neked!",
  ],
} as const;

/* ----------------------------------------------------------------- *
 * Services
 * ----------------------------------------------------------------- */
export type Service = {
  n: string;
  /** stable id for agents (MCP / WebMCP / schema.org) */
  id: string;
  title: string;
  desc: HlPart[];
  items: HlPart[];
};

export const SERVICES: Service[] = [
  {
    n: "01",
    id: "marka-es-arculat",
    title: "Márka és arculat",
    desc: [
      "Arculatot tervezünk és alkotunk a nulláról, vagy fejlesztünk. Márkát építünk úgy, hogy a kommunikációd azt a hivatást tükrözze, amiért minden nap felkelsz!",
    ],
    items: ["Grafikai tervezés", "Branding", "Storyline"],
  },
  {
    n: "02",
    id: "web-es-rendszerfejlesztes",
    title: "Web és rendszerfejlesztés",
    desc: [
      "Weboldalt építünk vagy fejlesztünk annak érdekében, hogy a sikeres és átütő kommunikáció mögött vásárlás és megtérülés legyen.",
    ],
    items: ["Webdesign", "Webfejlesztés", "Programozás", "Rendszeralkotás"],
  },
  {
    n: "03",
    id: "tartalomgyartas",
    title: "Tartalomgyártás",
    desc: [
      "Brandhez illő tartalmakat alkotunk, tervezéstől a kész megjelenésig. ",
      { hl: "Szereplést tanítunk, önismereti mentor bevonásával." },
      " Az eredmény egy önazonos, hiteles kommunikáció, ami mellett nem tud elmenni a célközönséged!",
    ],
    items: ["Script írás", "Forgatás", "Vágás", { hl: "Szereplés mentoring" }],
  },
  {
    n: "04",
    id: "hirdetes-es-novekedes",
    title: "Hirdetés és növekedés",
    desc: [
      "Értékesítési tölcsért alkotunk, majd profi PPC kampányt indítunk. KPI felállítás, eredmények és konverzió.",
    ],
    items: ["PPC", "Analitika", "Folyamatos növekedés"],
  },
  {
    n: "05",
    id: "social-management",
    title: "Social management",
    desc: [
      "Teljes körű közösségi média kezelést biztosítunk. Posztolunk, interaktálunk a közönségeddel, és olyan oldalstruktúrát állítunk fel, amiben nem akadnak el az érdeklődők!",
    ],
    items: ["Stratégia", "Interakció", "Rendszer", "Posztolás"],
  },
];

/* ----------------------------------------------------------------- *
 * Personal branding — the featured service
 * ----------------------------------------------------------------- */
export const PERSONAL_BRANDING = {
  title: "Personal branding",
  lead: "A mai kor egyik legerősebb médiaeszköze a személyes márkaépítés!",
  body: "A 23 Media ökoszisztémája egy teljeskörű szolgáltatás keretében képes megalkotni, megtervezni, kivitelezni és célba juttatni egy personal brandet.",
} as const;

// In the order the work happens: the mentor work runs through everything,
// the discovery phase precedes content, strategy + scripts follow. The first
// pillar is the self-awareness one — its whole cell is the marker.
export const PB_PILLARS: { n: string; title: string; desc: HlPart[] }[] = [
  {
    n: "01",
    title: "Önismeret",
    desc: [
      "A munka során ",
      { hl: "önismereti mentor bevonásával" },
      " dolgozunk a lelki fejlődésen, és a személyes márkaépítés során felbukkanó elakadásokon.",
    ],
  },
  {
    n: "02",
    title: "Feltárás",
    desc: [
      "Ügyfeleink számára egy mély, feltáró szakasz előzi meg a tartalomgyártást. Ennek során felkutatjuk a védjegyeket, ",
      { hl: "a hiteles és önazonos kommunikációt" },
      " és az üzleti lehetőségeket.",
    ],
  },
  {
    n: "03",
    title: "Stratégia és script",
    desc: [
      "A márkaépítés során teljeskörű stratégiaalkotással és scriptírással dolgozunk.",
    ],
  },
];

/* ----------------------------------------------------------------- *
 * Számokban — the client's figures, plain
 * ----------------------------------------------------------------- */
export type Stat = {
  value: string;
  label: string;
  /** render an accent "+" after the figure */
  plus?: boolean;
};

export const STATS: Stat[] = [
  { value: "20", plus: true, label: "Aktív ügyfél" },
  { value: "2300", plus: true, label: "Legyártott videó" },
  { value: "12", label: "Fős csapat" },
];

/* ----------------------------------------------------------------- *
 * Founder
 * ----------------------------------------------------------------- */
// The founder's letter, in his own words (client copy, 2026-11-22) and in his
// order, each sentence used once. On the page the opening hook is set as the
// display quote, its answer leads the first paragraph, and his invitation
// closes the letter on the accent rule.
export const FOUNDER = {
  name: "Engi Ádám",
  roles: ["Marketinges", "Közgazdász", "Önismereti mentor"],
  portrait: "/founder.jpg",
  lead: {
    before: "Rengeteg vezető szenved a cégépítésben… ",
    accent: "De mitől szenvednek a legjobban?",
  },
  letter: [
    {
      lead: "Attól, hogy el vannak veszve és semmire nincs idejük.",
      body: [
        " Nincs idő a családdal lenni és élvezni azt, amit megteremtettek. Túl sok folyamat van a cégükben, ami nincs egy kézben tartva…",
      ],
    },
    {
      body: [
        "Marketingesként, közgazdászként és ",
        { hl: "önismereti mentorként" },
        " olyan teret alkottam meg a csapatom segítségével a vállalkozók számára, ahol időt és ideget spórolhatnak úgy, hogy ",
        { strong: "végre valaki megérti őket!" },
        " Itt nem ciki elfáradni, hibázni és megosztani az érzéseket. Őszintén dolgozunk együtt, minden nap egy közös cél érdekében!",
      ],
    },
    {
      body: [
        "Ehhez egy összehangolt csapat kell. Most végre egy olyan csapatot kaphatnak a vállalkozók, ahol minden szakértő egy kottából játszik! A marketinges nem köpköd a tartalomgyártóra… A webes nem rakja rá a telefont a hirdetéskezelőre… Itt minden eszközt egy irányba húzunk!",
      ],
    },
  ] as { lead?: string; body: LetterPart[] }[],
  closing:
    "Ha szeretnél egy olyan ökoszisztémát, ahol nem kell száz felé rohangálnod, lehetsz őszinte és közben gyönyörködhetsz a számokban, szívből ajánlom a 23 Media csapatát!",
};

/* ----------------------------------------------------------------- *
 * Free consultation — what happens after the form is sent
 * ----------------------------------------------------------------- */
export const CONSULT = {
  title: "Ingyenes konzultáció",
  description:
    "30 perces, kötelezettség nélküli hívás: átnézzük, hol tart a márkád, és három konkrét lépést adunk, amit már holnap megléphetsz.",
  steps: [
    {
      n: "01",
      t: "24 órán belül válaszolunk",
      d: "Egy rövid e-mail vagy hívás, hogy mikor érünk rá mindketten.",
    },
    {
      n: "02",
      t: "30 perces videóhívás",
      d: "Átnézzük, hol tart a márkád, és mi az a három dolog, ami most a legtöbbet hozná.",
    },
    {
      n: "03",
      t: "Írásos összefoglaló",
      d: "Konkrét javaslatokkal, ami akkor is a tiéd, ha végül nem velünk dolgozol!",
    },
  ],
} as const;
