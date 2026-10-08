import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, PDFPage, type PDFFont } from "pdf-lib";
import {
  INVOICE_LAYOUT_VERSION,
  generateCreditNotePDF,
  generateInvoicePDF,
  type InvoiceData,
} from "@/lib/invoices";

// A4 geometry as used by the renderer.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
/** Right edge of the printable area — no text may be drawn past it. */
const CONTENT_RIGHT = PAGE_W - MARGIN;
const CONTENT_BOTTOM = 96;
/** Anything drawn above this y is page content; below it, only the footer. */
const FOOTER_TEXT_MAX_Y = 60;

const INVOICES_DIR = path.join(process.cwd(), "public", "invoices");

type DrawnBox = {
  page: number;
  text: string;
  size: number;
  x: number;
  right: number;
  y: number;
};

type DrawnRect = {
  page: number;
  /** Bottom / top edge of the filled area. */
  bottom: number;
  top: number;
  color: { red: number; green: number; blue: number };
};

/** Every drawText() call made while rendering, captured off the prototype. */
let drawn: DrawnBox[] = [];
/** Every drawRectangle() call, so filled areas can be checked too. */
let rects: DrawnRect[] = [];
/** Pages in the order they were first drawn on, so rows group per page. */
let pagesSeen: PDFPage[] = [];

const proto = PDFPage.prototype as unknown as {
  drawText: (text: string, options: Record<string, unknown>) => PDFPage;
  drawRectangle: (options: Record<string, unknown>) => PDFPage;
};
const originalDrawText = proto.drawText;
const originalDrawRectangle = proto.drawRectangle;

beforeEach(() => {
  drawn = [];
  rects = [];
  pagesSeen = [];
  proto.drawText = function (this: PDFPage, text: string, options: Record<string, unknown>) {
    const font = options.font as PDFFont;
    const size = options.size as number;
    const x = options.x as number;
    const y = options.y as number;
    let page = pagesSeen.indexOf(this);
    if (page === -1) page = pagesSeen.push(this) - 1;
    drawn.push({
      page,
      text,
      size,
      x,
      right: x + font.widthOfTextAtSize(text, size),
      y,
    });
    return originalDrawText.call(this, text, options);
  };
  proto.drawRectangle = function (this: PDFPage, options: Record<string, unknown>) {
    let page = pagesSeen.indexOf(this);
    if (page === -1) page = pagesSeen.push(this) - 1;
    const y = options.y as number;
    const height = options.height as number;
    rects.push({
      page,
      bottom: y,
      top: y + height,
      color: options.color as DrawnRect["color"],
    });
    return originalDrawRectangle.call(this, options);
  };
});

afterEach(() => {
  proto.drawText = originalDrawText;
  proto.drawRectangle = originalDrawRectangle;
});

/** The lime band behind the grand total (LIME_SOFT = 0.85 / 0.98 / 0.85). */
function totalBand(): DrawnRect | undefined {
  return rects.find(
    (r) =>
      r.color &&
      Math.abs(r.color.red - 0.85) < 0.02 &&
      Math.abs(r.color.green - 0.98) < 0.02 &&
      Math.abs(r.color.blue - 0.85) < 0.02 &&
      r.top - r.bottom > 20
  );
}

function expectEverythingInsideThePage() {
  expect(drawn.length).toBeGreaterThan(10);
  for (const box of drawn) {
    expect(box.x, `"${box.text}" starts left of the page edge`).toBeGreaterThanOrEqual(0);
    expect(
      box.right,
      `"${box.text}" runs off the right page edge (${box.x.toFixed(1)} → ${box.right.toFixed(1)})`
    ).toBeLessThanOrEqual(CONTENT_RIGHT);
    if (box.y > FOOTER_TEXT_MAX_Y) {
      expect(
        box.y,
        `"${box.text}" collides with the footer area (y=${box.y.toFixed(1)})`
      ).toBeGreaterThanOrEqual(CONTENT_BOTTOM);
    }
  }
}

