import { NextRequest, NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

// GET /api/legal/withdrawal-form — Muster-Widerrufsformular als PDF (deutsch)

const DARK_GREEN = rgb(0.184, 0.42, 0.31);
const BLACK = rgb(0.12, 0.12, 0.12);
const GRAY = rgb(0.42, 0.45, 0.5);
const WHITE = rgb(1, 1, 1);

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 50;

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET(_request: NextRequest) {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page: PDFPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const maxWidth = PAGE_W - 2 * MARGIN;

    const ensureSpace = (needed: number) => {
      if (y - needed < MARGIN) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }
    };

    const drawLines = (
      text: string,
      opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number } = {}
    ) => {
      const size = opts.size ?? 10;
      const f = opts.bold ? bold : font;
      const color = opts.color ?? BLACK;
      for (const rawLine of text.split("\n")) {
        const lines = wrap(rawLine, f, size, maxWidth);
        for (const line of lines) {
          ensureSpace(size + 6);
          page.drawText(line, { x: MARGIN, y, size, font: f, color });
          y -= size + 4;
        }
        y -= opts.gap ?? 2;
      }
    };

    // Header band
    page.drawRectangle({
      x: 0,
      y: PAGE_H - 74,
      width: PAGE_W,
      height: 74,
      color: DARK_GREEN,
    });
    page.drawText("HAUSKU", { x: MARGIN, y: PAGE_H - 46, size: 22, font: bold, color: WHITE });

    y = PAGE_H - 74 - 40;

    drawLines("Muster-Widerrufsformular", {
      size: 18,
      bold: true,
      gap: 10,
    });

    drawLines(
      "(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)",
      { size: 10, color: GRAY, gap: 10 }
    );

    const items = [
      "An NI Intellect UG (haftungsbeschränkt), Roggenring 26, 23619 Hamberge, E-Mail-Adresse: saleshub@niintellect.de:",
      "Hiermit widerrufe(n) ich/ wir (*) den von mir/ uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/ die Erbringung der folgenden Dienstleistung (*)",
      "Bestellt am (*)/ erhalten am (*)",
      "Name des/ der Verbraucher(s)",
      "Anschrift des/ der Verbraucher(s)",
      "Unterschrift des/ der Verbraucher(s) (nur bei Mitteilung auf Papier)",
      "Datum",
    ];

    for (const item of items) {
      drawLines(`–  ${item}`, { size: 11, gap: 12 });
    }

    y -= 10;
    drawLines("(*) Unzutreffendes streichen.", {
      size: 9,
      color: GRAY,
    });

    const bytes = await pdfDoc.save();

    return new NextResponse(bytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="widerrufsformular.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/legal/withdrawal-form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
