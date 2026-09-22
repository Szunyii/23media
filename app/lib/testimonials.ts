/**
 * "Ügyfeleink írták" — client testimonials.
 *
 * Two groups, always in this order: personal brands first (the deep,
 * flagship work), companies second. To add a client, drop the image files
 * into `public/clients/` and append an entry to the right group.
 *
 * - `portrait`  optional. Tiles without one are logo-only.
 * - `logo`      optional. Any colour is flattened to bone on the dark tiles,
 *               so a light/white-on-transparent SVG or PNG works best.
 * - `quote`     two to ten sentences. Long ones collapse to a few lines
 *               behind a "Tovább" toggle.
 * - `url`       the client's own site, opened in a new tab.
 *
 * The entries below are placeholders until the real client material lands.
 */
export type Testimonial = {
  /** the person (portrait tiles) or the company (logo-only tiles) */
  name: string;
  /** one line under the name: what they do, and the company if any */
  role: string;
  quote: string;
  url: string;
  portrait?: string;
  logo?: string;
};

export type TestimonialGroup = {
  id: "personal" | "company";
  /** the pill on the group header */
  label: string;
  /** the serif line next to it */
  tagline: string;
  items: Testimonial[];
};

export const GROUPS: TestimonialGroup[] = [
  {
    id: "personal",
    label: "Personal brand",
    tagline: "Akik a saját nevükkel állnak ki.",
    items: [
      {
        name: "Kertész Lilla",
        role: "Karrier- és vezetői coach",
        url: "https://kerteszlilla.hu",
        portrait: "/clients/kertesz-lilla.svg",
        logo: "/clients/logo-kertesz-lilla.svg",
        quote:
          "Sokáig azt hittem, hogy a personal branding annyi, hogy szépen fotózkodom és posztolok. A 23media-val az első hónap arról szólt, hogy egyáltalán ki vagyok, és mit akarok mondani. Az önismereti mentorral végzett munka volt a legnehezebb és a legértékesebb része az egésznek. Utána minden a helyére került: a stratégia, a scriptek, a forgatások. Ma már nem izgulok a kamera előtt, mert nem szerepelek, hanem magam vagyok. A tartalmaim végre úgy hangzanak, ahogy én beszélek. Fél év alatt megháromszorozódott a bejövő megkeresések száma, és jobb ügyfelek találnak meg. Azt is elmondták, ha valami nem működött, nem csak azt, amit hallani akartam. Mindenkinek ezt kívánom, aki a saját nevével dolgozik.",
      },
      {
        name: "Balogh Áron",
        role: "Ingatlanszakértő",
        url: "https://baloghingatlan.hu",
        portrait: "/clients/balogh-aron.svg",
        logo: "/clients/logo-balogh.svg",
        quote:
          "Az ingatlanpiacon mindenki ugyanazt mondja, ugyanúgy. Nekem azt segítettek megtalálni, amit csak én tudok elmondani. A videóim végre nem reklámok, hanem beszélgetések. Az eredmény: a követőim fele ma már ajánlásból jön.",
      },
      {
        name: "Dr. Fekete Zsófia",
        role: "Fogorvos · Fekete Dental",
        url: "https://feketedental.hu",
        portrait: "/clients/fekete-zsofia.svg",
        logo: "/clients/logo-fekete-dental.svg",
        quote:
          "Nem gondoltam, hogy egy fogorvosnak személyes márkára van szüksége. Egy év után a pácienseim harmada név szerint keres.",
      },
      {
        name: "Molnár Gábor",
        role: "Pénzügyi tervező",
        url: "https://molnarpenzugy.hu",
        logo: "/clients/logo-molnar.svg",
        quote:
          "Pénzügyekről beszélni úgy, hogy ne legyen unalmas, és ne legyen ciki, nem egyszerű. A feltáró szakaszban derült ki, hogy a történeteim a legerősebb eszközeim. Ezekre építettük a stratégiát, és minden hónapra kaptam kész scripteket. A forgatásokon végig ott voltak, és tanítottak szerepelni. Ma egy podcastot vezetek, amit magamtól sosem mertem volna elindítani.",
      },
    ],
  },
  {
    id: "company",
    label: "Cégek és márkák",
    tagline: "Akiknek a kommunikációját építjük.",
    items: [
      {
        name: "Szalai Dóra",
        role: "Társalapító · Helio",
        url: "https://helio.energy",
        portrait: "/clients/szalai-dora.svg",
        logo: "/clients/logo-helio.svg",
        quote:
          "A márkát és a webet egyszerre kértük, három hónapos határidővel. Nem ígértek csodát, hanem leültek velünk, és végigkérdezték, mit akarunk igazából elérni. A stratégia előbb készült el, mint bármilyen látvány, és ez utólag a legjobb döntésnek bizonyult. A design nem trendi lett, hanem a sajátunk. Az indulás után a regisztrációk száma a kétszeresére nőtt, a harmadik hónapra a háromszorosára. Amit a legjobban értékelünk: ha valamit nem tartottak jó ötletnek, azt kimondták. Azóta a hirdetéseinket is ők viszik. Nem ügynökségként gondolunk rájuk, hanem a csapatunk részeként.",
      },
      {
        name: "Northwind Kft.",
        role: "Logisztika · B2B",
        url: "https://northwind.hu",
        logo: "/clients/logo-northwind.svg",
        quote:
          "Egy B2B logisztikai cégnek ritkán van érdekes kommunikációja. A 23media designrendszert és új weboldalt épített nekünk, ami végre úgy néz ki, mint amennyit a szolgáltatásunk ér. A lemorzsolódás a kapcsolatfelvételi oldalon 38 százalékkal csökkent.",
      },
      {
        name: "Vantage Media",
        role: "Kiadó · hirdetés",
        url: "https://vantage.hu",
        logo: "/clients/logo-vantage.svg",
        quote: "Négyszeres ROAS az első negyedévben. Nincs mit hozzátenni.",
      },
      {
        name: "Terra Bútor",
        role: "Bútorgyártás · manufaktúra",
        url: "https://terrabutor.hu",
        logo: "/clients/logo-terra.svg",
        quote:
          "Negyven éve gyártunk bútort, de a weboldalunk 2009-ben ragadt. Féltünk attól, hogy egy ügynökség majd valami hideg, modern dolgot csinál belőlünk. Ehelyett eljöttek a műhelybe, és megértették, miért fontos nekünk a fa. Az új oldal a kezünk munkájáról szól, nem a kedvezményekről. A fotózást és a videót is ők szervezték, a forgatáson a szakik lettek a főszereplők. Fél év alatt több egyedi megrendelést kaptunk online, mint előtte három évben. És végre büszkék vagyunk arra, amit a nevünk alatt látni lehet.",
      },
      {
        name: "Pulse Fitness",
        role: "Fitnesz · három terem",
        url: "https://pulsefitness.hu",
        logo: "/clients/logo-pulse.svg",
        quote:
          "Három terem, egy márka, nulla egységes kommunikáció: így érkeztünk. A social managementet teljesen átvették, és három hónap alatt olyan rendszert állítottak fel, amiben a bejelentkezések nem vesznek el. A tagok már azelőtt tudják, mi történik nálunk, mielőtt belépnek az ajtón. A nyitási kampányunk videója 61 millió megtekintésnél jár.",
      },
      {
        name: "Dr. Halmi Tamás",
        role: "Alapító · Aurum Dental",
        url: "https://aurumdental.hu",
        portrait: "/clients/halmi-tamas.svg",
        logo: "/clients/logo-aurum.svg",
        quote:
          "Sok ügynökséggel dolgoztunk, ez az első, ahol a marketing és a rendelő működése összeért. A rendszer, amit építettek, magától hozza az időpontokat. A csapatunk időt nyert, a pácienseink figyelmet.",
      },
    ],
  },
];
