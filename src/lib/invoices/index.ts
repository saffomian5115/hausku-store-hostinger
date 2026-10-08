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
  /** When the order was actually paid (null → not recorded). */
  paidAt?: Date | null;
  /** Payment method label (e.g. "stripe"). */
  paidMethod?: string | null;
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    vatId: string;
    /** Geschäftsführer(in) — printed below the company name. */
    manager?: string;
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
/** Right edge of the printable area — nothing may be drawn past it. */
const CONTENT_RIGHT = PAGE_W - MARGIN;
const CONTENT_WIDTH = CONTENT_RIGHT - MARGIN;
/** Height of the green header band drawn at the top of every page. */
const HEADER_BAND_H = 74;
/** y of the footer rule; content must always stop above CONTENT_BOTTOM. */
const FOOTER_TOP = 70;
const CONTENT_BOTTOM = 96;
/** Baseline-to-baseline step of the three plain rows in the totals block. */
const TOTALS_ROW_STEP = 20;
/**
 * Clear space between the VAT row's baseline and the top edge of the
 * highlighted total band — the band must never touch the row above it.
 */
const TOTALS_BAND_CLEARANCE = 16;
/** Height of the highlighted total band. */
const TOTALS_BAND_HEIGHT = 26;
/** Baseline of the total label inside its band, measured from the band bottom. */
const TOTALS_BAND_PADDING = 9;
/**
 * Vertical space the totals block needs (3 label rows + highlighted total),
 * used to reserve room for it before the tail of the document.
 */
const TOTALS_HEIGHT = 118;

const GREEN = rgb(0.184, 0.42, 0.31); // brand Forest Green #2F6B4F
const DARK_GREEN = rgb(0.145, 0.329, 0.243); // brand Deep Forest #25543E
const GRAY = rgb(0.42, 0.44, 0.47);
const LIGHT_GRAY = rgb(0.94, 0.95, 0.95);
const BORDER = rgb(0.85, 0.87, 0.88);
const BLACK = rgb(0.12, 0.14, 0.16);
const WHITE = rgb(1, 1, 1);
const LIME_SOFT = rgb(0.85, 0.98, 0.85);

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  klarna: "Klarna",
};

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

/**
 * Shorten `text` with a trailing ellipsis so its rendered width fits inside
 * `maxWidth`. Prevents long product names / IDs from being clipped at the
 * page edge.
 */
function fitText(
  font: PDFFont,
  size: number,
  text: string,
  maxWidth: number
): string {
  const safe = sanitizeForPdf(text);
  if (font.widthOfTextAtSize(safe, size) <= maxWidth) return safe;
  if (maxWidth <= 0) return "";

  const ellipsis = "\u2026";
  let cut = safe.length;
  while (
    cut > 0 &&
    font.widthOfTextAtSize(safe.slice(0, cut) + ellipsis, size) > maxWidth
  ) {
    cut--;
  }
  return cut > 0 ? safe.slice(0, cut).trimEnd() + ellipsis : "";
}

/**
 * Word-wrap `text` to `maxWidth`, hard-breaking words that are too long on
 * their own. With `maxLines`, the remaining text is folded into the last line
 * and truncated with an ellipsis.
 */
function wrapText(
  font: PDFFont,
  size: number,
  text: string,
  maxWidth: number,
  maxLines = Number.POSITIVE_INFINITY
): string[] {
  const safe = sanitizeForPdf(text).replace(/\s+/g, " ").trim();
  if (!safe) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of safe.split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) {
      lines.push(current);
      current = "";
    }
    // Single word wider than the column — hard-break it.
    let rest = word;
    while (rest && font.widthOfTextAtSize(rest, size) > maxWidth) {
      let cut = rest.length - 1;
      while (
        cut > 0 &&
        font.widthOfTextAtSize(rest.slice(0, cut), size) > maxWidth
      ) {
        cut--;
      }
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    current = rest;
  }
  if (current) lines.push(current);
  if (lines.length === 0) lines.push("");

  if (lines.length > maxLines) {
    const rest = lines.slice(maxLines - 1).join(" ");
    return [...lines.slice(0, maxLines - 1), fitText(font, size, rest, maxWidth)];
  }
  return lines;
}