/** Text drawn on the same baseline (same page + y) must never overlap. */
function expectNoOverlappingText() {
  const lines = new Map<string, DrawnBox[]>();
  for (const box of drawn) {
    const key = `${box.page}|${box.y.toFixed(1)}`;
    const list = lines.get(key) ?? [];
    list.push(box);
    lines.set(key, list);
  }
  for (const list of lines.values()) {
    const sorted = [...list].sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++) {
      const left = sorted[i - 1];
      const right = sorted[i];
      expect(
        right.x,
        `"${left.text}" overlaps "${right.text}" (${left.right.toFixed(1)} > ${right.x.toFixed(1)})`
      ).toBeGreaterThanOrEqual(left.right - 0.01);
    }
  }
}

/** Row groups = the one baseline that carries every table column. */
function tableLines(): DrawnBox[][] {
  const lines = new Map<string, DrawnBox[]>();
  for (const box of drawn) {
    const key = `${box.page}|${box.y.toFixed(1)}`;
    const list = lines.get(key) ?? [];
    list.push(box);
    lines.set(key, list);
  }
  return [...lines.values()].filter((list) => list.length >= 5);
}

/** Amounts must keep clear of the table border, not sit flush on it. */
function expectTableHasColumnInset() {
  const rows = tableLines();
  expect(rows.length).toBeGreaterThan(1); // header + at least one item row
  for (const row of rows) {
    const rightEdge = Math.max(...row.map((box) => box.right));
    expect(
      rightEdge,
      `table column "${row.reduce((a, b) => (a.right > b.right ? a : b)).text}" sits flush on the table edge`
    ).toBeLessThanOrEqual(CONTENT_RIGHT - 13);
  }
}

function makeInvoiceData(overrides: Partial<InvoiceData> = {}): InvoiceData {
  return {
    invoiceNumber: "RE-2026-0042",
    orderNumber: "hausku-20261006-1234",
    date: new Date("2026-10-06T10:00:00Z"),
    customerName: "Maximilian-Alexander Mustermann-Langnese",
    customerEmail: "kunde@example.com",
    customerAddress: {
      street: "Roggenring 26, Hinterhaus, Aufgang B, 3. Obergeschoss links",
      city: "Hamberge",
      postalCode: "23619",
      country: "Deutschland",
    },
    items: [
      {
        name: "Edelstahl Brotdose mit Fächern, auslaufsicher, spülmaschinengeeignet, 1,2 Liter",
        variant: "Farbe: Salbeigrün / Größe: L / Extra Zubehörset",
        qty: 2,
        unitPrice: 1234.56,
        total: 2469.12,
      },
    ],
    subtotal: 2469.12,
    shippingCost: 4.99,
    vatRate: 19,
    vatAmount: 395.07,
    total: 2879.18,
    currency: "EUR",
    paidAt: new Date("2026-10-06T10:05:00Z"),
    paidMethod: "stripe",
    company: {
      name: "NI Intellect UG (haftungsbeschränkt)",
      email: "saleshub@niintellect.de",
      phone: "+49 176 45972009",
      address: "Roggenring 26, 23619 Hamberge, Deutschland",
      vatId: "DE367665227",
      manager: "Nazia Iqbal",
    },
    ...overrides,
  };
}

