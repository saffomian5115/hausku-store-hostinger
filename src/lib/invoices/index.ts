import "server-only";
import fs from "node:fs";
import path from "node:path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { prisma } from "@/lib/db/prisma";
import { getStoreSettings, type StoreSettings } from "@/lib/settings";

const INVOICES_DIR = path.join(process.cwd(), "public", "invoices");

export class OrderNotFoundError extends Error {
  constructor() {
    super("Bestellung nicht gefunden");
    this.name = "OrderNotFoundError";
  }
}

// ─── Data types ───────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber: string;
  referenceInvoiceNumber?: string;
  orderNumber: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  customerAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    variant: string;
    qty: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  shippingCost: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string;
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    vatId: string;
  };
}

// ─── Number generation ────────────────────────────────────

export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RE-${year}-`;
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export async function nextCreditNoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `GN-${year}-`;
  const count = await prisma.creditNote.count({
    where: { creditNoteNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

// ─── PDF rendering ────────────────────────────────────────

const PAGE_W = 595.28; // A4 width (pt)
const PAGE_H = 841.89; // A4 height (pt)
const MARGIN = 48;

const GREEN = rgb(0.196, 0.804, 0.196); // brand lime #32CD32
const DARK_GREEN = rgb(0.059, 0.165, 0.11); // brand #0F2A1C
const GRAY = rgb(0.42, 0.44, 0.47);
const LIGHT_GRAY = rgb(0.94, 0.95, 0.95);
const BORDER = rgb(0.85, 0.87, 0.88);
const BLACK = rgb(0.12, 0.14, 0.16);
const WHITE = rgb(1, 1, 1);
const LIME_SOFT = rgb(0.85, 0.98, 0.85);

function formatMoney(amount: number): string {
  return amount.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Chars outside Latin-1 that pdf-lib's WinAnsi standard fonts DO support. */
const WINANSI_EXTRA =
  "\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\u2122";

/**
 * Map characters the WinAnsi standard fonts can't encode to safe equivalents,
 * so a stray emoji / corrupted char in the DB never breaks PDF generation.
 */
function sanitizeForPdf(text: string): string {
  return [...text]
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      if (code === 0x00a0 || code === 0x202f) return " "; // (narrow) nbsp
      if (code <= 0xff) return ch; // Latin-1 (ä ö ü ß …)
      if (WINANSI_EXTRA.includes(ch)) return ch; // € – — “ ” …
      return "?"; // emoji, replacement char, etc.
    })
    .join("");
}

function drawText(
  page: PDFPage,
  font: PDFFont,
  size: number,
  x: number,
  y: number,
  text: string,
  color: ReturnType<typeof rgb> = BLACK
) {
  page.drawText(sanitizeForPdf(text), { x, y, size, font, color });
}

/** Right-align text ending at `rightX`. */
function rightText(
  page: PDFPage,
  font: PDFFont,
  size: number,
  rightX: number,
  y: number,
  text: string,
  color: ReturnType<typeof rgb> = BLACK
) {
  const safe = sanitizeForPdf(text);
  const width = font.widthOfTextAtSize(safe, size);
  page.drawText(safe, { x: rightX - width, y, size, font, color });
}

// Column layout (right edge of each numeric column)
const TABLE_RIGHT = PAGE_W - MARGIN; // 547
const COLS = {
  pos: { x: MARGIN + 10 },
  artikel: { x: MARGIN + 50 },
  variante: { x: MARGIN + 230 },
  menge: { right: MARGIN + 390 },
  einzel: { right: MARGIN + 470 },
  gesamt: { right: TABLE_RIGHT },
};

/** Draws a single-line table header + returns the y just below it. */
function drawTableHeader(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  y: number
): number {
  const headerY = y - 24;
  page.drawRectangle({
    x: MARGIN,
    y: headerY,
    width: PAGE_W - MARGIN * 2,
    height: 26,
    color: DARK_GREEN,
  });
  drawText(page, bold, 9, COLS.pos.x, headerY + 9, "Pos.", WHITE);
  drawText(page, bold, 9, COLS.artikel.x, headerY + 9, "Artikel", WHITE);
  drawText(page, bold, 9, COLS.variante.x, headerY + 9, "Variante", WHITE);
  rightText(page, bold, 9, COLS.menge.right, headerY + 9, "Menge", WHITE);
  rightText(page, bold, 9, COLS.einzel.right, headerY + 9, "Einzelpreis", WHITE);
  rightText(page, bold, 9, COLS.gesamt.right, headerY + 9, "Gesamt", WHITE);
  return headerY;
}

/** Returns the y position of the bottom of the drawn row. */
function drawItemRow(
  page: PDFPage,
  font: PDFFont,
  index: number,
  item: InvoiceData["items"][number],
  y: number
): number {
  const rowTop = y;
  const rowHeight = 28;
  const rowBottom = y - rowHeight;

  if (index % 2 === 1) {
    page.drawRectangle({
      x: MARGIN,
      y: rowBottom,
      width: PAGE_W - MARGIN * 2,
      height: rowHeight,
      color: LIGHT_GRAY,
    });
  }
  page.drawLine({
    start: { x: MARGIN, y: rowBottom },
    end: { x: PAGE_W - MARGIN, y: rowBottom },
    thickness: 0.5,
    color: BORDER,
  });

  const textY = rowTop - 17;
  drawText(page, font, 9, COLS.pos.x, textY, String(index + 1));
  drawText(page, font, 9, COLS.artikel.x, textY, item.name, BLACK);
  drawText(page, font, 8, COLS.variante.x, textY, item.variant || "—", GRAY);
  rightText(page, font, 9, COLS.menge.right, textY, String(item.qty), BLACK);
  rightText(page, font, 9, COLS.einzel.right, textY, formatMoney(item.unitPrice), BLACK);
  rightText(page, font, 9, COLS.gesamt.right, textY, formatMoney(item.total), BLACK);

  return rowBottom;
}

function drawTotals(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  data: InvoiceData,
  y: number
): number {
  const right = PAGE_W - MARGIN;
  const labelX = right - 260;
  let cursor = y - 10;

  const rows: Array<[string, string, boolean]> = [
    ["Zwischensumme", formatMoney(data.subtotal), false],
    [
      "Versand",
      data.shippingCost === 0 ? "Kostenlos" : formatMoney(data.shippingCost),
      false,
    ],
    [`MwSt. (${data.vatRate}%)`, formatMoney(data.vatAmount), false],
    ["Gesamtbetrag", formatMoney(data.total), true],
  ];

  for (const [label, value, isTotal] of rows) {
    if (isTotal) {
      page.drawRectangle({
        x: labelX - 10,
        y: cursor - 4,
        width: right - labelX + 10,
        height: 24,
        color: LIME_SOFT,
      });
      drawText(page, bold, 11, labelX, cursor + 2, label, BLACK);
      rightText(page, bold, 12, right, cursor + 2, value, DARK_GREEN);
      cursor -= 30;
    } else {
      drawText(page, font, 10, labelX, cursor, label, BLACK);
      rightText(page, font, 10, right, cursor, value, BLACK);
      cursor -= 20;
    }
  }
  return cursor;
}

async function buildDocument(
  data: InvoiceData,
  kind: "invoice" | "credit_note",
  reason?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const title = kind === "invoice" ? "RECHNUNG" : "GUTSCHRIFT";
  const docLabel = kind === "invoice" ? "Rechnungs-Nr." : "Gutschrift-Nr.";

  const addPage = (): PDFPage => {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

    // Header band
    page.drawRectangle({
      x: 0,
      y: PAGE_H - 74,
      width: PAGE_W,
      height: 74,
      color: DARK_GREEN,
    });
    drawText(page, bold, 24, MARGIN, PAGE_H - 50, "HAUSKU", WHITE);
    drawText(page, font, 9, MARGIN, PAGE_H - 66, "Home & Kitchen", LIME_SOFT);

    // Sender block (top-left, below header)
    let y = PAGE_H - 74 - 22;
    drawText(page, bold, 9, MARGIN, y, data.company.name || "NI Intellect UG", BLACK);
    y -= 14;
    if (data.company.address) {
      drawText(page, font, 8.5, MARGIN, y, data.company.address, GRAY);
      y -= 13;
    }
    const contactLine = [data.company.email, data.company.phone]
      .filter(Boolean)
      .join(" · ");
    if (contactLine) {
      drawText(page, font, 8.5, MARGIN, y, contactLine, GRAY);
      y -= 13;
    }
    if (data.company.vatId) {
      drawText(page, font, 8.5, MARGIN, y, `USt-IdNr.: ${data.company.vatId}`, GRAY);
      y -= 13;
    }

    // Document meta (top-right)
    const metaX = PAGE_W - MARGIN - 170;
    let metaY = PAGE_H - 74 - 22;
    const meta: Array<[string, string]> = [
      [docLabel, data.invoiceNumber],
      ["Datum", formatDate(data.date)],
      ["Bestell-Nr.", data.orderNumber],
    ];
    if (kind === "credit_note" && data.referenceInvoiceNumber) {
      meta.push(["Bezug: Rechnung", data.referenceInvoiceNumber]);
    }
    for (const [label, value] of meta) {
      drawText(page, font, 8.5, metaX, metaY, label, GRAY);
      drawText(page, bold, 9, PAGE_W - MARGIN, metaY, value, BLACK);
      metaY -= 16;
    }

    return page;
  };

  let page = addPage();
  let y = PAGE_H - 74 - 150; // start customer block

  // Customer block
  drawText(page, bold, 10, MARGIN, y, "Kundenanschrift", BLACK);
  y -= 16;
  drawText(page, font, 10, MARGIN, y, data.customerName || "—", BLACK);
  y -= 14;
  drawText(page, font, 10, MARGIN, y, data.customerAddress.street || "—", BLACK);
  y -= 14;
  drawText(
    page,
    font,
    10,
    MARGIN,
    y,
    [data.customerAddress.postalCode, data.customerAddress.city]
      .filter(Boolean)
      .join(" ") || "—",
    BLACK
  );
  y -= 14;
  drawText(page, font, 10, MARGIN, y, data.customerAddress.country || "—", BLACK);
  y -= 22;

  // Title
  drawText(page, bold, 22, MARGIN, y, title, DARK_GREEN);
  y -= 30;

  // Items table
  y = drawTableHeader(page, font, bold, y);
  for (let i = 0; i < data.items.length; i++) {
    if (y - 28 < 140) {
      // new page
      page = addPage();
      y = PAGE_H - 74 - 130;
      drawText(page, bold, 10, MARGIN, y, title + " (Fortsetzung)", GRAY);
      y -= 30;
      y = drawTableHeader(page, font, bold, y);
    }
    y = drawItemRow(page, font, i, data.items[i], y);
  }

  // Totals
  y = drawTotals(page, font, bold, data, y - 8);

  // Credit note reason
  if (kind === "credit_note" && reason) {
    y -= 14;
    drawText(page, bold, 10, MARGIN, y, "Grund der Gutschrift", BLACK);
    y -= 16;
    const wrapped = wrapText(reason, 90);
    for (const line of wrapped) {
      drawText(page, font, 9.5, MARGIN, y, line, BLACK);
      y -= 13;
    }
  }

  // Footer (fixed at bottom)
  for (let p = 0; p < pdfDoc.getPageCount(); p++) {
    const fp = pdfDoc.getPage(p);
    fp.drawLine({
      start: { x: MARGIN, y: 70 },
      end: { x: PAGE_W - MARGIN, y: 70 },
      thickness: 0.5,
      color: BORDER,
    });
    const footerLine = [
      data.company.name,
      data.company.address,
      data.company.email,
      data.company.phone,
      data.company.vatId ? `USt-IdNr.: ${data.company.vatId}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    drawText(fp, font, 7.5, MARGIN, 54, footerLine || "hausku", GRAY);
    drawText(
      fp,
      font,
      7.5,
      MARGIN,
      42,
      `${title} ${data.invoiceNumber} — erstellt am ${formatDate(data.date)}`,
      GRAY
    );
  }

  return pdfDoc.save();
}

