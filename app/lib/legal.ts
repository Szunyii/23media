/**
 * The three legal pages — privacy notice, terms of use, imprint — as data, so
 * the HTML page (components/LegalPage.tsx) and the Markdown version agents
 * fetch (lib/markdown.ts) are rendered from one text.
 *
 * Inline links use Markdown syntax, `[text](href)`, in both renderers.
 *
 * Written from what the site actually does (2026-11-22): the consultation form
 * is the only place personal data is entered; no cookies, no analytics, fonts
 * self-hosted by next/font; hosting, the mailbox and the form's SMTP delivery
 * (konzultacio/actions.ts) all at Hostinger. If any of that moves to another
 * provider, add it to the processors. Have the texts reviewed before relying
 * on them — the 1-year retention is a default.
 */
import {
  COMPANY,
  CONTACT_EMAIL,
  CONTENT_SIGNAL,
  HOSTING_PROVIDER,
  PAGES,
  SITE_NAME,
  SITE_URL,
} from "./site";

export type Block = { p: string } | { ul: string[] } | { rows: [string, string][] };
export type LegalSection = { h: string; blocks: Block[] };
export type LegalDoc = {
  title: string;
  /** meta description */
  description: string;
  intro: string;
  sections: LegalSection[];
};

export const LEGAL_EFFECTIVE = "2026. november 22.";

const MAIL = `[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`;
const link = (key: keyof typeof PAGES, text: string = PAGES[key].title) =>
  `[${text}](${PAGES[key].path})`;

/** The operator's identity — only the fields filled in site.ts COMPANY. */
function companyRows(): [string, string][] {
  const rows: [string, string | null][] = [
    ["Név", COMPANY.legalName ?? SITE_NAME],
    ["Székhely", COMPANY.seat],
    ["Cégjegyzékszám", COMPANY.registrationNumber],
    ["Nyilvántartó bíróság", COMPANY.registry],
    ["Adószám", COMPANY.taxNumber],
    ["E-mail", MAIL],
    ["Weboldal", `[23media.hu](${SITE_URL})`],
  ];
  return rows.filter((r): r is [string, string] => r[1] !== null);
}

const hostingRow = (label: string): [string, string] => [
  label,
  `${HOSTING_PROVIDER.name}, ${HOSTING_PROVIDER.address} — [hostinger.com](${HOSTING_PROVIDER.url})`,
];