function drawText(
  page: PDFPage,
  font: PDFFont,
  size: number,
  x: number,
  y: number,
  text: string,
  color: ReturnType<typeof rgb> = BLACK,
  /** Optional: truncate the text so it fits in this width. */
  maxWidth?: number
) {
  const value =
    maxWidth === undefined
      ? sanitizeForPdf(text)
      : fitText(font, size, text, maxWidth);
  if (!value) return;
  page.drawText(value, { x, y, size, font, color });
}

/** Right-align text ending at `rightX`. */
function rightText(
  page: PDFPage,
  font: PDFFont,
  size: number,
  rightX: number,
  y: number,
  text: string,
  color: ReturnType<typeof rgb> = BLACK,
  /** Optional: truncate the text so it fits in this width. */
  maxWidth?: number
) {
  const safe =
    maxWidth === undefined
      ? sanitizeForPdf(text)
      : fitText(font, size, text, maxWidth);
  if (!safe) return;
  const width = font.widthOfTextAtSize(safe, size);
  page.drawText(safe, { x: rightX - width, y, size, font, color });
}

// Column layout. The numeric columns are measured from the widest header label
// AND the widest value they will actually hold, then placed from the right
// edge inwards, so no amount can ever collide with its neighbour or run off
// the page. The table keeps a right inset (`TABLE_EDGE_PAD`) so the amounts
// are not printed flush against the table border.
const TABLE_EDGE_PAD = 14;
/** Free space required between the contents of two neighbouring columns. */
const COL_GAP = 18;
/** Space between the product name and the variant column. */
const NAME_VARIANT_GAP = 16;
/** The text columns never shrink below these widths (drives the font shrink). */
const NAME_MIN_WIDTH = 96;
const VARIANT_MIN_WIDTH = 64;
/** The variant label is short — the product name gets whatever is left over. */
const VARIANT_MAX_WIDTH = 150;
/** Absolute floors, used only when even the smallest numeric font is too wide. */
const NAME_HARD_MIN_WIDTH = 64;
const VARIANT_HARD_MIN_WIDTH = 40;
/**
 * Numeric font sizes tried from largest to smallest. The three numeric columns
 * are sized from real font metrics, so a document with freak amounts renders
 * its numbers a little smaller instead of pushing columns off the page.
 */
const NUM_FONT_SIZES = [9, 8.5, 8, 7.5, 7, 6.5, 6];
const BASE_ROW_HEIGHT = 28;
const ROW_LINE_HEIGHT = 12;
const ROW_PADDING = 16;
/** Most lines the product name / variant label is wrapped over. */
const MAX_NAME_LINES = 3;
const MAX_VARIANT_LINES = 2;

/**
 * Layout version — bump whenever this renderer's output changes.
 *
 * PDFs are written once when a document is created, so a layout change would
 * otherwise never reach documents that are already on disk. The version is part
 * of every file name: a download that finds an older path re-renders the
 * document from its stored order data (see `ensureInvoicePdf`).
 */
export const INVOICE_LAYOUT_VERSION = 3;

function pdfSuffix(): string {
  return `.v${INVOICE_LAYOUT_VERSION}.pdf`;
}

/** Resolved column geometry for one document (depends on its item data). */
type TableLayout = {
  /** Font size used for the numeric columns and their header labels. */
  numSize: number;
  posX: number;
  artikelX: number;
  nameWidth: number;
  varianteX: number;
  variantWidth: number;
  /** Right edge of each numeric column. */
  mengeRight: number;
  einzelRight: number;
  gesamtRight: number;
  /** Width of each numeric column — values are clipped to it, never past it. */
  mengeWidth: number;
  einzelWidth: number;
  gesamtWidth: number;
};

/**
 * Lay the table out from real font metrics.
 *
 * The three numeric columns are sized to their widest label/value and stacked
 * inwards from the right page edge; the product name and variant split whatever
 * space is left, the name taking priority. Should the amounts be long enough to
 * squeeze the text columns, the numeric font size is stepped down until
 * everything fits. Numbers are additionally clipped to their own column, so no
 * amount of data can push a column off the page or into its neighbour.
 */
