/**
 * Email sending helpers (SMTP via Hostinger Business Email by default).
 *
 * All SMTP settings are read from environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
 *   SMTP_FROM, SMTP_FROM_NAME
 *
 * If SMTP_USER/SMTP_PASS are not configured, emails are skipped with a
 * console warning (safe for local dev without credentials).
 */

import nodemailer from "nodemailer";
import { formatPrice } from "@/lib/format";
import { getStoreSettings, DEFAULTS, type StoreSettings } from "@/lib/settings";

// ─── Email localization (German) ──────────────────────────

const E = {
  de: {
    greetingName: (n: string) => `Hallo ${n},`,
    greetingGeneric: "Hallo liebe Kundin, lieber Kunde,",
    itemsHeadArticle: "Artikel",
    itemsHeadSum: "Summe",
    subtotal: "Zwischensumme",
    shipping: "Versand",
    free: "Kostenlos",
    vat: (r: number) => `MwSt. (${r}%)`,
    total: "Gesamt",
    shippingAddress: "Lieferadresse",
    orderNumber: "Bestellnummer",
    returnNumber: "Retouren-Nummer",
    trackingNumber: "Sendungsnummer",
    trackButton: "Sendung verfolgen",
    questionsLine: (m: string) =>
      `Bei Fragen antworten Sie einfach auf diese E-Mail oder schreiben Sie uns an ${m}.`,
    willPrepare: "wir haben Ihre Bestellung {order} erhalten und freuen uns, sie für Sie vorzubereiten.",
    thanksTitle: "Vielen Dank für Ihre Bestellung! 🎉",
    yourOrder: "Ihre Bestellung",
    subjectOrder: (n: string) => `Ihre Bestellung ${n} bei hausku`,
    separateShippingEmail:
      "Sie erhalten eine separate E-Mail, sobald Ihre Bestellung versendet wurde.",
    note: "Hinweis",
    orderStatus: {
      SHIPPED: {
        subject: "Ihre Bestellung ist unterwegs 📦",
        title: "Ihre Bestellung ist versendet!",
        body: "Ihre Bestellung wurde soeben versendet und ist auf dem Weg zu Ihnen.",
      },
      DELIVERED: {
        subject: "Ihre Bestellung wurde zugestellt ✅",
        title: "Ihre Bestellung ist angekommen!",
        body: "Wir hoffen, Sie haben Freude an Ihren neuen HAUSKU-Produkten. Bei Fragen sind wir jederzeit für Sie da.",
      },
      CANCELLED: {
        subject: "Ihre Bestellung wurde storniert",
        title: "Ihre Bestellung wurde storniert",
        body: "Ihre Bestellung wurde storniert. Falls Sie bereits bezahlt haben, wird der Betrag in Kürze zurückerstattet.",
      },
      REFUNDED: {
        subject: "Rückerstattung für Ihre Bestellung",
        title: "Ihre Rückerstattung wurde bearbeitet",
        body: "Der Betrag für Ihre Bestellung wurde zurückerstattet. Je nach Bank kann es 3–5 Werktage dauern, bis das Geld sichtbar ist.",
      },
    } as Record<string, { subject: string; title: string; body: string }>,
    returnStatus: {
      PENDING: {
        subject: (n: string) => `Ihre Retoure ${n} ist eingegangen 📬`,
        title: "Wir haben Ihre Retoure erhalten",
        body: "Ihre Retoure wurde bei uns erfasst. Wir prüfen die Anfrage und melden uns in der Regel innerhalb von 1–2 Werktagen.",
      },
      APPROVED: {
        subject: (n: string) => `Retoure ${n} genehmigt ✅`,
        title: "Ihre Retoure wurde genehmigt",
        body: "Sie können die Artikel nun zurücksenden. Bitte legen Sie alle Artikel vollständig bei und nutzen Sie die Rücksendeadresse aus Ihrer Bestellbestätigung.",
      },
      REJECTED: {
        subject: (n: string) => `Retoure ${n} abgelehnt`,
        title: "Ihre Retoure konnte nicht genehmigt werden",
        body: "Leider können wir Ihrer Retoure nicht stattgeben. Details finden Sie in dieser E-Mail.",
      },
      RECEIVED: {
        subject: (n: string) => `Ihre Retoure ${n} ist angekommen 📦`,
        title: "Ihre Retoure ist bei uns eingetroffen",
        body: "Wir haben Ihre Rücksendung erhalten und prüfen sie. Die Rückerstattung erfolgt, sobald die Prüfung abgeschlossen ist.",
      },
      REFUNDED: {
        subject: (n: string) => `Rückerstattung für Retoure ${n} 💶`,
        title: "Ihre Rückerstattung wurde veranlasst",
        body: "Der Betrag für Ihre Retoure wurde erstattet. Je nach Bank kann es 3–5 Werktage dauern, bis das Geld sichtbar ist.",
      },
    } as Record<string, { subject: (n: string) => string; title: string; body: string }>,
  },
} as const;