describe("invoice PDF layout", () => {
  it("keeps every line inside the page for pathological customer data", async () => {
    await generateInvoicePDF(makeInvoiceData());

    expectEverythingInsideThePage();
    expectNoOverlappingText();
  });

  it("lays the item table out without collisions and with a right inset", async () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      name: `Haushaltshelfer Modell ${i + 1} aus recyceltem Edelstahl, besonders langlebig und spülmaschinengeeignet`,
      variant: `Farbe: Salbeigrün / Größe: ${i % 3 === 0 ? "XXL" : "M"}`,
      qty: 987654,
      unitPrice: 999999.99,
      total: 999999.99 * 987654,
    }));

    await generateInvoicePDF(
      makeInvoiceData({
        invoiceNumber: "RE-2026-7777",
        items,
        subtotal: items[0].total,
        total: items[0].total + 395.07,
      })
    );

    expectEverythingInsideThePage();
    // No table cell may run into its neighbour (name/variant/qty/prices).
    expectNoOverlappingText();
    // The right-most column keeps its distance from the table border.
    expectTableHasColumnInset();

    // The header labels must all be present on one row, so the table is whole.
    const headerRow = tableLines()[0].map((b) => b.text);
    for (const label of ["Pos.", "Artikel", "Variante", "Menge", "Einzelpreis", "Gesamt"]) {
      expect(headerRow).toContain(label);
    }
  });

  it("keeps the totals clear of the footer when the item table fills the page", async () => {
    const items = Array.from({ length: 26 }, (_, i) => ({
      name: `Haushaltshelfer Modell ${i + 1} aus recyceltem Edelstahl, besonders langlebig`,
      variant: `Farbe: Salbeigrün / Größe: ${i % 3 === 0 ? "XL" : "M"}`,
      qty: i + 1,
      unitPrice: 1234.56,
      total: 1234.56 * (i + 1),
    }));

    const pdfPath = await generateInvoicePDF(
      makeInvoiceData({
        invoiceNumber: "RE-2026-9991",
        items,
        subtotal: items.reduce((sum, i) => sum + i.total, 0),
        total: items.reduce((sum, i) => sum + i.total, 0) + 395.07,
      })
    );

    expectEverythingInsideThePage();
    expectNoOverlappingText();

    // The totals block must be on the page, not swallowed by a page break.
    expect(drawn.some((b) => b.text.includes("Gesamtbetrag"))).toBe(true);

    const bytes = fs.readFileSync(
      path.join(process.cwd(), "public", pdfPath.replace(/^\//, ""))
    );
    const reloaded = await PDFDocument.load(bytes);
    expect(reloaded.getPageCount()).toBeGreaterThan(1);
    expect(reloaded.getPage(0).getWidth()).toBeCloseTo(PAGE_W, 1);
    expect(reloaded.getPage(0).getHeight()).toBeCloseTo(PAGE_H, 1);
  });

  it("keeps a long credit-note reason inside the page", async () => {
    await generateCreditNotePDF(
      makeInvoiceData({ invoiceNumber: "GN-2026-9992", referenceInvoiceNumber: "RE-2026-0042" }),
      "Widerruf innerhalb der 14-tägigen Frist: Der Kunde hat die Lieferung wegen " +
        "einer abweichenden Farbangabe zurückgesandt; die Ware ist unbeschädigt und " +
        "vollständig, die Erstattung erfolgt auf das ursprüngliche Zahlungsmittel."
    );

    expectEverythingInsideThePage();
    expectNoOverlappingText();
  });

  it("keeps the document meta block inside the margin for over-long ids", async () => {
    const invoiceNumber = "RE-2026-123456";
    const orderNumber = "hausku-20261006-123456789";
    await generateInvoicePDF(
      makeInvoiceData({ invoiceNumber, orderNumber })
    );

    const metaTexts = drawn.map((b) => b.text);
    // Long ids may be shortened on paper, but they must stay inside the page.
    expectEverythingInsideThePage();
    expectNoOverlappingText();
    expect(metaTexts.some((t) => t.includes(invoiceNumber) || t.includes("RE-2026"))).toBe(
      true
    );
    const orderBox = drawn.find((b) => b.text.includes("hausku-20261006"));
    expect(orderBox).toBeDefined();
    expect(orderBox!.right).toBeLessThanOrEqual(CONTENT_RIGHT);
    expect(orderBox!.x).toBeGreaterThanOrEqual(MARGIN);
  });

  it("keeps freak quantities and amounts from eating the table", async () => {
    const item = {
      name: "Haushaltshelfer aus recyceltem Edelstahl",
      variant: "Farbe: Salbeigrün / Größe: XL",
      qty: 999999999,
      unitPrice: 999999999.99,
      total: 999999999.99 * 999999999,
    };

    await generateInvoicePDF(
      makeInvoiceData({
        invoiceNumber: "RE-2026-8801",
        items: [item],
        subtotal: item.total,
        shippingCost: item.total,
        vatAmount: item.total,
        total: item.total,
      })
    );

    // Nine-digit amounts may be printed smaller, but they never leave the page,
    // never overlap the neighbouring column and never reach the table border.
    expectEverythingInsideThePage();
    expectNoOverlappingText();
    expectTableHasColumnInset();
  });

  it("prints a realistic long product name in full instead of cropping it", async () => {
    const name =
      "Edelstahl Brotdose mit Fächern, auslaufsicher, spülmaschinengeeignet, 1,2 Liter";
    const variant = "Farbe: Salbeigrün / Größe: L";

    await generateInvoicePDF(
      makeInvoiceData({
        invoiceNumber: "RE-2026-8802",
        items: [{ name, variant, qty: 2, unitPrice: 12.34, total: 24.68 }],
      })
    );

    expectEverythingInsideThePage();
    expectNoOverlappingText();

    const printed = drawn.map((b) => b.text).join(" ");
    // Nothing on the invoice is shortened with an ellipsis …
    expect(printed).not.toContain("\u2026");
    for (const word of name.split(" ")) {
      expect(printed, `"${word}" is missing from the product name`).toContain(word);
    }
    for (const word of variant.split(" ")) {
      expect(printed, `"${word}" is missing from the variant`).toContain(word);
    }
  });

  it("keeps an unbreakable product name inside the page", async () => {
    await generateInvoicePDF(
      makeInvoiceData({
        invoiceNumber: "RE-2026-8803",
        items: [
          {
            name: "Superkalifragilistisch".repeat(14),
            variant: "Sonderanfertigung-ohne-jedes-Leerzeichen-ABC",
            qty: 1,
            unitPrice: 4.99,
            total: 4.99,
          },
        ],
      })
    );

    expectEverythingInsideThePage();
    expectNoOverlappingText();
  });

  it("keeps the highlighted total band clear of the VAT row above it", async () => {
    await generateInvoicePDF(makeInvoiceData({ invoiceNumber: "RE-2026-8805" }));

    const band = totalBand();
    expect(band, "no highlighted total band was drawn").toBeDefined();

    const vat = drawn.find((b) => b.text.startsWith("MwSt."));
    expect(vat, "the VAT row is missing").toBeDefined();
    // The band's top edge stays well below the VAT row's baseline, so the
    // highlight never touches that line (descenders included).
    expect(
      vat!.y - band!.top,
      `the total band overlaps the VAT row (baseline ${vat!.y.toFixed(1)}, band top ${band!.top.toFixed(1)})`
    ).toBeGreaterThanOrEqual(14);

    // The highlighted total sits inside its band with padding on both sides.
    const total = drawn.find((b) => b.text === "Gesamtbetrag");
    expect(total, "the grand total label is missing").toBeDefined();
    expect(total!.y).toBeGreaterThanOrEqual(band!.bottom + 6);
    expect(total!.y + 9).toBeLessThanOrEqual(band!.top - 2);

    const totalValue = drawn.find((b) => b.size === 12 && b.y === total!.y);
    expect(totalValue, "the grand total amount is missing").toBeDefined();
    expect(totalValue!.y + 9).toBeLessThanOrEqual(band!.top - 2);
  });

  it("stores the PDF under a layout-versioned file name", async () => {
    const pdfPath = await generateInvoicePDF(
      makeInvoiceData({ invoiceNumber: "RE-2026-8804" })
    );

    // The version in the name is what tells a download route that a stored
    // document was rendered by an older layout and has to be re-rendered.
    expect(pdfPath).toBe(`/invoices/RE-2026-8804.v${INVOICE_LAYOUT_VERSION}.pdf`);
    expect(
      fs.existsSync(path.join(process.cwd(), "public", pdfPath.replace(/^\//, "")))
    ).toBe(true);
  });
});

afterEach(() => {
  // Remove the PDFs these tests wrote into the (gitignored) public folder.
  const written = [
    "RE-2026-0042",
    "RE-2026-7777",
    "RE-2026-9991",
    "GN-2026-9992",
    "RE-2026-123456",
    "RE-2026-8801",
    "RE-2026-8802",
    "RE-2026-8803",
    "RE-2026-8804",
    "RE-2026-8805",
  ];
  if (!fs.existsSync(INVOICES_DIR)) return;
  for (const file of fs.readdirSync(INVOICES_DIR)) {
    if (written.some((name) => file.startsWith(`${name}.`))) {
      fs.rmSync(path.join(INVOICES_DIR, file), { force: true });
    }
  }
});