function computeTableLayout(
  font: PDFFont,
  bold: PDFFont,
  items: InvoiceData["items"]
): TableLayout {
  const width = (f: PDFFont, size: number, text: string) =>
    f.widthOfTextAtSize(sanitizeForPdf(text), size);
  const widest = (f: PDFFont, size: number, values: string[]) =>
    values.reduce((max, value) => Math.max(max, width(f, size, value)), 0);

  const numValues = {
    menge: items.map((item) => String(item.qty)),
    einzel: items.map((item) => formatMoney(item.unitPrice)),
    gesamt: items.map((item) => formatMoney(item.total)),
  };
  const numColumns = (size: number) => ({
    menge: Math.max(width(bold, size, "Menge"), widest(font, size, numValues.menge)),
    einzel: Math.max(
      width(bold, size, "Einzelpreis"),
      widest(font, size, numValues.einzel)
    ),
    gesamt: Math.max(width(bold, size, "Gesamt"), widest(font, size, numValues.gesamt)),
  });

  const posX = MARGIN + 12;
  const posW = Math.max(
    width(bold, 9, "Pos."),
    widest(font, 9, items.map((_, i) => String(i + 1)))
  );
  const artikelX = posX + posW + NAME_VARIANT_GAP;
  const tableRight = CONTENT_RIGHT - TABLE_EDGE_PAD;
  const textMin = NAME_MIN_WIDTH + NAME_VARIANT_GAP + VARIANT_MIN_WIDTH;

  // Largest numeric font size that still leaves the text columns their room.
  const smallest = NUM_FONT_SIZES[NUM_FONT_SIZES.length - 1];
  let numSize = smallest;
  let columns = numColumns(smallest);
  for (const size of NUM_FONT_SIZES) {
    const candidate = numColumns(size);
    const needed =
      candidate.menge + candidate.einzel + candidate.gesamt + 3 * COL_GAP + textMin;
    if (artikelX + needed <= tableRight || size === smallest) {
      numSize = size;
      columns = candidate;
      break;
    }
  }

  // Last safeguard: even at the smallest font size a numeric column may not
  // take more than its share of the row — the amount gets clipped instead.
  const hardTextMin =
    NAME_HARD_MIN_WIDTH + NAME_VARIANT_GAP + VARIANT_HARD_MIN_WIDTH;
  const share = Math.max(
    24,
    (tableRight - artikelX - 3 * COL_GAP - hardTextMin) / 3
  );
  const gesamtWidth = Math.min(columns.gesamt, share);
  const einzelWidth = Math.min(columns.einzel, share);
  const mengeWidth = Math.min(columns.menge, share);

  const gesamtRight = tableRight;
  const einzelRight = gesamtRight - gesamtWidth - COL_GAP;
  const mengeRight = einzelRight - einzelWidth - COL_GAP;
  const mengeLeft = mengeRight - mengeWidth;

  // Everything left of the "Menge" column belongs to name + variant, and the
  // product name gets the larger share — it is the part of the row that must
  // stay readable, while a variant label is short by nature.
  const textSpace = Math.max(0, mengeLeft - COL_GAP - artikelX);
  const nameShare = Math.max(NAME_MIN_WIDTH, textSpace * 0.6);
  const variantNatural = widest(
    font,
    8,
    items.map((item) => item.variant || "—")
  );
  const variantWidth = Math.max(
    VARIANT_HARD_MIN_WIDTH,
    Math.min(
      VARIANT_MAX_WIDTH,
      variantNatural,
      textSpace - NAME_VARIANT_GAP - nameShare
    )
  );
  const nameWidth = Math.max(
    NAME_HARD_MIN_WIDTH,
    textSpace - NAME_VARIANT_GAP - variantWidth
  );
  const varianteX = artikelX + nameWidth + NAME_VARIANT_GAP;

  return {
    numSize,
    posX,
    artikelX,
    nameWidth,
    varianteX,
    variantWidth,
    mengeRight,
    einzelRight,
    gesamtRight,
    mengeWidth,
    einzelWidth,
    gesamtWidth,
  };
}