const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_SECURE = (process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "info@hausku.com";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "hausku";

// nodemailer v10 ships its own types and no longer exposes a global
// `nodemailer.Transporter` namespace — derive the type from the factory instead.
type Transporter = ReturnType<typeof nodemailer.createTransport>;

let transporter: Transporter | null = null;

/** Whether SMTP credentials are configured (emails will actually be sent). */
export function isEmailConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS);
}

function getTransporter(): Transporter | null {
  if (!isEmailConfigured()) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  /** Plain-text fallback — good for spam filters and text-only clients. */
  text?: string;
  replyTo?: string;
}

/** Send an email. Returns false (with a warning) if SMTP is not configured. */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const tr = getTransporter();
  if (!tr) {
    console.warn(
      `[email] SMTP not configured (set SMTP_USER/SMTP_PASS) — skipped email to ${payload.to}`
    );
    return false;
  }
  try {
    await tr.sendMail({
      from: `"${SMTP_FROM_NAME}" <${SMTP_FROM}>`,
      to: payload.to,
      replyTo: payload.replyTo,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    console.log(`[email] Sent "${payload.subject}" to ${payload.to}`);
    return true;
  } catch (error) {
    console.error("[email] Failed to send email:", error);
    return false;
  }
}

// ─── HTML layout ─────────────────────────────────────────

/**
 * Company block for the email footer (legal requirement for commercial
 * emails: company name, legal form, address, VAT ID, Geschäftsführung).
 * Reads live store settings; falls back to the built-in real company defaults.
 */
function footerCompanyBlock(settings: StoreSettings): string {
  const line = [
    escapeHtml(settings.companyName),
    escapeHtml(settings.companyAddress),
    settings.vatId ? `USt-IdNr.: ${escapeHtml(settings.vatId)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return `
                <div style="font-size:12px;color:#6b7280;line-height:1.6;">
                  ${line}<br />
                  Geschäftsführung: ${escapeHtml(settings.companyManager)}<br />
                  <a href="mailto:${escapeHtml(settings.companyEmail)}" style="color:#2F6B4F;text-decoration:none;">${escapeHtml(settings.companyEmail)}</a>
                </div>`;
}

async function emailLayout(
  title: string,
  contentHtml: string
): Promise<string> {
  let settings: StoreSettings;
  try {
    settings = await getStoreSettings();
  } catch {
    settings = DEFAULTS;
  }
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#79A97F,#2F6B4F);padding:28px 32px;text-align:center;">
              <div style="font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:2px;">HAUSKU</div>
              <div style="font-size:13px;color:#eaffea;margin-top:4px;">Home &amp; Kitchen</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              ${footerCompanyBlock(settings)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── Contact form notification ───────────────────────────

export interface ContactNotificationInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  topic?: string;
  orderNumber?: string;
}

/** Notify the store about a new contact form submission. */
export async function sendContactNotification(
  input: ContactNotificationInput
): Promise<boolean> {
  const subject = `[DE] Kontaktformular: ${input.subject || "Neue Nachricht"}`;
  const html = await emailLayout(
    "Neue Kontaktanfrage",
    `
    <h2 style="margin:0 0 20px;font-size:20px;color:#111827;">📬 Neue Kontaktanfrage</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#6b7280;width:110px;">Name</td>
        <td style="padding:10px 0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(input.name)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#6b7280;">E-Mail</td>
        <td style="padding:10px 0;font-size:14px;color:#111827;"><a href="mailto:${escapeHtml(input.email)}" style="color:#2F6B4F;">${escapeHtml(input.email)}</a></td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#6b7280;">Betreff</td>
        <td style="padding:10px 0;font-size:14px;color:#111827;">${escapeHtml(input.subject)}</td>
      </tr>${input.topic ? `
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#6b7280;">Anliegen</td>
        <td style="padding:10px 0;font-size:14px;color:#111827;">${escapeHtml(input.topic)}</td>
      </tr>` : ""}${input.orderNumber ? `
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#6b7280;">Bestell-Nr.</td>
        <td style="padding:10px 0;font-size:14px;color:#111827;">${escapeHtml(input.orderNumber)}</td>
      </tr>` : ""}
    </table>
    <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;font-size:14px;line-height:1.7;color:#374151;white-space:pre-wrap;">${escapeHtml(input.message)}</div>
    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">Diese E-Mail wurde automatisch über das Kontaktformular auf hausku.com gesendet.</p>
    `
  );

  const text = `Neue Kontaktanfrage

Name: ${input.name}
E-Mail: ${input.email}
Betreff: ${input.subject || "Neue Nachricht"}${input.topic ? `\nAnliegen: ${input.topic}` : ""}${input.orderNumber ? `\nBestell-Nr.: ${input.orderNumber}` : ""}

${input.message}

Diese E-Mail wurde automatisch über das Kontaktformular auf hausku.com gesendet.`;

  return sendEmail({
    to: SMTP_FROM,
    replyTo: input.email,
    subject,
    html,
    text,
  });
}

// ─── Order confirmation ──────────────────────────────────

export interface OrderEmailItem {
  productName: string;
  variantLabel?: string | null;
  qty: number;
  unitPrice: number;
}

export interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName?: string | null;
  items: OrderEmailItem[];
  subtotal: number;
  shippingCost: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  shippingName?: string | null;
  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingPostal?: string | null;
  shippingCountry?: string | null;
}

/** Send the order confirmation email to the customer. */
export async function sendOrderConfirmationEmail(
  data: OrderEmailData
): Promise<boolean> {
  if (!data.customerEmail) {
    console.warn("[email] Order confirmation skipped — no customer email");
    return false;
  }

  const L = E.de;

  const itemsHtml = data.items
    .map((item) => {
      const label = item.variantLabel ? ` (${escapeHtml(item.variantLabel)})` : "";
      return `
      <tr>
        <td style="padding:12px 8px;font-size:14px;color:#111827;">${escapeHtml(item.productName)}${label}<div style="font-size:12px;color:#6b7280;margin-top:2px;">${item.qty} × ${formatPrice(item.unitPrice)}</div></td>
        <td align="right" style="padding:12px 8px;font-size:14px;color:#111827;font-weight:600;">${formatPrice(item.unitPrice * item.qty)}</td>
      </tr>`;
    })
    .join("");

  const shippingLabel =
    data.shippingCost === 0
      ? L.free
      : formatPrice(data.shippingCost);

  const addressLines = [
    data.shippingName,
    data.shippingStreet,
    [data.shippingPostal, data.shippingCity].filter(Boolean).join(" "),
    data.shippingCountry,
  ]
    .filter((x): x is string => Boolean(x))
    .map(escapeHtml)
    .join("<br />");

  const itemsText = data.items
    .map(
      (item) =>
        `- ${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ""}: ${item.qty} × ${formatPrice(item.unitPrice)} = ${formatPrice(item.unitPrice * item.qty)}`
    )
    .join("\n");

  const addressText = [
    data.shippingName,
    data.shippingStreet,
    [data.shippingPostal, data.shippingCity].filter(Boolean).join(" "),
    data.shippingCountry,
  ]
    .filter((x): x is string => Boolean(x))
    .join("\n");

  const text = `${L.thanksTitle}\n\n${data.customerName ? L.greetingName(data.customerName) : L.greetingGeneric}\n${L.willPrepare.replace("{order}", data.orderNumber)}\n\n${L.yourOrder}:\n${itemsText}\n\n${L.subtotal}: ${formatPrice(data.subtotal)}\n${L.shipping}: ${shippingLabel}\n${L.vat(data.vatRate)}: ${formatPrice(data.vatAmount)}\n${L.total}: ${formatPrice(data.total)}${addressText ? `\n\n${L.shippingAddress}:\n${addressText}` : ""}\n\n${L.separateShippingEmail}\n${L.questionsLine(SMTP_FROM)}`;

  const html = await emailLayout(
    L.subjectOrder(data.orderNumber),
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${L.thanksTitle}</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      ${data.customerName ? L.greetingName(escapeHtml(data.customerName)) : L.greetingGeneric}<br />
      ${L.willPrepare.replace("{order}", `<strong style="color:#111827;">${escapeHtml(data.orderNumber)}</strong>`)}
    </p>

    <h3 style="margin:0 0 12px;font-size:15px;color:#111827;">${L.yourOrder}</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;margin-bottom:24px;">
      <thead>
        <tr style="background-color:#f9fafb;">
          <th align="left" style="padding:10px 8px;font-size:12px;color:#6b7280;text-transform:uppercase;">${L.itemsHeadArticle}</th>
          <th align="right" style="padding:10px 8px;font-size:12px;color:#6b7280;text-transform:uppercase;">${L.itemsHeadSum}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr><td colspan="2" style="border-top:1px solid #e5e7eb;"></td></tr>
        <tr>
          <td style="padding:10px 8px;font-size:13px;color:#6b7280;">${L.subtotal}</td>
          <td align="right" style="padding:10px 8px;font-size:13px;color:#111827;">${formatPrice(data.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:10px 8px;font-size:13px;color:#6b7280;">${L.shipping}</td>
          <td align="right" style="padding:10px 8px;font-size:13px;color:#111827;">${shippingLabel}</td>
        </tr>
        <tr>
          <td style="padding:10px 8px;font-size:13px;color:#6b7280;">${L.vat(data.vatRate)}</td>
          <td align="right" style="padding:10px 8px;font-size:13px;color:#111827;">${formatPrice(data.vatAmount)}</td>
        </tr>
        <tr>
          <td style="padding:12px 8px;font-size:15px;font-weight:bold;color:#111827;">${L.total}</td>
          <td align="right" style="padding:12px 8px;font-size:15px;font-weight:bold;color:#2F6B4F;">${formatPrice(data.total)}</td>
        </tr>
      </tbody>
    </table>

    ${addressLines ? `
    <h3 style="margin:0 0 12px;font-size:15px;color:#111827;">${L.shippingAddress}</h3>
    <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">${addressLines}</p>
    ` : ""}

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
      ${L.separateShippingEmail}
      ${L.questionsLine(`<a href="mailto:${SMTP_FROM}" style="color:#2F6B4F;">${SMTP_FROM}</a>`)}
    </p>
    `
  );

  return sendEmail({
    to: data.customerEmail,
    subject: L.subjectOrder(data.orderNumber),
    html,
    text,
  });
}

// ─── Tracking helpers ────────────────────────────────────

const CARRIER_TRACKING_URLS: Record<string, string> = {
  DHL: "https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?lang=de&idc={trackingNumber}",
  HERMES: "https://www.myhermes.de/empfangen/sendungsverfolgung?suche={trackingNumber}",
  DPD: "https://tracking.dpd.de/status/de_DE/parcel/{trackingNumber}",
  GLS: "https://gls-group.eu/DE/de/paketverfolgung?match={trackingNumber}",
  "DEUTSCHE POST": "https://www.deutschepost.de/sendung/simpleQuery?form.sendungsnummer={trackingNumber}",
};

/**
 * Build a tracking URL for a carrier + tracking number.
 * Returns null when the carrier is unknown or no number is given.
 */
export function getTrackingUrl(
  carrier: string | null | undefined,
  trackingNumber: string | null | undefined
): string | null {
  if (!carrier || !trackingNumber) return null;
  const template = CARRIER_TRACKING_URLS[carrier.trim().toUpperCase()];
  if (!template) return null;
  return template.replace(
    "{trackingNumber}",
    encodeURIComponent(trackingNumber.trim())
  );
}

// ─── Order status update emails (shipped / delivered / cancelled / refunded) ───

export interface OrderStatusEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName?: string | null;
  status: "SHIPPED" | "CANCELLED" | "DELIVERED" | "REFUNDED";
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

type OrderStatus = OrderStatusEmailData["status"];

const STATUS_EMOJI: Record<OrderStatus, string> = {
  SHIPPED: "📦",
  DELIVERED: "✅",
  CANCELLED: "❌",
  REFUNDED: "💶",
};

/**
 * Send an email whenever an order's status changes to something the customer
 * needs to know about (shipped, delivered, cancelled, refunded). Uses the
 * "Bestellungen" sender context so it reads as a transactional email.
 */
export async function sendOrderStatusEmail(
  data: OrderStatusEmailData
): Promise<boolean> {
  if (!data.customerEmail) {
    console.warn("[email] Order status email skipped — no customer email");
    return false;
  }

  const L = E.de;
  const content = L.orderStatus[data.status];
  const emoji = STATUS_EMOJI[data.status];
  const greeting = data.customerName
    ? L.greetingName(escapeHtml(data.customerName))
    : L.greetingGeneric;

  const trackingLine =
    data.status === "SHIPPED" && data.trackingNumber
      ? `<p style="margin:0 0 8px;font-size:14px;color:#6b7280;line-height:1.6;">${L.trackingNumber}: <strong style="color:#111827;">${escapeHtml(
          data.trackingNumber
        )}</strong></p>`
      : "";

  const trackingButton =
    data.status === "SHIPPED" && data.trackingUrl
      ? `<a href="${escapeHtml(
          data.trackingUrl
        )}" style="display:inline-block;margin-top:16px;background-color:#2F6B4F;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;">${L.trackButton}</a>`
      : "";

  const html = await emailLayout(
    content.subject,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${emoji} ${content.title}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      ${greeting}<br /><br />
      ${content.body}
    </p>
    <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#6b7280;">${L.orderNumber}</p>
      <p style="margin:2px 0 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(
        data.orderNumber
      )}</p>
    </div>
    ${trackingLine}
    ${trackingButton}
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.7;">
      ${L.questionsLine(`<a href="mailto:${SMTP_FROM}" style="color:#2F6B4F;">${SMTP_FROM}</a>`)}
    </p>
    `
  );

  const text = `${emoji} ${content.title}\n\n${data.customerName ? L.greetingName(data.customerName) : L.greetingGeneric}\n\n${content.body}\n\n${L.orderNumber}: ${data.orderNumber}${data.status === "SHIPPED" && data.trackingNumber ? `\n${L.trackingNumber}: ${data.trackingNumber}` : ""}${data.status === "SHIPPED" && data.trackingUrl ? `\n${L.trackButton}: ${data.trackingUrl}` : ""}\n\n${L.questionsLine(SMTP_FROM)}`;

  return sendEmail({
    to: data.customerEmail,
    replyTo: SMTP_FROM,
    subject: content.subject,
    html,
    text,
  });
}

// ─── Return / Widerruf status emails ─────────────────────

export interface ReturnStatusEmailData {
  returnNumber: string;
  orderNumber: string;
  customerEmail: string;
  customerName?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED";
  adminNote?: string | null;
}

type ReturnStatus = ReturnStatusEmailData["status"];

const RETURN_STATUS_EMOJI: Record<ReturnStatus, string> = {
  PENDING: "📬",
  APPROVED: "✅",
  REJECTED: "ℹ️",
  RECEIVED: "📦",
  REFUNDED: "💶",
};

/**
 * Send the customer an email whenever their return request changes status.
 */
export async function sendReturnStatusEmail(
  data: ReturnStatusEmailData
): Promise<boolean> {
  if (!data.customerEmail) {
    console.warn("[email] Return status email skipped — no customer email");
    return false;
  }

  const L = E.de;
  const content = L.returnStatus[data.status];
  const emoji = RETURN_STATUS_EMOJI[data.status];
  const subject = content.subject(data.returnNumber);
  const greeting = data.customerName
    ? L.greetingName(escapeHtml(data.customerName))
    : L.greetingGeneric;

  const noteHtml = data.adminNote
    ? `<div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0 0;font-size:14px;line-height:1.7;color:#374151;">${escapeHtml(
        data.adminNote
      )}</div>`
    : "";

  const html = await emailLayout(
    subject,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${emoji} ${content.title}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      ${greeting}<br /><br />
      ${content.body}
    </p>
    <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#6b7280;">${L.returnNumber}</p>
      <p style="margin:2px 0 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(
        data.returnNumber
      )}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">${L.orderNumber}</p>
      <p style="margin:2px 0 0;font-size:14px;font-weight:bold;color:#111827;">${escapeHtml(
        data.orderNumber
      )}</p>
    </div>
    ${noteHtml}
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.7;">
      ${L.questionsLine(`<a href="mailto:${SMTP_FROM}" style="color:#2F6B4F;">${SMTP_FROM}</a>`)}
    </p>
    `
  );

  const text = `${emoji} ${content.title}\n\n${data.customerName ? L.greetingName(data.customerName) : L.greetingGeneric}\n\n${content.body}\n\n${L.returnNumber}: ${data.returnNumber}\n${L.orderNumber}: ${data.orderNumber}${data.adminNote ? `\n\n${data.adminNote}` : ""}\n\n${L.questionsLine(SMTP_FROM)}`;

  return sendEmail({
    to: data.customerEmail,
    replyTo: SMTP_FROM,
    subject,
    html,
    text,
  });
}

