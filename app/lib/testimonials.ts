/**
 * "Ügyfeleink írták" — client testimonials.
 *
 * Two groups of data, one wall on the page: a masonry that mixes them (see
 * `Wall` in Testimonials.tsx). On wide screens the personal-brand tiles are
 * two columns wide and stack on the left, the company tiles fill the column
 * beside them and then the space underneath; on a phone the two kinds simply
 * alternate. The groups keep their own tile designs, so they stay
 * recognisable without being split apart. To add a client, drop the image
 * files into `public/clients/` and append an entry to the right group.
 *
 * - `name`      the person who wrote it.
 * - `company`   the company or brand they speak for. On company tiles it is
 *               the headline (the person signs underneath); on personal
 *               tiles it sits in the line under the name.
 * - `role`      optional: what they do, if they want it shown.
 * - `logo`      optional, imported below (so its proportions are known).
 *               Shown in its own colours on the dark tile, and its shape
 *               sets the tile's height — a square mark makes a taller tile
 *               than a wide one. Use a transparent SVG/PNG variant made for
 *               dark backgrounds (no dark lettering). Without a logo the
 *               company name is set as a wordmark instead.
 * - `portrait`  optional. Tiles without one are logo-led.
 * - `quote`     the client's own words, verbatim. Long ones collapse to a
 *               few lines behind a "Tovább" toggle.
 * - `url`       optional: the client's site, opened in a new tab.
 */
import type { StaticImageData } from "next/image";
import logoFatAss from "@/public/clients/logo-fatass.png";
import logoMechaLearn from "@/public/clients/logo-mechalearn-mark.png";
import logoRoIroda from "@/public/clients/logo-ro-iroda.png";

export type Testimonial = {
  name: string;
  company?: string;
  role?: string;
  quote: string;
  url?: string;
  portrait?: string;
  logo?: StaticImageData;
};

export type TestimonialGroup = {
  id: "personal" | "company";
  /** the pill in the section's legend */
  label: string;
  /** the serif line next to it */
  tagline: string;
  items: Testimonial[];
};

export const GROUPS: TestimonialGroup[] = [
  {
    id: "personal",
    label: "Personal brand",
    tagline: "Akiknek a personal brandjét építjük.",
    items: [
      {
        name: "Ficsor Móni",
        company: "Ró Iroda",
        url: "https://roiroda.hu/",
        logo: logoRoIroda,
        quote:
          "Ádi és a 23 Média csapata a világot jelentő deszkákra segített fel és egyengetik azóta is az utam a végtelenbe és tovább! Több, mint marketing! Velük egy mindent felölelő utazásra indulsz, ahol a belső értékeid feltárásában és kiaknázásában is fontos szövetségesre lelsz bennük! Összehangolt és fiatalos csapat, ahogy az én csapatom is, ezért a pörgés itt alapfordulatszám!",
      },
    ],
  },
  {
    id: "company",
    label: "Cégek és márkák",
    tagline: "Akiknek a kommunikációját építjük.",
    items: [
      {
        name: "Tóth Gergő",
        company: "MechaLearn",
        url: "https://mechalearn.hu",
        logo: logoMechaLearn,
        quote:
          "Imádok Ádival és a csapatával dolgozni, egyszerűen nincs olyan akadály, amit ne tudnának pillanatok alatt megoldani. A legváratlanabb vagy legbonyolultabb helyzetekben is mindig előhúznak a kalapból egy olyan zseniális koncepciót, amitől az ember álla leesik. Képesek a látszólag száraz vagy kaotikus alapanyagból olyan bomba marketinget formálni, ami nemcsak látványos, de azonnal hozza az eredményeket is. Mellettük az ember teljesen biztonságban érzi magát, mert a kreativitás náluk precíz megvalósítással és profi hozzáállással párosul. Ritka az olyan partner, aki nemcsak ígér, hanem valóban túlszárnyalja a várakozásokat! Életem legjobb döntése volt, hogy őket bíztuk meg.",
      },
      {
        name: "Mucsi Bence",
        company: "Fat Ass",
        url: "https://www.fatass.hu/order",
        logo: logoFatAss,
        quote:
          "Ritka az olyan partner a piacon, mint Ádi és a 23 Media csapata, végtelenül profi és elképesztően precíz az egész társaság. A velük való közös munka során személy szerint olyan szakmai támogatást kaptam tőlük, amivel sikerült a saját határaimat is átlépnem. Lenyűgöző látni, hogy egyes projektünket abszolút úgy kezelik, mintha ők maguk lennének a márka legnagyobb “fan”-jai. Ez az elhivatottság és szenvedély teszi őket számunkra pótolhatatlan partnerré.",
      },
    ],
  },
];
