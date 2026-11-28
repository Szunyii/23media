/**
 * The legal pages as data, so the HTML page (components/LegalPage.tsx) and the
 * Markdown version agents fetch (lib/markdown.ts) are rendered from one text.
 *
 * The Adatkezelési tájékoztató, the ÁSZF and the Cookie szabályzat are the
 * client's lawyer-drafted documents (23_Media_*_2026-10-05.docx), taken over
 * word for word — don't reword them here; when a new version arrives, replace
 * the text. Presentation only: the section numbers come from the order (01, 02
 * … on the page, "1." in Markdown), web and e-mail addresses and mentions of
 * the other two documents are links, `**…**` is the documents' own bold, and
 * the company table that opens the privacy notice and the ÁSZF is built from
 * COMPANY (site.ts) with the documents' rows.
 *
 * One deliberate gap: section 5 of the Cookie szabályzat is a template table in
 * the document ("[CMP preferencia süti] … [kitöltendő]") for the cookies the
 * site actually sets. It sets none — no Set-Cookie, no local or session
 * storage, no tags or pixels (checked 2026-11-28) — so one sentence says so
 * instead. Analytics, a pixel or anything else that stores data in the browser
 * means filling that table and adding the consent banner and the
 * "Sütibeállítások" link the lawyer's checklist asks for.
 *
 * And one change asked for on 2026-11-28: wherever the documents give the
 * managing director's private e-mail address (both company tables, privacy
 * notice 18., cookie policy 8.), the site gives the company mailbox —
 * COMPANY.email. Keep that when a new version of the documents comes in.
 *
 * The Impresszum is ours: the company data (Ekertv. 4. §) and the hosting
 * provider.
 */
import { COMPANY, HOSTING_PROVIDER, PAGES, SITE_URL, type PageKey } from "./site";

export type Block =
  | { p: string }
  | { ul: string[] }
  /** two columns: label, value */
  | { rows: [string, string][] }
  /** a table with a header row — on the page each row is set as its own label/value card */
  | { table: { head: string[]; rows: string[][] } };
export type LegalSection = { h: string; blocks: Block[] };
export type LegalDoc = {
  title: string;
  /** meta description */
  description: string;
  /** the line under the title */
  intro: string;
  /** shown as "Hatályos: …" — the document's own wording */
  effective?: string;
  sections: LegalSection[];
};

const MAIL = `[${COMPANY.email}](mailto:${COMPANY.email})`;
const PHONE = `[${COMPANY.phone}](tel:${COMPANY.phone.replace(/\s/g, "")})`;
const SITE = `[${SITE_URL}](${SITE_URL})`;
const link = (key: PageKey, text: string = PAGES[key].title) => `[${text}](${PAGES[key].path})`;

/** The company data in the documents' order and wording; the Impresszum adds the registry court. */
function companyRows({ registry = false } = {}): [string, string][] {
  return [
    ["Cégnév", COMPANY.legalName],
    ["Rövidített név", COMPANY.shortName],
    ["Székhely", COMPANY.seat],
    ["Cégjegyzékszám", COMPANY.registrationNumber],
    ...(registry ? [["Nyilvántartó cégbíróság", COMPANY.registry] as [string, string]] : []),
    ["Adószám", COMPANY.taxNumber],
    ["Képviselő", COMPANY.representative],
    ["E-mail", MAIL],
    ["Telefon", PHONE],
    ["Weboldal", SITE],
  ];
}

const companyTable = (): Block => ({ rows: companyRows() });

