import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { MARK_H, MARK_PATH, MARK_VIEWBOX, MARK_W } from "./mark";
import { SITE_SLOGAN } from "./site";

/**
 * The link-preview cards (Open Graph / Twitter), drawn with the site's own
 * vocabulary: ink ground, bone type, the "23" mark, one accent.
 *
 * `next/og` renders through Satori, which has no CSS cascade and only flexbox:
 * every box with more than one child needs `display: flex`, lengths are plain
 * pixels, and fonts must be static TTFs handed over as data — hence the copies
 * of the three brand faces in assets/og (the page itself uses next/font).
 */
export const OG_SIZE = { width: 1200, height: 630 };

// globals.css tokens
const INK = "#0a0a0a";
const BONE = "#f4f3ef";
const BONE_DIM = "#b7b6b0";
const LINE = "#26251f";
const ACCENT = "#f5c518";

const DISPLAY = "Bricolage Grotesque";
const SERIF = "Instrument Serif";
const MONO = "Geist Mono";

/** Same 0.4 shear as the mark's bars (MARK_SHEAR is a CSS string; Satori wants it inline). */
const SHEAR = "skewX(-21.8deg)";

/**
 * Bricolage's baseline sits 0.17em above the bottom of a line-height-1 box
 * (ascender 930, descender -270 on a 1000 em). Satori can't align flex items
 * on the baseline, so boxes that must stand on a shared line are bottom-aligned
 * and pulled down by this much.
 */
const DISPLAY_DROP = 0.17;
/** Instrument Serif italic: ascender 990, descender -310. */
const SERIF_DROP = 0.16;

// Read on first use, not at module scope: the cards are prerendered at build,
// so the running server never has to touch these files just to load the route.
let fonts: Promise<
  { name: string; data: Buffer; weight: 400 | 500 | 800; style: "normal" | "italic" }[]
> | null = null;

function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "assets/og/BricolageGrotesque-ExtraBold.ttf")),
    readFile(join(process.cwd(), "assets/og/BricolageGrotesque-Medium.ttf")),
    readFile(join(process.cwd(), "assets/og/InstrumentSerif-Italic.ttf")),
    readFile(join(process.cwd(), "assets/og/GeistMono-Medium.ttf")),
  ]).then(([extraBold, medium, serifItalic, mono]) => [
    { name: DISPLAY, data: extraBold, weight: 800 as const, style: "normal" as const },
    { name: DISPLAY, data: medium, weight: 500 as const, style: "normal" as const },
    { name: SERIF, data: serifItalic, weight: 400 as const, style: "italic" as const },
    { name: MONO, data: mono, weight: 500 as const, style: "normal" as const },
  ]);
  return fonts;
}

/** The hero lockup at rest: mark, "Media" on the mark's baseline, accent full stop. */
function Lockup({ h }: { h: number }) {
  const fs = h * 0.98;
  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      <svg width={(h * MARK_W) / MARK_H} height={h} viewBox={MARK_VIEWBOX}>
        <path d={MARK_PATH} fill={BONE} fillRule="evenodd" />
      </svg>
      <div
        style={{
          display: "flex",
          marginLeft: h * 0.2,
          marginBottom: -fs * DISPLAY_DROP,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: fs,
          lineHeight: 1,
          letterSpacing: -fs * 0.045,
          color: BONE,
        }}
      >
        Media
      </div>
      <div
        style={{
          width: h * 0.105,
          height: h * 0.105,
          marginLeft: h * 0.07,
          borderRadius: 999,
          background: ACCENT,
        }}
      />
    </div>
  );
}

/** SectionLabel's twin: sheared accent tab + mono eyebrow. */
function Eyebrow({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ width: 13, height: 24, background: ACCENT, transform: SHEAR }} />
      <div
        style={{
          display: "flex",
          marginLeft: 20,
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: 21,
          letterSpacing: 5.9,
          color: BONE,
        }}
      >
        {children.toUpperCase()}
      </div>
    </div>
  );
}

/** The site's accent pill button, carrying the address instead of a call to action. */
function Address({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexShrink: 0,
        alignItems: "center",
        padding: "15px 26px",
        borderRadius: 999,
        background: ACCENT,
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: 19,
        letterSpacing: 3.4,
        whiteSpace: "nowrap",
        color: INK,
      }}
    >
      {children.toUpperCase()}
    </div>
  );
}

function Card({
  eyebrow,
  corner,
  line,
  address,
  children,
}: {
  eyebrow: string;
  corner: React.ReactNode;
  /** The sentence on the bottom rule. */
  line: string;
  address: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "58px 68px 52px",
        background: INK,
        color: BONE,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        {corner}
      </div>

      {children}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 30,
          borderTop: `1px solid ${LINE}`,
        }}
      >
        <div
          style={{
            display: "flex",
            maxWidth: 620,
            fontFamily: DISPLAY,
            fontWeight: 500,
            fontSize: 31,
            lineHeight: 1.25,
            letterSpacing: -0.7,
            color: BONE,
          }}
        >
          {line}
        </div>
        <Address>{address}</Address>
      </div>
    </div>
  );
}

const cornerNote = (text: string) => (
  <div
    style={{
      display: "flex",
      fontFamily: MONO,
      fontWeight: 500,
      fontSize: 18,
      letterSpacing: 4.5,
      color: BONE_DIM,
    }}
  >
    {text}
  </div>
);

const CARDS = {
  /** Home: the hero, held still. */
  home: () => (
    <Card
      eyebrow="Média és marketing ügynökség"
      corner={cornerNote("EST. 2025")}
      line={SITE_SLOGAN}
      address="23media.hu"
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Lockup h={214} />
      </div>
    </Card>
  ),

  /** /konzultacio: the page's own headline, with the lockup as the signature. */
  consult: () => {
    const fs = 148;
    return (
      <Card
        eyebrow="Ingyenes · 30 perc · kötelezettség nélkül"
        corner={<Lockup h={38} />}
        line="Fél óra alatt találunk három konkrét következő lépést a márkádnak."
        address="23media.hu/konzultacio"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: fs,
            lineHeight: 0.94,
            letterSpacing: -fs * 0.03,
          }}
        >
          <div style={{ display: "flex" }}>Beszéljünk</div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div style={{ display: "flex" }}>a</div>
            <div
              style={{
                display: "flex",
                marginLeft: fs * 0.22,
                marginBottom: fs * (DISPLAY_DROP - SERIF_DROP),
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 400,
                letterSpacing: -fs * 0.01,
                color: ACCENT,
              }}
            >
              márkádról.
            </div>
          </div>
        </div>
      </Card>
    );
  },
};

export type OgCard = keyof typeof CARDS;

export async function renderOg(card: OgCard) {
  return new ImageResponse(CARDS[card](), { ...OG_SIZE, fonts: await loadFonts() });
}
