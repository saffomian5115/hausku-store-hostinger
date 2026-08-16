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

const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_SECURE = (process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "info@hausku.com";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "hausku";

let transporter: nodemailer.Transporter | null = null;

/** Whether SMTP credentials are configured (emails will actually be sent). */
export function isEmailConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS);
}

function getTransporter(): nodemailer.Transporter | null {
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
    });
    console.log(`[email] Sent "${payload.subject}" to ${payload.to}`);
    return true;
  } catch (error) {
    console.error("[email] Failed to send email:", error);
    return false;
  }
}

// ─── HTML layout ─────────────────────────────────────────

function emailLayout(title: string, contentHtml: string): string {
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
            <td style="background:linear-gradient(135deg,#32CD32,#22c55e);padding:28px 32px;text-align:center;">
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
              <div style="font-size:12px;color:#6b7280;line-height:1.6;">
                NI Intellect UG · hausku<br />
                <a href="mailto:info@hausku.com" style="color:#16a34a;text-decoration:none;">info@hausku.com</a>
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
}

/** Notify the store about a new contact form submission. */
export async function sendContactNotification(
  input: ContactNotificationInput
): Promise<boolean> {
  const subject = `Kontaktformular: ${input.subject || "Neue Nachricht"}`;
  const html = emailLayout(
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
        <td style="padding:10px 0;font-size:14px;color:#111827;"><a href="mailto:${escapeHtml(input.email)}" style="color:#16a34a;">${escapeHtml(input.email)}</a></td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#6b7280;">Betreff</td>
        <td style="padding:10px 0;font-size:14px;color:#111827;">${escapeHtml(input.subject)}</td>
      </tr>
    </table>
    <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;font-size:14px;line-height:1.7;color:#374151;white-space:pre-wrap;">${escapeHtml(input.message)}</div>
    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">Diese E-Mail wurde automatisch über das Kontaktformular auf hausku.com gesendet.</p>
    `
  );

  return sendEmail({
    to: SMTP_FROM,
    replyTo: input.email,
    subject,
    html,
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
      ? "Kostenlos"
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

  const html = emailLayout(
    `Bestellbestätigung ${data.orderNumber}`,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Vielen Dank für Ihre Bestellung! 🎉</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hallo ${data.customerName ? escapeHtml(data.customerName) : "und herzlich willkommen"},<br />
      wir haben Ihre Bestellung <strong style="color:#111827;">${escapeHtml(data.orderNumber)}</strong> erhalten und
      freuen uns, sie für Sie vorzubereiten.
    </p>

    <h3 style="margin:0 0 12px;font-size:15px;color:#111827;">Ihre Bestellung</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;margin-bottom:24px;">
      <thead>
        <tr style="background-color:#f9fafb;">
          <th align="left" style="padding:10px 8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Artikel</th>
          <th align="right" style="padding:10px 8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Summe</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr><td colspan="2" style="border-top:1px solid #e5e7eb;"></td></tr>
        <tr>
          <td style="padding:10px 8px;font-size:13px;color:#6b7280;">Zwischensumme</td>
          <td align="right" style="padding:10px 8px;font-size:13px;color:#111827;">${formatPrice(data.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:10px 8px;font-size:13px;color:#6b7280;">Versand</td>
          <td align="right" style="padding:10px 8px;font-size:13px;color:#111827;">${shippingLabel}</td>
        </tr>
        <tr>
          <td style="padding:10px 8px;font-size:13px;color:#6b7280;">MwSt. (${data.vatRate}%)</td>
          <td align="right" style="padding:10px 8px;font-size:13px;color:#111827;">${formatPrice(data.vatAmount)}</td>
        </tr>
        <tr>
          <td style="padding:12px 8px;font-size:15px;font-weight:bold;color:#111827;">Gesamt</td>
          <td align="right" style="padding:12px 8px;font-size:15px;font-weight:bold;color:#16a34a;">${formatPrice(data.total)}</td>
        </tr>
      </tbody>
    </table>

    ${addressLines ? `
    <h3 style="margin:0 0 12px;font-size:15px;color:#111827;">Lieferadresse</h3>
    <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">${addressLines}</p>
    ` : ""}

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
      Sie erhalten eine separate E-Mail, sobald Ihre Bestellung versendet wurde.
      Bei Fragen helfen wir Ihnen gerne unter <a href="mailto:info@hausku.com" style="color:#16a34a;">info@hausku.com</a> weiter.
    </p>
    `
  );

  return sendEmail({
    to: data.customerEmail,
    subject: `Ihre Bestellung ${data.orderNumber} bei hausku`,
    html,
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

const ORDER_STATUS_CONTENT: Record<
  OrderStatus,
  { subject: string; emoji: string; title: string; body: string }
> = {
  SHIPPED: {
    subject: `Ihre Bestellung ist unterwegs 📦`,
    emoji: "📦",
    title: "Ihre Bestellung ist versendet!",
    body: "Ihre Bestellung wurde soeben versendet und ist auf dem Weg zu Ihnen.",
  },
  DELIVERED: {
    subject: `Ihre Bestellung wurde zugestellt ✅`,
    emoji: "✅",
    title: "Ihre Bestellung ist angekommen!",
    body: "Wir hoffen, Sie haben Freude an Ihren neuen HAUSKU-Produkten. Bei Fragen sind wir jederzeit für Sie da.",
  },
  CANCELLED: {
    subject: `Ihre Bestellung wurde storniert`,
    emoji: "❌",
    title: "Ihre Bestellung wurde storniert",
    body: "Ihre Bestellung wurde storniert. Falls Sie bereits bezahlt haben, wird der Betrag in Kürze zurückerstattet.",
  },
  REFUNDED: {
    subject: `Rückerstattung für Ihre Bestellung`,
    emoji: "💶",
    title: "Ihre Rückerstattung wurde bearbeitet",
    body: "Der Betrag für Ihre Bestellung wurde zurückerstattet. Je nach Bank kann es 3–5 Werktage dauern, bis das Geld sichtbar ist.",
  },
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

  const content = ORDER_STATUS_CONTENT[data.status];
  const greeting = data.customerName
    ? escapeHtml(data.customerName)
    : "liebe Kundin, lieber Kunde";

  const trackingLine =
    data.status === "SHIPPED" && data.trackingNumber
      ? `<p style="margin:0 0 8px;font-size:14px;color:#6b7280;line-height:1.6;">Sendungsnummer: <strong style="color:#111827;">${escapeHtml(
          data.trackingNumber
        )}</strong></p>`
      : "";

  const trackingButton =
    data.status === "SHIPPED" && data.trackingUrl
      ? `<a href="${escapeHtml(
          data.trackingUrl
        )}" style="display:inline-block;margin-top:16px;background-color:#32CD32;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;">Sendung verfolgen</a>`
      : "";

  const html = emailLayout(
    content.subject,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${content.emoji} ${content.title}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hallo ${greeting},<br /><br />
      ${content.body}
    </p>
    <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#6b7280;">Bestellnummer</p>
      <p style="margin:2px 0 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(
        data.orderNumber
      )}</p>
    </div>
    ${trackingLine}
    ${trackingButton}
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.7;">
      Bei Fragen antworten Sie einfach auf diese E-Mail oder schreiben Sie uns an
      <a href="mailto:${SMTP_FROM}" style="color:#16a34a;">${SMTP_FROM}</a>.
    </p>
    `
  );

  return sendEmail({
    to: data.customerEmail,
    replyTo: SMTP_FROM,
    subject: content.subject,
    html,
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

const RETURN_STATUS_CONTENT: Record<
  ReturnStatus,
  { subject: (n: string) => string; emoji: string; title: string; body: string }
> = {
  PENDING: {
    subject: (n) => `Ihre Retoure ${n} ist eingegangen 📬`,
    emoji: "📬",
    title: "Wir haben Ihre Retoure erhalten",
    body: "Ihre Retoure wurde bei uns erfasst. Wir prüfen die Anfrage und melden uns in der Regel innerhalb von 1–2 Werktagen.",
  },
  APPROVED: {
    subject: (n) => `Retoure ${n} genehmigt ✅`,
    emoji: "✅",
    title: "Ihre Retoure wurde genehmigt",
    body: "Sie können die Artikel nun zurücksenden. Bitte legen Sie alle Artikel vollständig bei und nutzen Sie die Rücksendeadresse aus Ihrer Bestellbestätigung.",
  },
  REJECTED: {
    subject: (n) => `Retoure ${n} abgelehnt`,
    emoji: "ℹ️",
    title: "Ihre Retoure konnte nicht genehmigt werden",
    body: "Leider können wir Ihrer Retoure nicht stattgeben. Details finden Sie in dieser E-Mail.",
  },
  RECEIVED: {
    subject: (n) => `Ihre Retoure ${n} ist angekommen 📦`,
    emoji: "📦",
    title: "Ihre Retoure ist bei uns eingetroffen",
    body: "Wir haben Ihre Rücksendung erhalten und prüfen sie. Die Rückerstattung erfolgt, sobald die Prüfung abgeschlossen ist.",
  },
  REFUNDED: {
    subject: (n) => `Rückerstattung für Retoure ${n} 💶`,
    emoji: "💶",
    title: "Ihre Rückerstattung wurde veranlasst",
    body: "Der Betrag für Ihre Retoure wurde erstattet. Je nach Bank kann es 3–5 Werktage dauern, bis das Geld sichtbar ist.",
  },
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

  const content = RETURN_STATUS_CONTENT[data.status];
  const subject = content.subject(data.returnNumber);
  const greeting = data.customerName
    ? escapeHtml(data.customerName)
    : "liebe Kundin, lieber Kunde";

  const noteHtml = data.adminNote
    ? `<div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0 0;font-size:14px;line-height:1.7;color:#374151;">${escapeHtml(
        data.adminNote
      )}</div>`
    : "";

  const html = emailLayout(
    subject,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${content.emoji} ${content.title}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hallo ${greeting},<br /><br />
      ${content.body}
    </p>
    <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#6b7280;">Retouren-Nummer</p>
      <p style="margin:2px 0 0;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(
        data.returnNumber
      )}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Bestellnummer</p>
      <p style="margin:2px 0 0;font-size:14px;font-weight:bold;color:#111827;">${escapeHtml(
        data.orderNumber
      )}</p>
    </div>
    ${noteHtml}
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.7;">
      Bei Fragen antworten Sie einfach auf diese E-Mail oder schreiben Sie uns an
      <a href="mailto:${SMTP_FROM}" style="color:#16a34a;">${SMTP_FROM}</a>.
    </p>
    `
  );

  return sendEmail({
    to: data.customerEmail,
    replyTo: SMTP_FROM,
    subject,
    html,
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
  const html = emailLayout(
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
        <td style="padding:8px 0;font-size:15px;color:#16a34a;font-weight:bold;">${formatPrice(
          data.total
        )}</td>
      </tr>
    </table>
    <a href="https://hausku.com/admin/orders" style="display:inline-block;margin-top:12px;background-color:#111827;color:#ffffff;text-decoration:none;font-weight:600;padding:10px 22px;border-radius:8px;font-size:14px;">Im Admin-Panel öffnen</a>
    `
  );

  return sendEmail({
    to: process.env.SMTP_ADMIN_ALERT_TO || "admin@hausku.com",
    subject: `🛎️ Neue Bestellung ${data.orderNumber} — ${formatPrice(data.total)}`,
    html,
  });
}