/** 23_Media_Adatkezelesi_Tajekoztato_2026-10-05.docx */
export const PRIVACY: LegalDoc = {
  title: "Adatkezelési tájékoztató",
  description:
    "A 23 Media Kft. adatkezelési tájékoztatója: milyen személyes adatokat, milyen célból és jogalapon, meddig kezel, és milyen jogok illetik meg az érintetteket.",
  intro: "23 Media Kft. – 23media.hu",
  effective: "2026. október 5. napjától",
  sections: [
    {
      h: "Adatkezelő",
      blocks: [
        companyTable(),
        {
          p: "Jelen tájékoztató a 23 Media Kft. saját adatkezeléseit ismerteti. Amennyiben a Társaság valamely ügyfele nevében, annak utasításai alapján kezel személyes adatokat marketingtevékenység során, abban a jogviszonyban a 23 Media Kft. adatfeldolgozóként járhat el; az érintettek tájékoztatásáért ilyen esetben elsődlegesen az ügyfél mint adatkezelő felel.",
        },
      ],
    },
    {
      h: "Alapelvek és jogszabályi háttér",
      blocks: [
        {
          p: "A Társaság a személyes adatokat jogszerűen, tisztességesen, átlátható módon, meghatározott célból és a szükséges mértékben kezeli. Az adatkezelésekre különösen az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR), a 2011. évi CXII. törvény (Infotv.), az elektronikus kereskedelmi szolgáltatásokra vonatkozó 2001. évi CVIII. törvény, valamint közvetlen üzletszerzés esetén a 2008. évi XLVIII. törvény rendelkezései irányadóak.",
        },
      ],
    },
    {
      h: "Az adatkezelések összefoglalása",
      blocks: [
        {
          table: {
            head: ["Adatkezelési cél", "Jellemző adatok", "Jogalap", "Megőrzés"],
            rows: [
              [
                "Ingyenes konzultáció megszervezése",
                "név, e-mail, telefon, cég/márka, igény, időpont, üzenet",
                "GDPR 6. cikk (1) b), illetve B2B kapcsolattartónál 6. cikk (1) f)",
                "konzultáció lezárásától 3 hónap; további egyeztetés esetén az ajánlatkérés szabályai",
              ],
              [
                "Ajánlatkérés, szerződéskötést megelőző egyeztetés",
                "név, elérhetőség, cég, igény és kommunikáció tartalma",
                "GDPR 6. cikk (1) b), illetve 6. cikk (1) f)",
                "utolsó érdemi kapcsolatfelvételtől 6 hónap, ha szerződés nem jön létre",
              ],
              [
                "Szerződés teljesítése",
                "kapcsolattartási és a teljesítéshez szükséges adatok",
                "GDPR 6. cikk (1) b), B2B kapcsolattartóknál 6. cikk (1) f)",
                "jogviszony alatt, majd jogi igényekhez főszabály szerint 5 év",
              ],
              [
                "Számlázás, könyvelés",
                "számlázási és bizonylati adatok",
                "GDPR 6. cikk (1) c)",
                "számviteli bizonylatként 8 év",
              ],
              [
                "Hírlevél / elektronikus direkt marketing",
                "név, e-mail, hozzájárulási adatok",
                "GDPR 6. cikk (1) a), Grt. szerinti hozzájárulás",
                "visszavonásig",
              ],
              [
                "Ügyfélvélemény, referencia közzététele",
                "név, beosztás, cég, vélemény, képmás/videó, ha engedélyezett",
                "GDPR 6. cikk (1) a); képmásnál Ptk. 2:48. § szerinti hozzájárulás",
                "hozzájárulás visszavonásáig vagy a közzététel megszüntetéséig",
              ],
              [
                "Panaszkezelés",
                "panaszos neve, elérhetősége, panasz tartalma, bizonyítékok",
                "GDPR 6. cikk (1) c)",
                "fogyasztói panasz esetén 3 év",
              ],
              [
                "Weboldal biztonságos működtetése",
                "IP-cím, naplóadatok, technikai azonosítók",
                "GDPR 6. cikk (1) f), szükséges sütiknél a vonatkozó elektronikus hírközlési szabályok",
                "technikai célhoz szükséges ideig",
              ],
              [
                "Statisztikai/marketing sütik",
                "online azonosítók, böngészési események a tényleges beállítás szerint",
                "GDPR 6. cikk (1) a)",
                "sütinként meghatározott ideig / hozzájárulás visszavonásáig",
              ],
            ],
          },
        },
      ],
    },
    {
      h: "Ingyenes konzultációra jelentkezés",
      blocks: [
        {
          p: "4.1. Cél. Az adatkezelés célja az ingyenes első konzultáció időpontjának megszervezése, a jelentkező igényének előzetes megismerése, a konzultáció lebonyolítása és annak eldöntése, hogy indokolt-e ajánlat vagy további szakmai egyeztetés.",
        },
        {
          p: "4.2. Érintettek. A konzultációra jelentkező természetes személyek, továbbá gazdasági társaság vagy más szervezet nevében eljáró kapcsolattartók.",
        },
        {
          p: "4.3. Kezelt adatok. A jelentkezési felületen ténylegesen kért adatok, különösen: név, e-mail-cím, telefonszám, cég/márka neve, weboldal vagy közösségimédia-elérhetőség, igényelt szolgáltatás, preferált időpont, valamint az üzenetben önkéntesen közölt adatok.",
        },
        {
          p: "4.4. Jogalap. Ha az érintett saját nevében kíván lehetséges szerződést kötni, a GDPR 6. cikk (1) bekezdés b) pontja szerinti, szerződéskötést megelőző lépések megtétele. Ha az érintett valamely vállalkozás képviseletében vagy kapcsolattartójaként jár el, a GDPR 6. cikk (1) bekezdés f) pontja szerinti jogos érdek: a felek közötti üzleti kapcsolatfelvétel és kommunikáció. A konzultációra jelentkezés nem jelent hírlevél- vagy reklámcélú hozzájárulást.",
        },
        {
          p: "4.5. Megőrzés. Ha nem indul további ajánlati vagy szerződéses egyeztetés, az adatokat a konzultáció lezárásától számított 3 hónap elteltével töröljük. Ha további egyeztetés indul, az adatokat az ajánlatkérésre vagy a szerződéses jogviszonyra vonatkozó szabályok szerint kezeljük. Jogi igény felmerülése esetén az ahhoz szükséges adatok az igény érvényesíthetőségének idejéig megőrizhetők.",
        },
      ],
    },
    {
      h: "Ajánlatkérés és szerződéskötést megelőző kommunikáció",
      blocks: [
        {
          p: "Az adatkezelés célja a megkeresés megválaszolása, az igények pontosítása, ajánlat készítése és a szerződés előkészítése. Kezelt adatok lehetnek különösen a név, munkakör, cég, telefon, e-mail, az igény leírása, a kommunikáció tartalma és a szolgáltatás kialakításához szükséges további adatok. A jogalap saját nevében eljáró természetes személynél a GDPR 6. cikk (1) b), szervezeti kapcsolattartónál a GDPR 6. cikk (1) f) pontja. Szerződés hiányában az adatokat főszabály szerint az utolsó érdemi egyeztetéstől 6 hónapig őrizzük.",
        },
      ],
    },
    {
      h: "A szolgáltatási szerződés teljesítése és kapcsolattartás",
      blocks: [
        {
          p: "A szerződés teljesítéséhez a Társaság kezeli a természetes személy ügyfél vagy a szervezeti ügyfél kapcsolattartóinak azonosító és kapcsolattartási adatait, a briefekben és jóváhagyásokban szereplő információkat, valamint a teljesítés dokumentálásához szükséges adatokat. Saját nevében szerződő természetes személynél a jogalap GDPR 6. cikk (1) b), szervezeti kapcsolattartóknál GDPR 6. cikk (1) f). A szerződés megszűnését követően a szerződéses dokumentáció jogi igények előterjesztése, érvényesítése vagy védelme érdekében főszabály szerint 5 évig őrizhető meg.",
        },
        {
          p: "A Megrendelő által marketingcélú teljesítéshez átadott, harmadik személyekre vonatkozó személyes adatok esetén a 23 Media Kft. nem minden esetben önálló adatkezelő. Ha az adatkezelés célját és lényeges eszközeit a Megrendelő határozza meg, a 23 Media Kft. adatfeldolgozóként jár el a külön adatfeldolgozási feltételek szerint.",
        },
      ],
    },
    {
      h: "Számlázás és könyvelés",
      blocks: [
        {
          p: "A számlázás és könyvelés céljából kezelt adatok köre különösen a természetes személy vagy egyéni vállalkozó neve, címe, adóazonosító/adószáma, továbbá a számlával kapcsolatos adatok. Jogalap a GDPR 6. cikk (1) c) pontja, valamint a számviteli és adójogi kötelezettségek teljesítése. A számviteli bizonylatokat és az azok alapjául szolgáló adatokat a számvitelről szóló 2000. évi C. törvény szerinti 8 éves megőrzési idő alatt kezeljük.",
        },
      ],
    },
    {
      h: "Hírlevél és elektronikus direkt marketing",
      blocks: [
        {
          p: "A Társaság marketingcélú e-mailt természetes személy részére kizárólag megfelelő, előzetes, kifejezett és bizonyítható hozzájárulás alapján küld. A hozzájárulás célja konkrétan a 23 Media Kft. saját szolgáltatásaira, szakmai tartalmaira, eseményeire és ajánlataira vonatkozó elektronikus marketingüzenetek küldése. A hozzájárulás nem feltétele a szolgáltatás vagy az ingyenes konzultáció igénybevételének, és bármikor, a megadásával azonosan egyszerű módon visszavonható.",
        },
        {
          p: "A leiratkozás után marketingüzenetet nem küldünk. A hozzájárulás megadásának és visszavonásának bizonyításához szükséges minimális naplóadatokat a Társaság jogos érdeke alapján, jogi igényekhez szükséges ideig megőrizheti.",
        },
      ],
    },
    {
      h: "Szolgáltatást igénybe vevői vélemények és referenciák",
      blocks: [
        {
          p: "9.1. A 23 Media Kft. a weboldalon ügyfélvéleményt, referenciát, esettanulmányt, az érintett nevét, beosztását, az ügyfél vállalkozásának nevét, továbbá fényképet vagy videót kizárólag a szükséges jogosultságok birtokában jelenít meg.",
        },
        {
          p: "9.2. Ha a közzététel azonosítható természetes személyre vonatkozó adatot tartalmaz, az adatkezelés jogalapja a GDPR 6. cikk (1) a) pontja szerinti hozzájárulás. Képmás vagy hangfelvétel közzétételéhez a Ptk. 2:48. §-a szerinti hozzájárulás is szükséges. A hozzájárulás külön nyilatkozatban vagy egyéb bizonyítható módon történik, és nem feltétele a 23 Media Kft. szolgáltatásai igénybevételének.",
        },
        {
          p: "9.3. A hozzájárulásnak ki kell terjednie a ténylegesen használni kívánt adatkörre és csatornára. A weboldali közzétételhez adott hozzájárulás nem jelenti automatikusan azt, hogy az anyag fizetett hirdetésben vagy más marketingcsatornán is felhasználható.",
        },
        {
          p: "9.4. Az érintett hozzájárulását bármikor visszavonhatja. A visszavonást követően a Társaság a saját ellenőrzése alatt álló online felületekről indokolatlan késedelem nélkül eltávolítja a személyes adatot tartalmazó véleményt/referenciát. A visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét.",
        },
        {
          p: "9.5. Ha a referencia kizárólag jogi személy cégnevét, logóját vagy üzleti eredményét tartalmazza, a GDPR személyes adatokra vonatkozó rendelkezései csak akkor alkalmazandók, ha az információ természetes személyt is azonosít vagy azonosíthatóvá tesz. A céglogó és más védett megjelölés használatához ettől függetlenül megfelelő jogosulti engedély szükséges.",
        },
      ],
    },
    {
      h: "Panaszkezelés",
      blocks: [
        {
          p: "Fogyasztói panasz kezelése során a Társaság a panaszos nevét, lakcímét/elérhetőségét, a panasz tartalmát, a benyújtott iratokat és a válaszadáshoz szükséges adatokat kezeli. A jogalap GDPR 6. cikk (1) c), a fogyasztóvédelemről szóló 1997. évi CLV. törvény alapján. A panaszt, jegyzőkönyvet és a válasz másolatát a Társaság három évig őrzi meg.",
        },
      ],
    },
    {
      h: "Weboldal, naplóadatok és sütik",
      blocks: [
        {
          p: "A weboldal biztonságos és rendeltetésszerű működtetése során technikai naplóadatok (például IP-cím, időpont, kért erőforrás, böngészőre vonatkozó technikai információ) kezelhetők a rendszerek biztonsága, hibakeresés és visszaélések megelőzése céljából. A jogalap a GDPR 6. cikk (1) f) pontja szerinti jogos érdek.",
        },
        {
          p: `Statisztikai, marketing- és egyéb nem feltétlenül szükséges sütik vagy hasonló technológiák csak az érintett előzetes hozzájárulása után aktiválhatók. A részletes kategóriákat, szolgáltatókat, sütineveket és megőrzési időket a ${link("cookies", "Cookie Szabályzat")} és a weboldali sütibeállítások felülete tartalmazza.`,
        },
      ],
    },
    {
      h: "Közösségi média",
      blocks: [
        {
          p: "Ha a Társaság közösségimédia-oldalakat használ, az ott történő kapcsolatfelvétel és interakció kapcsán a Társaság a felhasználó által közzétett vagy részére megküldött adatokat a kommunikáció céljából kezeli. A platformszolgáltató a saját adatkezelési feltételei szerint önálló adatkezelőként vagy egyes statisztikai funkciók esetén közös adatkezelőként is eljárhat. A felhasználó a platform használata előtt annak adatvédelmi tájékoztatóját is köteles megismerni.",
        },
      ],
    },
    {
      h: "Adatfeldolgozók, címzettek és adattovábbítás",
      blocks: [
        {
          p: "A Társaság a működése során különösen tárhely-/szerver-, e-mail-, felhő-, könyvelési, számlázási, CRM-/időpontfoglaló, hírlevélküldő, webanalitikai, hirdetési és informatikai szolgáltatót vehet igénybe. Az egyes szolgáltatók tényleges szerepét az adott adatkezelés jellege határozza meg; nem minden külső platform minősül a Társaság adatfeldolgozójának.",
        },
        {
          p: "Ha személyes adatok az Európai Gazdasági Térségen kívüli harmadik országba kerülnek, a Társaság csak a GDPR V. fejezete szerinti jogszerű adattovábbítási mechanizmus alkalmazásával jár el, így különösen megfelelőségi határozat vagy megfelelő garanciák alapján.",
        },
      ],
    },
    {
      h: "Automatizált döntéshozatal és profilalkotás",
      blocks: [
        {
          p: `A Társaság nem hoz kizárólag automatizált adatkezelésen alapuló olyan döntést, amely az érintettre nézve joghatással jár vagy őt hasonlóképpen jelentős mértékben érinti. Amennyiben az érintett hozzájárul marketing/statisztikai technológiákhoz, egyes külső platformok online viselkedési profilokat hozhatnak létre saját szolgáltatási feltételeik szerint; ennek részleteit a ${link("cookies", "Cookie Szabályzat")} tartalmazza.`,
        },
      ],
    },
    {
      h: "Az érintett jogai",
      blocks: [
        {
          ul: [
            "tájékoztatást és hozzáférést kérhet a róla kezelt személyes adatokhoz;",
            "kérheti a pontatlan adatok helyesbítését;",
            "a jogszabályi feltételek fennállása esetén kérheti az adatok törlését vagy kezelésük korlátozását;",
            "a GDPR 20. cikkének feltételei mellett élhet az adathordozhatósághoz való joggal;",
            "jogos érdeken alapuló adatkezelés ellen saját helyzetével kapcsolatos okból tiltakozhat;",
            "hozzájárulását bármikor visszavonhatja, anélkül hogy ez a korábbi adatkezelés jogszerűségét érintené;",
            "panaszt tehet a Nemzeti Adatvédelmi és Információszabadság Hatóságnál, és bírósághoz fordulhat.",
          ],
        },
        {
          p: "A Társaság az érintetti kérelmet indokolatlan késedelem nélkül, de főszabály szerint a kérelem beérkezésétől számított egy hónapon belül megválaszolja. Szükség esetén – a GDPR feltételei mellett – e határidő további két hónappal meghosszabbítható, amelyről az érintettet az egy hónapos határidőn belül tájékoztatjuk.",
        },
      ],
    },
    {
      h: "Jogorvoslat",
      blocks: [
        {
          p: "Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH): 1055 Budapest, Falk Miksa utca 9-11.; levelezési cím: 1363 Budapest, Pf. 9.; honlap: [https://www.naih.hu/](https://www.naih.hu/). Az érintett a GDPR 79. cikke alapján bírósági jogorvoslatot is igénybe vehet.",
        },
      ],
    },
    {
      h: "Adatbiztonság",
      blocks: [
        {
          p: "A Társaság az adatkezelés kockázatával arányos technikai és szervezési intézkedéseket alkalmaz, ideértve a hozzáférések korlátozását, jogosultságkezelést, jelszavas védelmet, frissítéseket, biztonsági mentést, incidenskezelést, titoktartási kötelezettséget és a szükséges adatfeldolgozói szerződéseket.",
        },
      ],
    },
    {
      h: "Kapcsolat és módosítás",
      blocks: [
        {
          p: `Adatvédelmi kérdés vagy érintetti kérelem a ${MAIL} e-mail-címre küldhető. A Társaság a tájékoztatót jogszabály-, szolgáltatás- vagy technológiaváltozás esetén módosíthatja; a mindenkor hatályos változat a ${SITE} weboldalon érhető el.`,
        },
      ],
    },
  ],
};