/** Simple word-wrap helper (approximate char width for Helvetica). */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─── Public API ───────────────────────────────────────────

function savePdf(bytes: Uint8Array, filename: string): string {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
  const filePath = path.join(INVOICES_DIR, filename);
  fs.writeFileSync(filePath, bytes);
  return `/invoices/${filename}`;
}

/** Generate an invoice PDF for the given data. Returns the public path. */
export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  const bytes = await buildDocument(data, "invoice");
  return savePdf(bytes, `${data.invoiceNumber}.pdf`);
}

/** Generate a credit note PDF. Returns the public path. */
export async function generateCreditNotePDF(
  data: InvoiceData,
  reason: string
): Promise<string> {
  const bytes = await buildDocument(data, "credit_note", reason);
  return savePdf(bytes, `${data.invoiceNumber}.pdf`);
}

/** Map an order (+ settings) to InvoiceData. */
export async function buildInvoiceData(
  order: {
    orderNumber: string;
    subtotal: number;
    shippingCost: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    currency: string;
    createdAt: Date;
    guestName: string | null;
    guestEmail: string | null;
    shippingName: string | null;
    shippingStreet: string | null;
    shippingCity: string | null;
    shippingPostal: string | null;
    shippingCountry: string | null;
    items: Array<{
      productName: string;
      variantLabel: string | null;
      qty: number;
      unitPrice: number;
    }>;
  },
  settings: StoreSettings,
  invoiceNumber: string,
  referenceInvoiceNumber?: string
): Promise<InvoiceData> {
  return {
    invoiceNumber,
    referenceInvoiceNumber,
    orderNumber: order.orderNumber,
    date: order.createdAt,
    customerName: order.guestName || order.shippingName || "",
    customerEmail: order.guestEmail || "",
    customerAddress: {
      street: order.shippingStreet || "",
      city: order.shippingCity || "",
      postalCode: order.shippingPostal || "",
      country: order.shippingCountry || "DE",
    },
    items: order.items.map((item) => ({
      name: item.productName,
      variant: item.variantLabel || "",
      qty: item.qty,
      unitPrice: Number(item.unitPrice),
      total: Number(item.unitPrice) * item.qty,
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    vatRate: Number(order.vatRate),
    vatAmount: Number(order.vatAmount),
    total: Number(order.total),
    currency: order.currency,
    company: {
      name: settings.companyName || "NI Intellect UG",
      email: settings.companyEmail,
      phone: settings.companyPhone,
      address: settings.companyAddress,
      vatId: settings.vatId,
    },
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

/**
 * Generate + store an invoice for an order (idempotent — returns the existing
 * invoice if one already exists).
 */
export async function createInvoiceForOrder(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, invoice: true },
  });
  if (!order) throw new OrderNotFoundError();
  if (order.invoice) return order.invoice;

  const settings = await getStoreSettings();

  for (let attempt = 0; attempt < 3; attempt++) {
    const invoiceNumber = await nextInvoiceNumber();
    try {
      const data = await buildInvoiceData(
        order,
        settings,
        invoiceNumber
      );
      const pdfPath = await generateInvoicePDF(data);
      return await prisma.invoice.create({
        data: { orderId, invoiceNumber, pdfPath },
      });
    } catch (error) {
      if (isUniqueViolation(error)) continue;
      throw error;
    }
  }
  throw new Error("Rechnungsnummer konnte nicht vergeben werden");
}

/**
 * Generate + store a credit note for an order (best-effort duplicate guard).
 */
export async function createCreditNoteForOrder(
  orderId: number,
  reason = "Erstattung"
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, invoice: true },
  });
  if (!order) throw new OrderNotFoundError();

  const settings = await getStoreSettings();

  for (let attempt = 0; attempt < 3; attempt++) {
    const creditNoteNumber = await nextCreditNoteNumber();
    try {
      const data = await buildInvoiceData(
        order,
        settings,
        creditNoteNumber,
        order.invoice?.invoiceNumber
      );
      const pdfPath = await generateCreditNotePDF(data, reason);
      return await prisma.creditNote.create({
        data: {
          orderId,
          creditNoteNumber,
          pdfPath,
          reason,
          amount: order.total,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) continue;
      throw error;
    }
  }
  throw new Error("Gutschriftnummer konnte nicht vergeben werden");
}