/** Draws a single-line table header + returns the y just below it. */
function drawTableHeader(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  y: number,
  layout: TableLayout
): number {
  const headerY = y - 24;
  const size = layout.numSize;
  page.drawRectangle({
    x: MARGIN,
    y: headerY,
    width: CONTENT_WIDTH,
    height: 26,
    color: DARK_GREEN,
  });
  drawText(page, bold, 9, layout.posX, headerY + 9, "Pos.", WHITE);
  drawText(page, bold, 9, layout.artikelX, headerY + 9, "Artikel", WHITE);
  drawText(page, bold, 9, layout.varianteX, headerY + 9, "Variante", WHITE);
  rightText(
    page,
    bold,
    size,
    layout.mengeRight,
    headerY + 9,
    "Menge",
    WHITE,
    layout.mengeWidth
  );
  rightText(
    page,
    bold,
    size,
    layout.einzelRight,
    headerY + 9,
    "Einzelpreis",
    WHITE,
    layout.einzelWidth
  );
  rightText(
    page,
    bold,
    size,
    layout.gesamtRight,
    headerY + 9,
    "Gesamt",
    WHITE,
    layout.gesamtWidth
  );
  return headerY;
}

/**
 * Wrap the cell text of one item row. The product name is wrapped first (the
 * variant label is short and must not shorten it), and the row grows with the
 * taller of the two.
 */
function layoutItemRow(
  font: PDFFont,
  item: InvoiceData["items"][number],
  layout: TableLayout
) {
  const nameLines = wrapText(
    font,
    9,
    item.name || "—",
    layout.nameWidth,
    MAX_NAME_LINES
  );
  const variantLines = wrapText(
    font,
    8,
    item.variant || "—",
    layout.variantWidth,
    MAX_VARIANT_LINES
  );
  const lines = Math.max(nameLines.length, variantLines.length, 1);
  return {
    nameLines,
    variantLines,
    rowHeight: Math.max(BASE_ROW_HEIGHT, lines * ROW_LINE_HEIGHT + ROW_PADDING),
  };
}

/** Height the given item needs, so a page break can be decided up front. */
function itemRowHeight(
  font: PDFFont,
  item: InvoiceData["items"][number],
  layout: TableLayout
): number {
  return layoutItemRow(font, item, layout).rowHeight;
}

/** Returns the y position of the bottom of the drawn row. */
function drawItemRow(
  page: PDFPage,
  font: PDFFont,
  index: number,
  item: InvoiceData["items"][number],
  y: number,
  layout: TableLayout
): number {
  const { nameLines, variantLines, rowHeight } = layoutItemRow(font, item, layout);
  const rowTop = y;
  const rowBottom = y - rowHeight;

  if (index % 2 === 1) {
    page.drawRectangle({
      x: MARGIN,
      y: rowBottom,
      width: CONTENT_WIDTH,
      height: rowHeight,
      color: LIGHT_GRAY,
    });
  }
  page.drawLine({
    start: { x: MARGIN, y: rowBottom },
    end: { x: CONTENT_RIGHT, y: rowBottom },
    thickness: 0.5,
    color: BORDER,
  });

  const textY = rowTop - 17;
  drawText(page, font, 9, layout.posX, textY, String(index + 1));
  for (let i = 0; i < nameLines.length; i++) {
    drawText(
      page,
      font,
      9,
      layout.artikelX,
      textY - i * ROW_LINE_HEIGHT,
      nameLines[i],
      BLACK
    );
  }
  for (let i = 0; i < variantLines.length; i++) {
    drawText(
      page,
      font,
      8,
      layout.varianteX,
      textY - i * ROW_LINE_HEIGHT,
      variantLines[i],
      GRAY
    );
  }
  const numSize = layout.numSize;
  rightText(
    page,
    font,
    numSize,
    layout.mengeRight,
    textY,
    String(item.qty),
    BLACK,
    layout.mengeWidth
  );
  rightText(
    page,
    font,
    numSize,
    layout.einzelRight,
    textY,
    formatMoney(item.unitPrice),
    BLACK,
    layout.einzelWidth
  );
  rightText(
    page,
    font,
    numSize,
    layout.gesamtRight,
    textY,
    formatMoney(item.total),
    BLACK,
    layout.gesamtWidth
  );

  return rowBottom;
}

