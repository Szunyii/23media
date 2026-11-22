"use server";

/** The seven fields the client asked for, in their order. Only `company`
 *  and `website` are optional — a personal brand may have neither. */
export type InquiryFields = {
  lastName: string;
  firstName: string;
  email: string;
  company: string;
  phone: string;
  occupation: string;
  website: string;
};

export type InquiryState =
  | { status: "idle" }
  | { status: "ok"; firstName: string; email: string }
  /** `fields` echoes the submission so the form can re-populate itself —
   *  React resets uncontrolled inputs once a form action settles. */
  | { status: "error"; message: string; fields: InquiryFields };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Digits with the usual separators; the digit count is checked separately. */
const PHONE_RE = /^\+?[\d\s().\/-]+$/;
const FALLBACK_TO = "23@23media.hu";

function str(fd: FormData, key: string, max: number) {
  return String(fd.get(key) ?? "")
    .trim()
    .slice(0, max);
}

function isPhone(v: string) {
  const digits = v.replace(/\D/g, "").length;
  return PHONE_RE.test(v) && digits >= 7 && digits <= 15;
}

/** Accepts "23media.hu" as well as "https://23media.hu"; returns the
 *  normalised URL or null when it can't be one. */
function normalizeUrl(v: string): string | null {
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return null;
    return u.href;
  } catch {
    return null;
  }
}

export async function sendInquiry(
  _prev: InquiryState,
  fd: FormData,
): Promise<InquiryState> {
  // Honeypot — bots fill every field; real users never see this one.
  if (str(fd, "fax", 10)) {
    return {
      status: "ok",
      firstName: str(fd, "firstName", 80),
      email: str(fd, "email", 120),
    };
  }

  const fields: InquiryFields = {
    lastName: str(fd, "lastName", 80),
    firstName: str(fd, "firstName", 80),
    email: str(fd, "email", 120),
    company: str(fd, "company", 120),
    phone: str(fd, "phone", 40),
    occupation: str(fd, "occupation", 300),
    website: str(fd, "website", 200),
  };
  const fail = (message: string): InquiryState => ({ status: "error", message, fields });

  if (fields.lastName.length < 2) return fail("Írd be a vezetékneved.");
  if (fields.firstName.length < 2) return fail("Írd be a keresztneved.");
  if (!EMAIL_RE.test(fields.email)) return fail("Ez az e-mail cím nem tűnik jónak.");
  if (!isPhone(fields.phone))
    return fail("Ez a telefonszám nem tűnik jónak — írd be előhívóval együtt.");
  if (fields.occupation.length < 2) return fail("Írd le pár szóban, mivel foglalkozol.");

  const website = fields.website ? normalizeUrl(fields.website) : "";
  if (website === null) return fail("Ez a weboldalcím nem tűnik jónak.");

  const inquiry = { ...fields, website };

  try {
    await deliver(inquiry);
  } catch (err) {
    console.error("[konzultacio] delivery failed", err);
    return fail(`Nem sikerült elküldeni. Írj nekünk közvetlenül: ${FALLBACK_TO}`);
  }

  return { status: "ok", firstName: fields.firstName, email: fields.email };
}

function render(i: InquiryFields) {
  return [
    `Név: ${i.lastName} ${i.firstName}`,
    `E-mail: ${i.email}`,
    `Telefon: ${i.phone}`,
    `Cég: ${i.company || "—"}`,
    `Foglalkozás: ${i.occupation}`,
    `Weboldal: ${i.website || "—"}`,
  ].join("\n");
}

/**
 * Delivery: sends through Resend when RESEND_API_KEY is set (see .env.example),
 * otherwise logs to the server console so the flow works in development.
 */
async function deliver(i: InquiryFields) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO ?? FALLBACK_TO;
  const text = render(i);

  if (!key) {
    console.log(`[konzultacio] új megkeresés (RESEND_API_KEY nincs beállítva)\n${text}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM ?? "23media <onboarding@resend.dev>",
      to: [to],
      reply_to: i.email,
      subject: `Ingyenes konzultáció — ${i.lastName} ${i.firstName}${
        i.company ? ` (${i.company})` : ""
      }`,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
