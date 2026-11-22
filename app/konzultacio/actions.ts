"use server";

import nodemailer from "nodemailer";
import { fullName, inquiryHtml, inquirySubject, inquiryText } from "./inquiry-mail";

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

/**
 * Delivery: an e-mail into the 23@23media.hu Hostinger mailbox, sent over
 * Hostinger's SMTP as that mailbox (see .env.example). Reply-To is the
 * visitor, so answering the mail writes straight to them.
 *
 * Only SMTP_PASS has to be set; the rest defaults to the Hostinger mailbox.
 * Without it the inquiry is printed to the server console in development,
 * and in production the visitor gets the error with the direct address —
 * a submission must never look sent when it went nowhere.
 */
async function deliver(i: InquiryFields) {
  const at = new Date();
  const user = process.env.SMTP_USER || FALLBACK_TO;
  const pass = process.env.SMTP_PASS;
  const to = process.env.INQUIRY_TO || FALLBACK_TO;

  if (!pass) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP_PASS is not set");
    console.log(
      `[konzultacio] új megkeresés (SMTP_PASS nincs beállítva, nem ment ki e-mail)\n${inquiryText(i, at)}`,
    );
    return;
  }

  const port = Number(process.env.SMTP_PORT) || 465;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  await transport.sendMail({
    // Hostinger only relays mail whose From is the signed-in mailbox; the
    // visitor's name goes in the display name so the inbox list shows who wrote.
    from: { name: `${fullName(i)} · 23media.hu`, address: user },
    to,
    replyTo: { name: fullName(i), address: i.email },
    subject: inquirySubject(i),
    text: inquiryText(i, at),
    html: inquiryHtml(i, at),
  });
}
