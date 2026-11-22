/**
 * The e-mail a /konzultacio submission becomes in the 23@23media.hu inbox:
 * subject, HTML body and plain-text fallback. Pure functions, no I/O — the
 * sending lives in actions.ts.
 *
 * Every visitor-typed value goes through `esc()` before it touches the HTML.
 * The layout is table-based with inline styles because that is what mail
 * clients render reliably.
 */

export type InquiryMail = {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  company: string;
  occupation: string;
  /** Normalised https URL, or "" when the visitor left it empty. */
  website: string;
};

const ACCENT = "#f5c518";
const INK = "#0b0b0b";
const MUTED = "#6b6b6b";
const LINE = "#e6e6e6";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const DASH = "—";

function esc(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function fullName(i: InquiryMail) {
  return `${i.lastName} ${i.firstName}`;
}

/** "+36 30 123 4567" → "+36301234567" for the tel: link. */
function telHref(phone: string) {
  const plus = phone.trim().startsWith("+") ? "+" : "";
  return `tel:${plus}${phone.replace(/\D/g, "")}`;
}

/** "https://example.hu/" → "example.hu" for display. */
function bareUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function submittedAt(date: Date) {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function inquirySubject(i: InquiryMail) {
  return `Konzultációs megkeresés — ${fullName(i)}${i.company ? ` · ${i.company}` : ""}`;
}

export function inquiryText(i: InquiryMail, at: Date) {
  const rows: [string, string][] = [
    ["Név", fullName(i)],
    ["E-mail", i.email],
    ["Telefon", i.phone],
    ["Cég", i.company || DASH],
    ["Weboldal", i.website || DASH],
  ];
  const pad = Math.max(...rows.map(([k]) => k.length)) + 2;
  return [
    "ÚJ KONZULTÁCIÓS MEGKERESÉS — 23media.hu/konzultacio",
    "",
    ...rows.map(([k, v]) => `${`${k}:`.padEnd(pad)}${v}`),
    "",
    "Mivel foglalkozik:",
    i.occupation,
    "",
    "—",
    `Beküldve: ${submittedAt(at)}`,
    `Erre a levélre válaszolva közvetlenül neki írsz (${i.email}).`,
  ].join("\n");
}

function row(label: string, valueHtml: string, last = false) {
  const border = last ? "" : `border-bottom:1px solid ${LINE};`;
  return `
          <tr>
            <td valign="top" style="${border}padding:14px 16px 14px 0;width:120px;font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">${label}</td>
            <td valign="top" style="${border}padding:12px 0;font-family:${FONT};font-size:16px;line-height:1.45;color:${INK};">${valueHtml}</td>
          </tr>`;
}

function link(href: string, text: string) {
  return `<a href="${esc(href)}" style="color:${INK};text-decoration:underline;text-decoration-color:${ACCENT};text-underline-offset:3px;">${esc(text)}</a>`;
}

function button(href: string, text: string, primary: boolean) {
  const bg = primary ? INK : "#ffffff";
  const fg = primary ? "#ffffff" : INK;
  return `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 18px;border:1px solid ${INK};border-radius:999px;background:${bg};color:${fg};font-family:${FONT};font-size:14px;font-weight:600;text-decoration:none;">${esc(text)}</a>`;
}

export function inquiryHtml(i: InquiryMail, at: Date) {
  const name = fullName(i);
  const replyHref = `mailto:${i.email}?subject=${encodeURIComponent("Re: ingyenes konzultáció — 23media")}`;
  const preheader = [name, i.company, i.phone].filter(Boolean).join(" · ");

  const rows = [
    row("Név", esc(name)),
    row("E-mail", link(`mailto:${i.email}`, i.email)),
    row("Telefon", link(telHref(i.phone), i.phone)),
    row("Cég", i.company ? esc(i.company) : `<span style="color:${MUTED};">${DASH}</span>`),
    row(
      "Weboldal",
      i.website ? link(i.website, bareUrl(i.website)) : `<span style="color:${MUTED};">${DASH}</span>`,
      true,
    ),
  ].join("");

  return `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(inquirySubject(i))}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f2;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${LINE};">
        <tr><td style="height:6px;line-height:6px;font-size:0;background:${ACCENT};">&nbsp;</td></tr>
        <tr>
          <td style="padding:28px 32px 8px;">
            <div style="font-family:${MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">23media · Ingyenes konzultáció</div>
            <h1 style="margin:10px 0 0;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:700;letter-spacing:-0.01em;color:${INK};">${esc(name)}</h1>
            ${i.company ? `<div style="margin-top:4px;font-family:${FONT};font-size:16px;color:${MUTED};">${esc(i.company)}</div>` : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 0;">
            ${button(replyHref, "Válasz e-mailben", true)}${button(telHref(i.phone), `Hívás: ${i.phone}`, false)}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${INK};">${rows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">Mivel foglalkozik</div>
            <div style="margin-top:8px;padding:14px 16px;border-left:3px solid ${ACCENT};background:#fafaf8;font-family:${FONT};font-size:16px;line-height:1.5;color:${INK};white-space:pre-wrap;">${esc(i.occupation)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 28px;">
            <div style="border-top:1px solid ${LINE};padding-top:16px;font-family:${FONT};font-size:13px;line-height:1.5;color:${MUTED};">
              Beküldve: ${esc(submittedAt(at))} · <a href="https://23media.hu/konzultacio" style="color:${MUTED};">23media.hu/konzultacio</a><br>
              Erre a levélre válaszolva közvetlenül neki írsz (${esc(i.email)}).
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