/** 23_Media_ASZF_2026-10-05.docx */
export const TERMS: LegalDoc = {
  title: "Általános szerződési feltételek",
  description:
    "A 23 Media Kft. általános szerződési feltételei: ingyenes konzultáció, a szerződés létrejötte, díjazás, szellemi tulajdon, felelősség, panaszkezelés.",
  intro: "23 Media Kft. – marketing- és kommunikációs szolgáltatások",
  effective: "2026. október 5. napjától",
  sections: [
    {
      h: "A Szolgáltató és az ÁSZF hatálya",
      blocks: [
        companyTable(),
        {
          p: "1.1. Jelen általános szerződési feltételek (a továbbiakban: „**ÁSZF**”) a 23 Media Kft. által nyújtott marketing-, reklámügynöki, kommunikációs, PR-, grafikai, tartalom-előállítási, kampánykezelési, üzletviteli tanácsadási, informatikai és az egyedi szerződésben meghatározott kapcsolódó szolgáltatásokra alkalmazandók.",
        },
        {
          p: "1.2. A 23media.hu weboldal nem webshop: a Weboldalon megjelenő szolgáltatásismertetés, referencia, árindikatív információ vagy konzultációs lehetőség önmagában nem minősül ajánlatnak, és a Weboldal használatával fizetős szolgáltatási szerződés nem jön létre.",
        },
        {
          p: "1.3. A konkrét szolgáltatás tartalmát, terjedelmét, díját, teljesítési ütemezését és egyedi feltételeit a Felek között létrejövő egyedi megbízási/szolgáltatási szerződés, ajánlat, megrendelő vagy más egyedi megállapodás (a továbbiakban együtt: „**Egyedi Szerződés**”) határozza meg.",
        },
        {
          p: "1.4. Az ÁSZF akkor válik a Felek szerződésének részévé, ha annak tartalmát a Megrendelő a szerződéskötést megelőzően megismerhette, és alkalmazását elfogadta. Az Egyedi Szerződés és az ÁSZF eltérése esetén az Egyedi Szerződés rendelkezései irányadóak. A jogszabálytól vagy a szokásos szerződési gyakorlattól lényegesen eltérő, illetve a Felek között korábban alkalmazott kikötéstől eltérő általános feltétel csak akkor válik a szerződés részévé, ha azt a Megrendelő külön is elfogadta.",
        },
      ],
    },
    {
      h: "Ingyenes konzultáció",
      blocks: [
        {
          p: "2.1. A Weboldalon meghirdetett ingyenes konzultáció célja a Megrendelő vagy leendő Megrendelő igényeinek előzetes felmérése, a lehetséges együttműködési irányok áttekintése és szükség esetén ajánlat előkészítése.",
        },
        {
          p: "2.2. A konzultáció díjmentes és – eltérő kifejezett megállapodás hiányában – egyik Felet sem kötelezi további szerződés megkötésére. A konzultáció során közölt általános szakmai észrevételek nem minősülnek teljes körű kampánytervnek, auditnak vagy eredménygaranciának.",
        },
        {
          p: `2.3. A konzultációra történő jelentkezéshez kapcsolódó személyesadat-kezelésre a Szolgáltató mindenkor hatályos ${link("privacy", "Adatkezelési Tájékoztatója")} irányadó.`,
        },
      ],
    },
    {
      h: "A szerződés létrejötte és a teljesítés keretei",
      blocks: [
        {
          p: "3.1. A Szolgáltató a szolgáltatást az Egyedi Szerződésben rögzített tartalom szerint nyújtja. Az Egyedi Szerződés létrejöhet írásban, elektronikus okiratban, e-mailben visszaigazolt ajánlat elfogadásával vagy más, a Felek által kifejezetten elfogadott módon.",
        },
        {
          p: "3.2. A Megrendelő köteles a teljesítéshez szükséges briefet, információt, hozzáférést, jóváhagyást, arculati anyagokat és egyéb tartalmakat megfelelő időben rendelkezésre bocsátani. A Megrendelő késedelme vagy hiányos adatszolgáltatása a Szolgáltató teljesítési határidejét a késedelem, illetve annak észszerű következményeinek időtartamával meghosszabbíthatja.",
        },
        {
          p: "3.3. A Megrendelő szavatolja, hogy az általa átadott adatok, tartalmak, képek, videók, védjegyek, logók, adatbázisok és egyéb anyagok felhasználásához megfelelő jogosultsággal rendelkezik, és azok Szolgáltató általi, a szerződés teljesítéséhez szükséges felhasználása harmadik személy jogát nem sérti.",
        },
        {
          p: "3.4. A Szolgáltató jogosult a teljesítéshez közreműködőt, alvállalkozót igénybe venni. Személyes adatok adatfeldolgozásával járó közreműködő igénybevételére az adatfeldolgozási feltételek irányadóak.",
        },
      ],
    },
    {
      h: "Marketingplatformok, eredmények és jóváhagyások",
      blocks: [
        {
          p: "4.1. A Megrendelő tudomásul veszi, hogy a kereső-, közösségimédia-, hirdetési és más online platformok működése, algoritmusa, jóváhagyási rendszere, technikai elérhetősége és szabályzata a Szolgáltató ellenőrzési körén kívül állhat.",
        },
        {
          p: "4.2. A Szolgáltató szakmailag gondos teljesítésre vállal kötelezettséget, de – kivéve, ha az Egyedi Szerződés kifejezetten eredménykötelezettséget ír elő – nem garantál meghatározott forgalmat, elérést, konverziót, bevételt, rangsorolást, követőszámot, hirdetési jóváhagyást vagy más üzleti eredményt.",
        },
        {
          p: "4.3. Ha a kampány vagy tartalom közzététele a Megrendelő előzetes jóváhagyásához kötött, a Szolgáltató a jóváhagyott tartalom alapján teljesít. A jóváhagyást követő, a Megrendelő által kért módosítás többletfeladatnak minősülhet.",
        },
      ],
    },
    {
      h: "Díjazás, költségek és számlázás",
      blocks: [
        {
          p: "5.1. A szolgáltatási díjat, fizetési ütemezést és esedékességet az Egyedi Szerződés tartalmazza. Eltérő rendelkezés hiányában a díjak nettó összegben értendők és az általános forgalmi adóval növelendők.",
        },
        {
          p: "5.2. A média-, hirdetési-, licenc-, stock-, nyomdai, tárhely-, szoftver- és más harmadik fél részére fizetendő költség csak akkor része a szolgáltatási díjnak, ha azt az Egyedi Szerződés kifejezetten tartalmazza.",
        },
        {
          p: "5.3. Fizetési késedelem esetén a Szolgáltató a Ptk. szerinti késedelmi kamatra, vállalkozások közötti jogviszonyban pedig – ha annak feltételei fennállnak – a behajtási költségátalányra is jogosult. A Szolgáltató a lejárt tartozás rendezéséig, előzetes felszólítást követően, az arányosság követelményét figyelembe véve felfüggesztheti a további teljesítést.",
        },
      ],
    },
    {
      h: "Szellemi tulajdon és referenciahasználat",
      blocks: [
        {
          p: "6.1. A Szolgáltató már meglévő módszertana, sablonjai, know-how-ja, eljárásai, szoftveres megoldásai és általános célú kreatív elemei a Szolgáltató tulajdonában maradnak.",
        },
        {
          p: "6.2. Az Egyedi Szerződés teljesítése során kifejezetten a Megrendelő részére létrehozott szerzői művek felhasználási jogának terjedelmét az Egyedi Szerződés határozza meg. Eltérő rendelkezés hiányában a Megrendelő a teljes díj megfizetésével a szolgáltatás rendeltetésszerű üzleti felhasználásához szükséges, időben és területileg korlátlan, nem kizárólagos felhasználási jogot szerez.",
        },
        {
          p: `6.3. A Megrendelő neve, logója, kampánya, eredménye, véleménye vagy képviselőjének képmása referenciaként kizárólag az érintett jogosult(ak) előzetes, megfelelő tartalmú engedélye/hozzájárulása alapján tehető közzé. A személyes adatot tartalmazó ügyfélvélemény közzétételére az ${link("privacy", "Adatkezelési Tájékoztató")} és a külön hozzájáruló nyilatkozat rendelkezései irányadóak.`,
        },
      ],
    },
    {
      h: "Titoktartás és adatvédelem",
      blocks: [
        {
          p: "7.1. A Felek kötelesek a teljesítés során tudomásukra jutott, nem nyilvános üzleti, pénzügyi, műszaki és szervezési információkat bizalmasan kezelni, és azokat kizárólag a szerződés teljesítéséhez szükséges mértékben felhasználni.",
        },
        {
          p: `7.2. A Szolgáltató saját adatkezeléseire a 23 Media Kft. ${link("privacy", "Adatkezelési Tájékoztatója")} irányadó. Ha a Szolgáltató a Megrendelő utasításai alapján, a Megrendelő nevében személyes adatokat kezel, a Felek jogviszonyára a Szolgáltató Adatfeldolgozási Általános Szerződési Feltételei, illetve az Egyedi Szerződés adatvédelmi rendelkezései is alkalmazandók.`,
        },
      ],
    },
    {
      h: "Felelősség",
      blocks: [
        {
          p: "8.1. A Felek a szerződésszegéssel okozott károkért a Ptk. szabályai szerint felelnek. Nem terheli a Szolgáltatót felelősség olyan késedelemért vagy eredményromlásért, amely a Megrendelő mulasztására, valótlan/hiányos adatszolgáltatására, harmadik fél platformjának működésére, előre nem látható technikai hibára vagy a Szolgáltató ellenőrzési körén kívül eső más körülményre vezethető vissza, feltéve, hogy a Szolgáltató az adott helyzetben általában elvárható módon járt el.",
        },
        {
          p: "8.2. Semmis minden olyan felelősségkizárás vagy -korlátozás, amelyet jogszabály nem enged meg, így különösen a szándékosan okozott, valamint az emberi életet, testi épséget vagy egészséget megkárosító szerződésszegésért való felelősség kizárása vagy korlátozása.",
        },
      ],
    },
    {
      h: "A szerződés időtartama és megszűnése",
      blocks: [
        {
          p: "9.1. A jogviszony időtartamát és megszüntetésének szabályait elsődlegesen az Egyedi Szerződés rendezi. Ha határozatlan idejű együttműködés esetén az Egyedi Szerződés nem állapít meg felmondási időt, bármely Fél 30 napos felmondási idővel, írásban felmondhatja a szerződést.",
        },
        {
          p: "9.2. Súlyos szerződésszegés esetén a másik Fél – megfelelő póthatáridő eredménytelen elteltét követően, ha a jogsértés orvosolható – azonnali hatállyal megszüntetheti a szerződést. Nem szükséges póthatáridő, ha annak kitűzése a körülmények alapján értelmetlen lenne.",
        },
      ],
    },
    {
      h: "Fogyasztóként eljáró Megrendelőkre vonatkozó eltérések",
      blocks: [
        {
          p: "10.1. A Szolgáltató szolgáltatásai elsődlegesen üzleti célú marketingtevékenységhez kapcsolódnak. Ha azonban a Megrendelő a Ptk. szerint fogyasztónak minősül, a kötelező fogyasztóvédelmi szabályok az ÁSZF eltérő rendelkezése ellenére alkalmazandók.",
        },
        {
          p: "10.2. Távollévők között vagy üzlethelyiségen kívül kötött, szolgáltatás nyújtására irányuló fogyasztói szerződés esetén a fogyasztót a szerződés megkötésétől számított 14 napon belül indokolás nélküli elállási, illetve a szolgáltatás megkezdését követően felmondási jog illeti meg a 45/2014. (II. 26.) Korm. rendelet szerint.",
        },
        {
          p: "10.3. Ha a fogyasztó kifejezetten kéri a teljesítés megkezdését a 14 napos határidő lejárta előtt, felmondás esetén a felmondás közléséig arányosan teljesített szolgáltatás ellenértékét köteles megfizetni. A szolgáltatás egészének teljesítését követően a fogyasztó csak akkor veszíti el e jogát, ha a teljesítés megkezdéséhez előzetesen kifejezetten hozzájárult és tudomásul vette, hogy a teljes teljesítéssel e jogát elveszíti.",
        },
        {
          p: "10.4. Fogyasztói szerződés esetén a Szolgáltató a szerződéskötést megelőzően, illetve a szerződés visszaigazolásakor a jogszabály által előírt további tájékoztatásokat is rendelkezésre bocsátja.",
        },
      ],
    },
    {
      h: "Panaszkezelés és jogvita",
      blocks: [
        {
          p: "11.1. A Megrendelő a szolgáltatással kapcsolatos panaszát a Szolgáltató jelen ÁSZF 1. pontjában megjelölt elérhetőségein terjesztheti elő. Fogyasztói írásbeli panaszt a Szolgáltató a beérkezéstől számított 30 napon belül írásban, érdemben és igazolható módon megválaszol. A fogyasztói panaszt és a válasz másolatát a Szolgáltató három évig megőrzi.",
        },
        {
          p: "11.2. A Szolgáltató székhelye szerinti békéltető testület: Csongrád-Csanád Vármegyei Békéltető Testület, 6721 Szeged, Párizsi krt. 8-12.; e-mail: [bekelteto.testulet@cskik.hu](mailto:bekelteto.testulet@cskik.hu); internet: [https://www.bekeltetes-csongrad.hu/](https://www.bekeltetes-csongrad.hu/). A fogyasztó jogosult a lakóhelye vagy tartózkodási helye szerint illetékes békéltető testülethez fordulni.",
        },
        {
          p: "11.3. Az Európai Unió korábbi online vitarendezési (ODR) platformja 2025. július 20. napjával megszűnt, ezért jelen ÁSZF ilyen platformra mutató panaszkezelési hivatkozást nem tartalmaz.",
        },
        {
          p: "11.4. A Felek a vitáikat elsődlegesen tárgyalás útján rendezik. Vállalkozások közötti jogviszonyban – ha az Egyedi Szerződés eltérően nem rendelkezik – a magyar jog alkalmazandó, és a hatáskörrel, illetékességgel rendelkező magyar bíróság jár el. Fogyasztóval szemben a jogszabály szerinti illetékességi szabályoktól hátrányára eltérni nem lehet.",
        },
      ],
    },
    {
      h: "Az ÁSZF módosítása és záró rendelkezések",
      blocks: [
        {
          p: "12.1. A Szolgáltató az ÁSZF-et a jövőre nézve módosíthatja. A módosítás a már létrejött szerződést csak akkor érinti, ha azt a Felek elfogadják, vagy ha az Egyedi Szerződés/jogszabály kifejezetten lehetővé teszi az egyoldalú módosítást és annak feltételei teljesülnek.",
        },
        {
          p: "12.2. Jelen ÁSZF-re különösen a 2013. évi V. törvény (Ptk.), fogyasztói jogviszony esetén az 1997. évi CLV. törvény és a 45/2014. (II. 26.) Korm. rendelet, továbbá az adatkezelésekre az (EU) 2016/679 rendelet (GDPR), a 2011. évi CXII. törvény (Infotv.) és az alkalmazandó magyar jogszabályok irányadóak.",
        },
      ],
    },
  ],
};

