import { renderOg } from "./lib/og";
import { SITE_SLOGAN } from "./lib/site";

// The card every route shares unless it ships its own (see konzultacio/).
// Twitter/X reuses it: Next fills twitter:image from the Open Graph image.
export const alt = `23media — média és marketing ügynökség. ${SITE_SLOGAN}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg("home");
}