export const PRIVACY: LegalDoc = {
  title: PAGES.privacy.title,
  description:
    "Milyen személyes adatokat kezel a 23media a weboldalon és a konzultációs űrlapon, mire, meddig, és milyen jogaid vannak.",
  intro:
    "Ez a tájékoztató elmondja, milyen személyes adatokat kezelünk a 23media.hu weboldalon, mire használjuk őket, meddig őrizzük, és milyen jogaid vannak. Az adatkezelés az Európai Unió általános adatvédelmi rendelete (GDPR, (EU) 2016/679 rendelet) és az információs önrendelkezési jogról szóló 2011. évi CXII. törvény (Infotv.) szerint történik.",
  sections: [
    { h: "Az adatkezelő", blocks: [{ rows: companyRows() }] },
    {
      h: "Ingyenes konzultáció kérése",
      blocks: [
        { p: `Ha a ${link("consultation", "konzultációs űrlapon")} jelentkezel, ezeket az adatokat kérjük tőled:` },
        {
          ul: [
            "vezeték- és keresztnév,",
            "e-mail cím,",
            "telefonszám,",
            "pár szóban, hogy mivel foglalkozol,",
            "cégnév és weboldal — ezeket nem kötelező megadni.",
          ],
        },
        {
          rows: [
            [
              "Cél",
              "A jelentkezésed megválaszolása, a 30 perces konzultáció időpontjának egyeztetése és az írásos összefoglaló elküldése.",
            ],
            [
              "Jogalap",
              "GDPR 6. cikk (1) bekezdés b) pont: a te kérésedre, egy esetleges szerződés megkötése előtt teszünk lépéseket.",
            ],
            [
              "Meddig őrizzük",
              "Ha nem jön létre együttműködés, a jelentkezéstől számított 1 évig, utána töröljük. Ha szerződünk, a szerződésre vonatkozó megőrzési szabályok szerint.",
            ],
            [
              "Ha nem adod meg",
              "A kötelező adatok nélkül nem tudunk kapcsolatba lépni veled, ezért az űrlap nem küldhető el.",
            ],
          ],
        },
      ],
    },
    {
      h: "Kapcsolatfelvétel e-mailben",
      blocks: [
        { p: `Ha a ${MAIL} címre írsz, a nevedet, az e-mail címedet és a levélben megadott adatokat kezeljük.` },
        {
          rows: [
            ["Cél", "A megkeresésed megválaszolása."],
            [
              "Jogalap",
              "GDPR 6. cikk (1) bekezdés f) pont: jogos érdekünk, hogy a hozzánk érkező megkereséseket megválaszoljuk; ha a levél együttműködésre irányul, a b) pont.",
            ],
            ["Meddig őrizzük", "A levelezés lezárásától számított 1 évig, kivéve, ha szerződés jön létre."],
          ],
        },
      ],
    },
    {
      h: "Technikai adatok",
      blocks: [
        {
          p: "Amikor megnyitod az oldalt, a tárhelyszolgáltató szervere — mint minden webszerver — automatikusan naplózza a kérés technikai adatait: az IP-címet, a lekérés idejét, a megnyitott oldal címét, a böngésző és az operációs rendszer típusát. Ezeket csak az oldal biztonságos működéséhez és a hibák kivizsgálásához használjuk, nem kapcsoljuk össze más adattal, és nem azonosítunk velük senkit.",
        },
        {
          rows: [
            ["Jogalap", "GDPR 6. cikk (1) bekezdés f) pont: jogos érdekünk az oldal biztonságos, zavartalan működése."],
            ["Meddig őrizzük", "A tárhelyszolgáltató naplózási rendje szerinti ideig."],
          ],
        },
      ],
    },
    {
      h: "Sütik és mérés",
      blocks: [
        {
          p: "Az oldal nem használ sütit (cookie-t), nem futtat látogatottságmérő, remarketing- vagy közösségimédia-követőkódot, és a betűtípusokat is a saját szerveréről tölti be. Ezért nem kérünk sütihozzájárulást.",
        },
      ],
    },
    {
      h: "Kik férnek hozzá az adatokhoz",
      blocks: [
        {
          p: "Az adataidat nem adjuk el, és marketingcélra senkinek nem adjuk át. A jelentkezésekhez csak a 23media azon munkatársai férnek hozzá, akiknek a válaszadáshoz szükségük van rájuk. Az oldal működtetéséhez az alábbi szolgáltatót vesszük igénybe, amely az adatokat kizárólag a mi megbízásunkból kezeli (adatfeldolgozó):",
        },
        { rows: [hostingRow("Tárhely és e-mail")] },
      ],
    },
    {
      h: "Jogaid",
      blocks: [
        {
          ul: [
            "Hozzáférés: megkérdezheted, milyen adataidat kezeljük (GDPR 15. cikk).",
            "Helyesbítés: kérheted a pontatlan adatok javítását (16. cikk).",
            "Törlés: kérheted az adataid törlését (17. cikk).",
            "Korlátozás: kérheted, hogy az adataidat ideiglenesen ne használjuk (18. cikk).",
            "Adathordozhatóság: géppel olvasható formában megkaphatod az általad megadott adatokat (20. cikk).",
            "Tiltakozás: tiltakozhatsz a jogos érdeken alapuló adatkezelés ellen (21. cikk).",
          ],
        },
        { p: `A kérésedet a ${MAIL} címre küldd — legkésőbb egy hónapon belül válaszolunk.` },
      ],
    },
    {
      h: "Jogorvoslat",
      blocks: [
        {
          p: "Ha úgy érzed, megsértettük az adatvédelmi jogaidat, kérjük, először írj nekünk, és igyekszünk gyorsan rendezni. Panaszt tehetsz a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH), és bírósághoz is fordulhatsz; a pert a lakóhelyed szerinti törvényszék előtt is megindíthatod.",
        },
        {
          rows: [
            ["NAIH", "1055 Budapest, Falk Miksa utca 9–11."],
            ["Postacím", "1363 Budapest, Pf. 9."],
            ["Telefon", "+36 1 391 1400"],
            ["E-mail", "[ugyfelszolgalat@naih.hu](mailto:ugyfelszolgalat@naih.hu)"],
            ["Weboldal", "[naih.hu](https://naih.hu)"],
          ],
        },
      ],
    },
    {
      h: "Adatbiztonság",
      blocks: [
        {
          p: "Az oldal csak titkosított (HTTPS) kapcsolaton érhető el, az űrlap adatai is így jutnak el hozzánk.",
        },
      ],
    },
    {
      h: "Módosítás",
      blocks: [
        {
          p: `Ha az adatkezelés változik, frissítjük ezt a tájékoztatót; az aktuális változat mindig ezen az oldalon olvasható. Hatályos: ${LEGAL_EFFECTIVE}`,
        },
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: PAGES.terms.title,
  description:
    "A 23media.hu weboldal használatának feltételei: tartalom, ingyenes konzultáció, szellemi tulajdon, AI-felhasználás.",
  intro:
    "Ezek a feltételek a 23media.hu weboldal használatára vonatkoznak. Az oldal böngészésével elfogadod őket.",
  sections: [
    {
      h: "Az üzemeltető",
      blocks: [{ p: `A weboldalt a 23media üzemelteti; a szolgáltató adatai az ${link("imprint", "Impresszumban")} olvashatók.` }],
    },
    {
      h: "Az oldal tartalma",
      blocks: [
        {
          p: "Az oldal a 23media szolgáltatásait mutatja be. A tartalom tájékoztató jellegű, és nem minősül ajánlattételnek: az együttműködés feltételeiről, a díjakról és a határidőkről minden esetben egyedi, írásos megállapodás rendelkezik.",
        },
      ],
    },
    {
      h: "Ingyenes konzultáció",
      blocks: [
        {
          p: `A konzultáció kérése és a 30 perces hívás ingyenes, és nem jár kötelezettséggel: nem jön létre vele szerződés. Az írásos összefoglaló akkor is a tiéd, ha végül nem velünk dolgozol. A megadott adataid kezeléséről az ${link("privacy")} szól.`,
        },
      ],
    },
    {
      h: "Szellemi tulajdon",
      blocks: [
        {
          p: "Az oldal szövegei, a 23media név és logó, az arculati elemek, a képek, a videók és a forráskód szerzői jogi védelem alatt állnak (1999. évi LXXVI. törvény). Előzetes írásbeli engedélyünk nélkül nem másolhatók, nem terjeszthetők, és kereskedelmi célra nem használhatók fel. Ügyfeleink nevei és logói az ő tulajdonukat képezik.",
        },
      ],
    },
    {
      h: "Hivatkozás és AI-felhasználás",
      blocks: [
        {
          p: `Az oldal tartalmára rövid idézettel, a forrás (23media.hu) megjelölésével szabadon hivatkozhatsz. Keresőmotorok és AI-asszisztensek indexelhetik a tartalmat, és felhasználhatják a válaszaikban, AI-modellek tanítására azonban nem engedélyezzük a felhasználását. Ezt a robots.txt Content-Signal sora is rögzíti: ${CONTENT_SIGNAL}.`,
        },
      ],
    },
    {
      h: "Felelősség",
      blocks: [
        {
          p: "Igyekszünk, hogy az oldalon minden információ pontos és naprakész legyen, de az esetleges hibákért, elírásokért és az oldal átmeneti elérhetetlenségéért nem vállalunk felelősséget. Az oldalon más weboldalakra mutató linkek is vannak (például ügyfeleink oldalai); ezek tartalmáért az üzemeltetőik felelnek.",
        },
      ],
    },
    {
      h: "Irányadó jog",
      blocks: [{ p: `A feltételekre a magyar jog irányadó. Ha kérdésed van, írj a ${MAIL} címre.` }],
    },
    {
      h: "Hatály",
      blocks: [
        {
          p: `Hatályos: ${LEGAL_EFFECTIVE} A feltételeket időnként frissíthetjük; az aktuális változat mindig ezen az oldalon olvasható.`,
        },
      ],
    },
  ],
};

export const IMPRINT: LegalDoc = {
  title: PAGES.imprint.title,
  description: "A 23media.hu weboldal üzemeltetőjének és tárhelyszolgáltatójának adatai.",
  intro:
    "Az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény (Ekertv.) 4. §-a szerinti adatok.",
  sections: [
    { h: "Szolgáltató", blocks: [{ rows: companyRows() }] },
    {
      h: "Tárhelyszolgáltató",
      blocks: [
        {
          rows: [
            ["Név", HOSTING_PROVIDER.name],
            ["Cím", HOSTING_PROVIDER.address],
            ["Weboldal", `[hostinger.com](${HOSTING_PROVIDER.url})`],
          ],
        },
      ],
    },
    {
      h: "Kapcsolat",
      blocks: [
        {
          p: `Kérdés, panasz vagy hivatalos megkeresés esetén írj a ${MAIL} címre. Az adatkezelésről az ${link("privacy")}, az oldal használatáról a ${link("terms")} szól.`,
        },
      ],
    },
  ],
};

export const LEGAL_DOCS = { privacy: PRIVACY, terms: TERMS, imprint: IMPRINT } as const;
