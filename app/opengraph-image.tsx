import { renderOg } from "./lib/og";
import { OG_IMAGE_ALT } from "./lib/site";

// The card every route shares unless it ships its own (see konzultacio/).
// The file itself only reaches the home page; the subpages get it through
// pageMetadata (DEFAULT_OG_IMAGE in lib/site.ts — keep size/alt in step).
// Twitter/X reuses it: Next fills twitter:image from the Open Graph image.
export const alt = OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg("home");
}