// ─── Account registration confirmation ──────────────────

/**
 * Send the customer a welcome email after successful account registration.
 * Purely informational (no action required) — password reset does not exist
 * yet (see CORRECTION-TODO #20/#18).
 */
export async function sendWelcomeEmail(input: {
  email: string;
  name?: string | null;
}): Promise<boolean> {
  const L = E.de;
  const greeting = input.name
    ? L.greetingName(escapeHtml(input.name))
    : L.greetingGeneric;

  const title = "Willkommen bei HAUSKU! 🌿";
  const body =
    "Ihr Konto wurde erfolgreich erstellt. Sie können jetzt schneller zur Kasse gehen, Ihre Bestellungen verfolgen und Ihre Adressen verwalten.";
  const shopCta = "Jetzt shoppen";

  const html = await emailLayout(
    title,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${title}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      ${greeting}<br /><br />
      ${body}
    </p>
    <a href="https://hausku.com/catalog" style="display:inline-block;margin-top:8px;background-color:#2F6B4F;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;">${shopCta}</a>
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.7;">
      ${L.questionsLine(`<a href="mailto:${SMTP_FROM}" style="color:#2F6B4F;">${SMTP_FROM}</a>`)}
    </p>
    `
  );

  const text = `${title}\n\n${input.name ? L.greetingName(input.name) : L.greetingGeneric}\n\n${body}\n\nhttps://hausku.com/catalog\n\n${L.questionsLine(SMTP_FROM)}`;

  return sendEmail({
    to: input.email,
    replyTo: SMTP_FROM,
    subject: title,
    html,
    text,
  });
}

// ─── Password reset ─────────────────────────────────────

/**
 * Send a password reset link. The token in the link is the raw random string;
 * only its hash is stored in the DB (customer.resetToken).
 */
export async function sendPasswordResetEmail(input: {
  email: string;
  name?: string | null;
  resetUrl: string;
}): Promise<boolean> {
  const L = E.de;
  const greeting = input.name
    ? L.greetingName(escapeHtml(input.name))
    : L.greetingGeneric;
  const title = "Passwort zurücksetzen";
  const body =
    "Sie haben das Zurücksetzen Ihres Passworts angefordert. Der Link ist 1 Stunde gültig. Falls Sie das nicht waren, können Sie diese E-Mail ignorieren.";
  const cta = "Passwort setzen";

  const html = await emailLayout(
    title,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${title}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      ${greeting}<br /><br />
      ${body}
    </p>
    <a href="${escapeHtml(input.resetUrl)}" style="display:inline-block;margin-top:8px;background-color:#2F6B4F;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;">${cta}</a>
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.7;">
      ${L.questionsLine(`<a href="mailto:${SMTP_FROM}" style="color:#2F6B4F;">${SMTP_FROM}</a>`)}
    </p>
    `
  );

  const text = `${title}\n\n${input.name ? L.greetingName(input.name) : L.greetingGeneric}\n\n${body}\n\n${input.resetUrl}\n\n${L.questionsLine(SMTP_FROM)}`;

  return sendEmail({
    to: input.email,
    replyTo: SMTP_FROM,
    subject: title,
    html,
    text,
  });
}

// ─── Internal admin alert: new paid order ─────────────────

export interface NewOrderAdminAlertData {
  orderNumber: string;
  total: number;
  customerName?: string | null;
  customerEmail: string;
  itemCount: number;
}

/**
 * Internal notification sent to the store owner (not the customer) whenever a
 * new order is paid — so the admin doesn't have to keep the dashboard open.
 */
export async function sendNewOrderAdminAlert(
  data: NewOrderAdminAlertData
): Promise<boolean> {
  const html = await emailLayout(
    "Neue Bestellung",
    `
    <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">🛎️ Neue Bestellung eingegangen</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#6b7280;width:140px;">Bestellnummer</td>
        <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(
          data.orderNumber
        )}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#6b7280;">Kunde</td>
        <td style="padding:8px 0;font-size:14px;color:#111827;">${escapeHtml(
          data.customerName || "Gast"
        )} (${escapeHtml(data.customerEmail)})</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#6b7280;">Artikel</td>
        <td style="padding:8px 0;font-size:14px;color:#111827;">${data.itemCount}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#6b7280;">Betrag</td>
        <td style="padding:8px 0;font-size:15px;color:#2F6B4F;font-weight:bold;">${formatPrice(
          data.total
        )}</td>
      </tr>
    </table>
    <a href="https://hausku.com/admin/orders" style="display:inline-block;margin-top:12px;background-color:#111827;color:#ffffff;text-decoration:none;font-weight:600;padding:10px 22px;border-radius:8px;font-size:14px;">Im Admin-Panel öffnen</a>
    `
  );

  const text = `🛎️ Neue Bestellung eingegangen\n\nBestellnummer: ${data.orderNumber}\nKunde: ${data.customerName || "Gast"} (${data.customerEmail})\nArtikel: ${data.itemCount}\nBetrag: ${formatPrice(data.total)}\n\nIm Admin-Panel öffnen: https://hausku.com/admin/orders`;

  return sendEmail({
    to: process.env.SMTP_ADMIN_ALERT_TO || "info@hausku.com",
    subject: `🛎️ Neue Bestellung ${data.orderNumber} — ${formatPrice(data.total)}`,
    html,
    text,
  });
}
