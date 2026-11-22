import Link from "next/link";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * Text with Markdown-style `[label](href)` links — the format the shared copy
 * (lib/legal.ts) uses, so the Markdown version of a page needs no conversion.
 * Site paths become <Link>, everything else (mailto:, https:) a plain <a>.
 */
export default function RichText({ text, linkClassName = "" }: { text: string; linkClassName?: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const [whole, label, href] = m;
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const cls = `text-bone underline decoration-accent/60 underline-offset-4 transition-colors hover:text-accent ${linkClassName}`;
    out.push(
      href.startsWith("/") ? (
        <Link key={at} href={href} className={cls}>
          {label}
        </Link>
      ) : (
        <a
          key={at}
          href={href}
          className={cls}
          {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
        </a>
      ),
    );
    last = at + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