/** 23_Media_Cookie_Szabalyzat_2026-10-05.docx */
export const COOKIES: LegalDoc = {
  title: "Cookie (süti) szabályzat",
  description:
    "A 23media.hu cookie (süti) szabályzata: a sütik kategóriái és jogalapja, a hozzájárulás kezelése és az oldalon használt sütik.",
  intro: "23media.hu",
  effective: "2026. október 5. napjától",
  sections: [
    {
      h: "A szabályzat hatálya",
      blocks: [
        {
          p: `Jelen szabályzat a ${SITE} weboldalon alkalmazott cookie-kra és hasonló technológiákra vonatkozik, és a 23 Media Kft. ${link("privacy", "Adatkezelési Tájékoztatójának")} részét képezi.`,
        },
      ],
    },
    {
      h: "Mi az a cookie?",
      blocks: [
        {
          p: "A cookie a böngészőben vagy az eszközön elhelyezett kisméretű adat, amely többek között a munkamenet fenntartását, a felhasználói beállítások megjegyzését, statisztikai elemzést vagy – megfelelő hozzájárulás esetén – marketingcélú mérést tehet lehetővé. Hasonló technológiának minősülhet többek között a pixel, tag, local storage vagy más online azonosító.",
        },
      ],
    },
    {
      h: "Cookie-kategóriák és jogalap",
      blocks: [
        {
          ul: [
            "Feltétlenül szükséges cookie-k: a weboldal biztonságos és alapvető működéséhez szükségesek. Ezek nélkül a kért szolgáltatás nem vagy nem megfelelően működne. Ezek aktiválásához külön marketinghozzájárulás nem szükséges.",
            "Funkcionális cookie-k: a felhasználó által kért kényelmi funkciókat és beállításokat szolgálják. Ha nem feltétlenül szükségesek a kért funkcióhoz, használatuk hozzájáruláshoz kötött.",
            "Statisztikai/analitikai cookie-k: a weboldal használatának mérésére szolgálnak. Nem szükséges analitikai technológia csak előzetes hozzájárulás után aktiválható.",
            "Marketing/hirdetési cookie-k és pixelek: kampánymérésre, remarketingre, személyre szabásra vagy hirdetési célú profilalkotásra szolgálhatnak. Ezek használata kizárólag előzetes hozzájárulás alapján történhet.",
          ],
        },
      ],
    },
    {
      h: "Hozzájárulás kezelése",
      blocks: [
        {
          p: "A weboldal első meglátogatásakor a nem feltétlenül szükséges cookie-k alapértelmezetten inaktívak. A látogató kategóriánként dönthet azok engedélyezéséről. Az „elutasítás” lehetőségének a hozzájárulás megadásához hasonlóan könnyen elérhetőnek kell lennie. A hozzájárulás bármikor visszavonható vagy módosítható a weboldal „Sütibeállítások” felületén; a visszavonás nem érinti a korábbi adatkezelés jogszerűségét.",
        },
        {
          p: "A hozzájárulás nem lehet előre bejelölt, nem következhet pusztán a weboldal további használatából, és nem kapcsolható össze olyan szolgáltatással, amelynek teljesítéséhez az adott cookie nem szükséges.",
        },
      ],
    },
    {
      h: "A 23media.hu által használt cookie-k",
      // The document has a template table here ([CMP preferencia süti] …
      // [kitöltendő]) for the cookies the site sets. It sets none (checked
      // 2026-11-28), so this one sentence stands in for it.
      blocks: [
        { p: "A 23media.hu jelenleg semmilyen cookie-t vagy hasonló technológiát nem használ, ezért hozzájárulást sem kér." },
      ],
    },
    {
      h: "Külső szolgáltatók és harmadik ország",
      blocks: [
        {
          p: "Ha a weboldal Google-, Meta-, TikTok- vagy más külső analitikai/hirdetési technológiát használ, az adott szolgáltató a saját adatvédelmi feltételei szerint adatkezelőként, közös adatkezelőként vagy adatfeldolgozóként is eljárhat. Az ilyen szolgáltatások csak az adott kategóriához adott hozzájárulás után tölthetők be, kivéve, ha a konkrét technológia bizonyíthatóan feltétlenül szükséges.",
        },
        {
          p: `Harmadik országba történő adattovábbítás esetén a GDPR V. fejezete szerinti megfelelő adattovábbítási mechanizmust kell alkalmazni, és erről az ${link("privacy", "Adatkezelési Tájékoztatóban")}, illetve szükség szerint a CMP-ben tájékoztatást kell adni.`,
        },
      ],
    },
    {
      h: "Cookie-k törlése és böngészőbeállítások",
      blocks: [
        {
          p: "A látogató a weboldali sütibeállítások mellett a böngészőjében is törölheti vagy blokkolhatja a cookie-kat. A feltétlenül szükséges cookie-k blokkolása a weboldal egyes funkcióinak hibás működéséhez vezethet. A böngészőbeállítások önmagukban nem helyettesítik a weboldal előzetes hozzájárulási mechanizmusát a nem szükséges cookie-k esetében.",
        },
      ],
    },
    {
      h: "Kapcsolat",
      blocks: [
        {
          p: `Cookie- és adatvédelmi kérdés esetén a 23 Media Kft. a ${MAIL} e-mail-címen érhető el. A mindenkor hatályos Cookie Szabályzat a ${SITE} weboldalon kerül közzétételre.`,
        },
      ],
    },
  ],
};

export const IMPRINT: LegalDoc = {
  title: PAGES.imprint.title,
  description: "A 23media.hu üzemeltetőjének (23 Media Kft.) és tárhelyszolgáltatójának adatai.",
  intro:
    "Az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény (Ekertv.) 4. §-a szerinti adatok.",
  sections: [
    { h: "Szolgáltató", blocks: [{ rows: companyRows({ registry: true }) }] },
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
      h: "Jogi dokumentumok",
      blocks: [
        {
          ul: [
            link("terms", `${TERMS.title} (ÁSZF)`),
            link("privacy", PRIVACY.title),
            link("cookies", COOKIES.title),
          ],
        },
      ],
    },
  ],
};

export const LEGAL_DOCS = { privacy: PRIVACY, terms: TERMS, cookies: COOKIES, imprint: IMPRINT } as const;
