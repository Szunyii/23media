import { renderOg } from "../lib/og";

export const alt =
  "Beszéljünk a márkádról. Ingyenes, 30 perces konzultáció a 23media csapatával, kötelezettség nélkül.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg("consult");
}