function drawTotals(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  data: InvoiceData,
  y: number
): number {
  // The highlighted total band spans the full content width, but the amounts
  // keep the same right inset as the table so they are never flush against
  // the band / page edge.
  const bandRight = CONTENT_RIGHT;
  const valueRight = CONTENT_RIGHT - TABLE_EDGE_PAD;
  const labelX = bandRight - 260;

  const rows: Array<[string, string]> = [
    ["Zwischensumme", formatMoney(data.subtotal)],
    [
      "Versand",
      data.shippingCost === 0 ? "Kostenlos" : formatMoney(data.shippingCost),
    ],
    [`MwSt. (${data.vatRate}%)`, formatMoney(data.vatAmount)],
  ];

  let baseline = y - 10;
  for (const [label, value] of rows) {
    // The amount stops clear of its label, so even a freak total cannot run
    // into the label of its own row.
    const valueMaxWidth = Math.max(
      40,
      valueRight - labelX - font.widthOfTextAtSize(sanitizeForPdf(label), 10) - 12
    );
    drawText(page, font, 10, labelX, baseline, label, BLACK);
    rightText(page, font, 10, valueRight, baseline, value, BLACK, valueMaxWidth);
    baseline -= TOTALS_ROW_STEP;
  }

  // The highlighted total gets its own band, with a clear gap above it: drawn
  // against the row above, the highlight used to touch the VAT line's text.
  const lastRowBaseline = baseline + TOTALS_ROW_STEP;
  const bandTop = lastRowBaseline - TOTALS_BAND_CLEARANCE;
  const bandBottom = bandTop - TOTALS_BAND_HEIGHT;
  const totalBaseline = bandBottom + TOTALS_BAND_PADDING;

  const totalLabel = "Gesamtbetrag";
  const totalValue = formatMoney(data.total);
  const totalMaxWidth = Math.max(
    40,
    valueRight - labelX - bold.widthOfTextAtSize(sanitizeForPdf(totalLabel), 11) - 12
  );

  page.drawRectangle({
    x: labelX - 10,
    y: bandBottom,
    width: bandRight - labelX + 10,
    height: TOTALS_BAND_HEIGHT,
    color: LIME_SOFT,
  });
  drawText(page, bold, 11, labelX, totalBaseline, totalLabel, BLACK);
  rightText(
    page,
    bold,
    12,
    valueRight,
    totalBaseline,
    totalValue,
    DARK_GREEN,
    totalMaxWidth
  );

  return bandBottom - 6;
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

  // Right-hand document-meta block (top of every page).
  const metaX = CONTENT_RIGHT - 215;
  const senderMaxWidth = metaX - MARGIN - 20;

  const addPage = (): PDFPage => {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

    // Header band
    page.drawRectangle({
      x: 0,
      y: PAGE_H - HEADER_BAND_H,
      width: PAGE_W,
      height: HEADER_BAND_H,
      color: DARK_GREEN,
    });
    drawText(page, bold, 24, MARGIN, PAGE_H - 50, "HAUSKU", WHITE);
    drawText(page, font, 9, MARGIN, PAGE_H - 66, "Home & Kitchen", LIME_SOFT);

    // Sender block (top-left, below header)
    let y = PAGE_H - HEADER_BAND_H - 22;
    drawText(
      page,
      bold,
      9,
      MARGIN,
      y,
      data.company.name || "NI Intellect UG",
      BLACK,
      senderMaxWidth
    );
    y -= 14;
    if (data.company.manager) {
      drawText(
        page,
        font,
        8.5,
        MARGIN,
        y,
        `Geschäftsführung: ${data.company.manager}`,
        GRAY,
        senderMaxWidth
      );
      y -= 13;
    }
    if (data.company.address) {
      drawText(page, font, 8.5, MARGIN, y, data.company.address, GRAY, senderMaxWidth);
      y -= 13;
    }
    const contactLine = [data.company.email, data.company.phone]
      .filter(Boolean)
      .join(" · ");
    if (contactLine) {
      drawText(page, font, 8.5, MARGIN, y, contactLine, GRAY, senderMaxWidth);
      y -= 13;
    }
    if (data.company.vatId) {
      drawText(page, font, 8.5, MARGIN, y, `USt-IdNr.: ${data.company.vatId}`, GRAY, senderMaxWidth);
      y -= 13;
    }

    // Document meta (top-right). Values are RIGHT-aligned against the content
    // edge — drawing them left-aligned from the edge used to push them off the
    // page (invoice no. / order no. were cut off on the right).
    let metaY = PAGE_H - HEADER_BAND_H - 22;
    const meta: Array<[string, string]> = [
      [docLabel, data.invoiceNumber],
      ["Datum", formatDate(data.date)],
      ["Bestell-Nr.", data.orderNumber],
    ];
    if (kind === "credit_note" && data.referenceInvoiceNumber) {
      meta.push(["Bezug: Rechnung", data.referenceInvoiceNumber]);
    }
    for (const [label, value] of meta) {
      const labelWidth = font.widthOfTextAtSize(sanitizeForPdf(label), 8.5);
      drawText(page, font, 8.5, metaX, metaY, label, GRAY);
      rightText(
        page,
        bold,
        9,
        CONTENT_RIGHT,
        metaY,
        value,
        BLACK,
        CONTENT_RIGHT - metaX - labelWidth - 8
      );
      metaY -= 16;
    }

    return page;
  };

  let page = addPage();
  let y = PAGE_H - HEADER_BAND_H - 150; // start customer block

  /** Starts a continuation page and returns the y to continue drawing at. */
  const startContinuation = (offset = 130): number => {
    page = addPage();
    const top = PAGE_H - HEADER_BAND_H - offset;
    drawText(page, bold, 10, MARGIN, top, `${title} (Fortsetzung)`, GRAY);
    return top - 30;
  };

  // Customer block
  drawText(page, bold, 10, MARGIN, y, "Kundenanschrift", BLACK);
  y -= 16;
  drawText(page, font, 10, MARGIN, y, data.customerName || "—", BLACK, CONTENT_WIDTH);
  y -= 14;
  drawText(
    page,
    font,
    10,
    MARGIN,
    y,
    data.customerAddress.street || "—",
    BLACK,
    CONTENT_WIDTH
  );
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
    BLACK,
    CONTENT_WIDTH
  );
  y -= 14;
  drawText(
    page,
    font,
    10,
    MARGIN,
    y,
    data.customerAddress.country || "—",
    BLACK,
    CONTENT_WIDTH
  );
  y -= 22;

  // Title
  drawText(page, bold, 22, MARGIN, y, title, DARK_GREEN);
  y -= 30;

  // Items table (column geometry depends on this document's amounts)
  const layout = computeTableLayout(font, bold, data.items);
  y = drawTableHeader(page, font, bold, y, layout);
  for (let i = 0; i < data.items.length; i++) {
    // Break with the height this very row needs — a three-line product name
    // must not land on the footer of a full page.
    const rowHeight = itemRowHeight(font, data.items[i], layout);
    if (y - rowHeight < CONTENT_BOTTOM) {
      y = startContinuation();
      y = drawTableHeader(page, font, bold, y, layout);
    }
    y = drawItemRow(page, font, i, data.items[i], y, layout);
  }

  // Tail block (totals + payment confirmation / credit-note reason). Reserve
  // the room it needs up front, otherwise a full page ends with the totals
  // printed on top of the footer.
  const noteLines =
    kind === "invoice" && data.paidAt
      ? wrapText(
          font,
          9.5,
          `Zahlung: Bereits bezahlt via ${
            data.paidMethod
              ? PAYMENT_METHOD_LABELS[data.paidMethod.toLowerCase()] || data.paidMethod
              : "Online-Zahlung"
          } am ${formatDate(data.paidAt)}.`,
          CONTENT_WIDTH
        )
      : [];
  const reasonLines =
    kind === "credit_note" && reason
      ? wrapText(font, 9.5, reason, CONTENT_WIDTH)
      : [];
  const tailHeight =
    TOTALS_HEIGHT +
    (noteLines.length ? 20 + noteLines.length * 13 : 0) +
    (reasonLines.length ? 30 + reasonLines.length * 13 : 0);

  if (y - tailHeight < CONTENT_BOTTOM) {
    y = startContinuation(150);
  }

  // Totals
  y = drawTotals(page, font, bold, data, y - 8);

  // Payment confirmation (invoice only, when a payment is on record)
  if (noteLines.length) {
    y -= 20;
    for (const line of noteLines) {
      if (y < CONTENT_BOTTOM) y = startContinuation(150);
      drawText(page, font, 9.5, MARGIN, y, line, DARK_GREEN);
      y -= 13;
    }
  }

  // Credit note reason
  if (reasonLines.length) {
    y -= 14;
    if (y < CONTENT_BOTTOM) y = startContinuation(150);
    drawText(page, bold, 10, MARGIN, y, "Grund der Gutschrift", BLACK);
    y -= 16;
    for (const line of reasonLines) {
      if (y < CONTENT_BOTTOM) y = startContinuation(150);
      drawText(page, font, 9.5, MARGIN, y, line, BLACK);
      y -= 13;
    }
  }

  // Footer (fixed at bottom)
  for (let p = 0; p < pdfDoc.getPageCount(); p++) {
    const fp = pdfDoc.getPage(p);
    fp.drawLine({
      start: { x: MARGIN, y: FOOTER_TOP },
      end: { x: CONTENT_RIGHT, y: FOOTER_TOP },
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
    // The footer carries the legal company block — wrap it onto a second line
    // instead of cutting the Impressum off mid-sentence.
    const footerLines = wrapText(font, 7.5, footerLine || "hausku", CONTENT_WIDTH, 2);
    const firstFooterY = footerLines.length > 1 ? 58 : 54;
    footerLines.forEach((line, i) =>
      drawText(fp, font, 7.5, MARGIN, firstFooterY - i * 10, line, GRAY)
    );
    drawText(
      fp,
      font,
      7.5,
      MARGIN,
      40,
      `${title} ${data.invoiceNumber} — erstellt am ${formatDate(data.date)}`,
      GRAY,
      CONTENT_WIDTH
    );
  }

  return pdfDoc.save();
}

// ─── Public API ───────────────────────────────────────────

function savePdf(bytes: Uint8Array, filename: string): string {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
  const filePath = path.join(INVOICES_DIR, filename);
  fs.writeFileSync(filePath, bytes);
  return `/invoices/${filename}`;
}

/**
 * Generate an invoice PDF for the given data. Returns the public path.
 *
 * The path carries the layout version, so a document stored under an older
 * name is recognisable as stale and gets re-rendered on download.
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  const bytes = await buildDocument(data, "invoice");
  return savePdf(bytes, `${data.invoiceNumber}${pdfSuffix()}`);
}

/** Generate a credit note PDF. Returns the public path. */
export async function generateCreditNotePDF(
  data: InvoiceData,
  reason: string
): Promise<string> {
  const bytes = await buildDocument(data, "credit_note", reason);
  return savePdf(bytes, `${data.invoiceNumber}${pdfSuffix()}`);
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
    paidAt: Date | null;
    paymentMethod: string | null;
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
  referenceInvoiceNumber?: string,
  /** Issue date printed on the document (defaults to generation time). */
  issuedAt: Date = new Date()
): Promise<InvoiceData> {
  return {
    invoiceNumber,
    referenceInvoiceNumber,
    orderNumber: order.orderNumber,
    date: issuedAt,
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
    paidAt: order.paidAt,
    paidMethod: order.paymentMethod,
    company: {
      name: settings.companyName || "NI Intellect UG",
      email: settings.companyEmail,
      phone: settings.companyPhone,
      address: settings.companyAddress,
      vatId: settings.vatId,
      manager: settings.companyManager,
    },
  };
}

// ─── Served PDFs ──────────────────────────────────────────

/** True when `pdfPath` points at a document rendered with the current layout. */
function isCurrentLayout(pdfPath: string | null | undefined): boolean {
  return typeof pdfPath === "string" && pdfPath.endsWith(pdfSuffix());
}

/** Absolute path of a stored PDF (paths in the DB are public paths). */
function absolutePdfPath(pdfPath: string): string {
  return path.join(process.cwd(), "public", pdfPath);
}

/**
 * Absolute path of an invoice PDF in the current layout.
 *
 * Documents are rendered once when they are created, so a layout fix would
 * otherwise never reach the files that are already on disk. A stored document
 * whose path still carries an older layout version (or whose file is gone) is
 * re-rendered here from its order data — that way the shop owner and the
 * customer always download the current layout without having to trigger a
 * rebuild first.
 */
export async function ensureInvoicePdf(invoiceId: number): Promise<string | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { order: { include: { items: true } } },
  });
  if (!invoice) return null;

  if (isCurrentLayout(invoice.pdfPath)) {
    const filePath = absolutePdfPath(invoice.pdfPath!);
    if (fs.existsSync(filePath)) return filePath;
  }

  const settings = await getStoreSettings();
  const data = await buildInvoiceData(
    invoice.order,
    settings,
    invoice.invoiceNumber,
    undefined,
    invoice.issuedAt
  );
  const pdfPath = await generateInvoicePDF(data);
  await prisma.invoice.update({ where: { id: invoice.id }, data: { pdfPath } });
  return absolutePdfPath(pdfPath);
}

