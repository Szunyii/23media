import Link from "next/link";
import { SITE_URL } from "../lib/site";

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

/**
 * Text with Markdown-style `[label](href)` links and `**bold**` — the format
 * the shared copy (lib/legal.ts) uses, so the Markdown version of a page needs
 * no conversion. Site paths become <Link>, everything else (mailto:, tel:,
 * https:) a plain <a>; only other sites open in a new tab.
 */
export default function RichText({ text, linkClassName = "" }: { text: string; linkClassName?: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const [whole, label, href, bold] = m;
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    last = at + whole.length;
    if (bold !== undefined) {
      out.push(
        <strong key={at} className="font-semibold text-bone">
          {bold}
        </strong>,
      );
      continue;
    }
    const cls = `text-bone underline decoration-accent/60 underline-offset-4 transition-colors hover:text-accent ${linkClassName}`;
    const external = href.startsWith("http") && !href.startsWith(SITE_URL);
    out.push(
      href.startsWith("/") ? (
        <Link key={at} href={href} className={cls}>
          {label}
        </Link>
      ) : (
        <a key={at} href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {label}
        </a>
      ),
    );
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