/** Same as `ensureInvoicePdf`, for credit notes. */
export async function ensureCreditNotePdf(
  creditNoteId: number
): Promise<string | null> {
  const creditNote = await prisma.creditNote.findUnique({
    where: { id: creditNoteId },
    include: { order: { include: { items: true, invoice: true } } },
  });
  if (!creditNote) return null;

  if (isCurrentLayout(creditNote.pdfPath)) {
    const filePath = absolutePdfPath(creditNote.pdfPath!);
    if (fs.existsSync(filePath)) return filePath;
  }

  const settings = await getStoreSettings();
  const data = await buildInvoiceData(
    creditNote.order,
    settings,
    creditNote.creditNoteNumber,
    creditNote.order.invoice?.invoiceNumber,
    creditNote.issuedAt
  );
  const pdfPath = await generateCreditNotePDF(
    data,
    creditNote.reason || "Erstattung"
  );
  await prisma.creditNote.update({
    where: { id: creditNote.id },
    data: { pdfPath },
  });
  return absolutePdfPath(pdfPath);
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
      const issuedAt = new Date();
      const data = await buildInvoiceData(
        order,
        settings,
        invoiceNumber,
        undefined,
        issuedAt
      );
      const pdfPath = await generateInvoicePDF(data);
      return await prisma.invoice.create({
        data: { orderId, invoiceNumber, pdfPath, issuedAt },
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
      const issuedAt = new Date();
      const data = await buildInvoiceData(
        order,
        settings,
        creditNoteNumber,
        order.invoice?.invoiceNumber,
        issuedAt
      );
      const pdfPath = await generateCreditNotePDF(data, reason);
      return await prisma.creditNote.create({
        data: {
          orderId,
          creditNoteNumber,
          pdfPath,
          reason,
          amount: order.total,
          issuedAt,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) continue;
      throw error;
    }
  }
  throw new Error("Gutschriftnummer konnte nicht vergeben werden");
}

/**
 * Re-render every stored invoice / credit-note PDF with the current renderer.
 *
 * A PDF is written once when its document is created, so a layout fix only
 * reaches documents generated afterwards — the files already on disk keep the
 * old (broken) layout forever. This refreshes them in place from the stored
 * order data, and is safe to run repeatedly.
 */
export async function rebuildStoredPdfs(): Promise<{
  invoices: number;
  creditNotes: number;
}> {
  const settings = await getStoreSettings();

  const invoices = await prisma.invoice.findMany({
    include: { order: { include: { items: true } } },
    orderBy: { invoiceNumber: "asc" },
  });
  for (const invoice of invoices) {
    const data = await buildInvoiceData(
      invoice.order,
      settings,
      invoice.invoiceNumber,
      undefined,
      invoice.issuedAt
    );
    const pdfPath = await generateInvoicePDF(data);
    if (pdfPath !== invoice.pdfPath) {
      await prisma.invoice.update({ where: { id: invoice.id }, data: { pdfPath } });
    }
  }

  const creditNotes = await prisma.creditNote.findMany({
    include: { order: { include: { items: true, invoice: true } } },
    orderBy: { creditNoteNumber: "asc" },
  });
  for (const creditNote of creditNotes) {
    const data = await buildInvoiceData(
      creditNote.order,
      settings,
      creditNote.creditNoteNumber,
      creditNote.order.invoice?.invoiceNumber,
      creditNote.issuedAt
    );
    const pdfPath = await generateCreditNotePDF(
      data,
      creditNote.reason || "Erstattung"
    );
    if (pdfPath !== creditNote.pdfPath) {
      await prisma.creditNote.update({
        where: { id: creditNote.id },
        data: { pdfPath },
      });
    }
  }

  return { invoices: invoices.length, creditNotes: creditNotes.length };
}
