/**
 * HAUSKU — Client Request PDF Generator
 * Generates client-pending/client-request.pdf with ONLY the 3 critical items:
 *   #16 Stripe API keys, #3 AGB final sign-off, #22 Tracking/analytics decision.
 * Run:  node client-pending/generate-request-pdf.cjs
 */
const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

// Brand palette (forest green system)
const FOREST = rgb(0.184, 0.42, 0.31); // #2F6B4F
const DEEP = rgb(0.145, 0.329, 0.243); // #25543E
const DARK = rgb(0.122, 0.161, 0.2); // #1F2933
const GRAY = rgb(0.294, 0.333, 0.388); // #4B5563
const SOFT = rgb(0.867, 0.922, 0.851); // #DDEBD9
const LINE = rgb(0.898, 0.906, 0.922); // #E5E7EB
const WHITE = rgb(1, 1, 1);

const A4 = { w: 595.28, h: 841.89 };
const M = 52; // page margin

async function main() {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([A4.w, A4.h]);
  let y = A4.h;

  const wrap = (text, font, size, maxWidth) => {
    const out = [];
    for (const para of text.split("\n")) {
      const words = para.split(" ");
      let cur = "";
      for (const w of words) {
        const test = cur ? cur + " " + w : w;
        if (font.widthOfTextAtSize(test, size) <= maxWidth) cur = test;
        else {
          if (cur) out.push(cur);
          cur = w;
        }
      }
      if (cur) out.push(cur);
      if (para === "") out.push("");
    }
    return out;
  };

  const ensure = (need) => {
    if (y - need >= 60) return;
    page = doc.addPage([A4.w, A4.h]);
    y = A4.h - M;
  };

  const para = (text, { size = 10, font = regular, color = GRAY, indent = 0, gap = 4, width } = {}) => {
    const maxW = width ?? A4.w - M * 2 - indent;
    for (const line of wrap(text, font, size, maxW)) {
      ensure(size + gap);
      page.drawText(line, { x: M + indent, y: y - size, size, font, color });
      y -= size + gap;
    }
  };

  const rule = () => {
    ensure(14);
    page.drawLine({
      start: { x: M, y: y - 4 },
      end: { x: A4.w - M, y: y - 4 },
      thickness: 0.75,
      color: LINE,
    });
    y -= 14;
  };

  const checkbox = (label, indent = 0, boldLabel = false) => {
    ensure(16);
    const size = 10;
    page.drawRectangle({
      x: M + indent,
      y: y - size - 2.5,
      width: 9,
      height: 9,
      borderColor: FOREST,
      borderWidth: 1.2,
      color: WHITE,
    });
    const textX = M + indent + 15;
    const text = label;
    page.drawText(text, {
      x: textX,
      y: y - size,
      size,
      font: boldLabel ? bold : regular,
      color: DARK,
    });
    y -= 16;
  };

  const sectionHeader = (num, title, tag) => {
    ensure(58);
    // number badge
    page.drawRectangle({ x: M, y: y - 26, width: 26, height: 26, color: FOREST });
    page.drawText(num, {
      x: M + (num.length === 1 ? 9.5 : 6.5),
      y: y - 18.5,
      size: 13,
      font: bold,
      color: WHITE,
    });
    page.drawText(title, { x: M + 36, y: y - 13, size: 13.5, font: bold, color: DARK });
    page.drawText(tag, { x: M + 36, y: y - 25, size: 8.5, font: bold, color: FOREST });
    y -= 36;
  };

  const keyRow = (mono, desc) => {
    ensure(16);
    const size = 10;
    page.drawRectangle({
      x: M + 14,
      y: y - size - 3,
      width: 200,
      height: 13.5,
      color: SOFT,
    });
    page.drawText(mono, { x: M + 20, y: y - size, size: 9.5, font: bold, color: DEEP });
    page.drawText(desc, { x: M + 222, y: y - size, size: 9.5, font: regular, color: GRAY });
    y -= 16;
  };

  // ============ HEADER BAND ============
  const bandH = 92;
  page.drawRectangle({ x: 0, y: A4.h - bandH, width: A4.w, height: bandH, color: FOREST });
  page.drawRectangle({ x: 0, y: A4.h - bandH - 5, width: A4.w, height: 5, color: DEEP });
  page.drawText("HAUSKU", { x: M, y: A4.h - 42, size: 24, font: bold, color: WHITE });
  page.drawText("Webshop Launch — Items Required from Client", {
    x: M,
    y: A4.h - 62,
    size: 12,
    font: regular,
    color: SOFT,
  });
  page.drawText("Document: 01 of 01  ·  Status: FINAL REQUEST", {
    x: M,
    y: A4.h - 80,
    size: 8,
    font: regular,
    color: SOFT,
  });
  y = A4.h - bandH - 5 - 28;

  // Meta block
  para("To:      Waqar Ali Anjam — NI Intellect UG (haftungsbeschraenkt)", { color: DARK, size: 10, gap: 2 });
  para("From:    HAUSKU Development Team", { color: DARK, size: 10, gap: 2 });
  para("Date:    September 19, 2026", { color: DARK, size: 10, gap: 10 });

  para(
    "Dear Waqar,",
    { color: DARK, size: 10.5, gap: 6 }
  );
  para(
    "The HAUSKU webshop is nearly complete: legal pages, payment infrastructure, security hardening, " +
      "transactional emails and the new design system are all implemented and tested. Before we can schedule " +
      "the launch, we need exactly THREE things from your side. These are the only launch blockers remaining — " +
      "nothing else is holding up development.",
    { size: 10.5, gap: 14 }
  );

  // ============ SECTION 1 ============
  sectionHeader("1", "Stripe API Keys (Payments)", "PRIORITY: CRITICAL — WITHOUT THIS, NO ORDER CAN BE PLACED");
  para(
    "Why we need it: All payment code is ready, but the keys in the environment are placeholders. As soon as " +
      "real credentials are configured, payments work end-to-end.",
    { size: 10, gap: 8 }
  );
  para("Please provide (test mode now, live mode at launch):", { size: 10, color: DARK, gap: 6 });
  keyRow("STRIPE_SECRET_KEY", "begins with sk_test_");
  keyRow("STRIPE_PUBLISHABLE_KEY", "begins with pk_test_");
  keyRow("STRIPE_WEBHOOK_SECRET", "begins with whsec_");
  y -= 2;
  para(
    "Where to find them: Log in at dashboard.stripe.com  >  Developers  >  API Keys  >  copy the test-mode keys " +
      "(click 'Reveal test key' for the secret key).",
    { size: 9.5, gap: 6 }
  );
  para(
    "Once received, we will run a full payment test (test card + webhook verification) before going live.",
    { size: 9.5, gap: 12 }
  );

  rule();

  // ============ SECTION 2 ============
  sectionHeader("2", "AGB (Terms & Conditions) — Final Approval", "PRIORITY: CRITICAL — LAST LEGAL RISK BEFORE LAUNCH");
  para(
    "Why we need it: The AGB text was taken from the Haendlerbund template and adapted from eBay to a web shop. " +
      "German law expects the published terms to match the actual shop. Your final sign-off removes the last " +
      "open legal risk.",
    { size: 10, gap: 8 }
  );
  para("Please confirm one of the following:", { size: 10, color: DARK, gap: 6 });
  checkbox("Approved as adapted — publish the current web-shop version");
  checkbox("Revised text follows — you send the final wording and we implement it");
  y -= 2;
  para("Additionally, please confirm the Datenschutzerklaerung (privacy policy) matches your actual business practices.", {
    size: 9.5,
    gap: 12,
  });

  rule();

  // ============ SECTION 3 ============
  sectionHeader("3", "Tracking & Analytics Decision (Cookie Consent)", "PRIORITY: CRITICAL — DETERMINES CONSENT BANNER SCOPE");
  para(
    "Why we need it: German law (TTDSG / DSGVO) requires a cookie consent banner whenever tracking tools are used. " +
      "Currently NO tracking is installed. Your decision here tells us whether to build the consent banner and " +
      "which services to integrate.",
    { size: 10, gap: 8 }
  );
  para("Tick everything you would like — or tick 'No tracking':", { size: 10, color: DARK, gap: 6 });
  para("Analytics / Advertising:", { size: 9.5, color: FOREST, indent: 14, gap: 5, font: bold });
  checkbox("Google Analytics 4", 14);
  checkbox("Google Ads conversion tracking", 14);
  checkbox("Meta (Facebook) Pixel", 14);
  checkbox("Hotjar or other heatmap tool:  ..........................................", 14);
  para("Other:", { size: 9.5, color: FOREST, indent: 14, gap: 5, font: bold });
  checkbox("Newsletter integration   Provider: ...................................", 14);
  checkbox("Chat widget              Provider: ...................................", 14);
  y -= 4;
  checkbox("NO tracking — launch without analytics (no consent banner needed; can be added later)", 0, true);
  y -= 8;

  rule();

  // ============ NEXT STEPS ============
  sectionHeader("+", "What Happens Next", "");
  para(
    "1.  Day 1-2:  Stripe keys arrive  >  configure, run payment tests end-to-end.\n" +
      "2.  Day 1:    AGB sign-off arrives  >  legal pages final, risk closed.\n" +
      "3.  Day 2-3:  Tracking decision arrives  >  consent banner built if needed.\n" +
      "4.            We set a firm launch date together.",
    { size: 10, color: DARK, gap: 10 }
  );
  para(
    "If anything is unclear, just reply to this message — we are happy to walk you through any item step by step.",
    { size: 10, gap: 14 }
  );

  para("Best regards,", { size: 10.5, color: DARK, gap: 2 });
  para("HAUSKU Development Team", { size: 10.5, font: bold, color: FOREST, gap: 18 });

  // Footer on every page
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: M, y: 44 },
      end: { x: A4.w - M, y: 44 },
      thickness: 0.75,
      color: LINE,
    });
    p.drawText("HAUSKU Webshop  ·  NI Intellect UG (haftungsbeschraenkt)  ·  Roggenring 26, 23619 Hamberge  ·  saleshub@niintellect.de", {
      x: M,
      y: 32,
      size: 7.5,
      font: regular,
      color: GRAY,
    });
    p.drawText(`Page ${i + 1} of ${pages.length}`, {
      x: A4.w - M - 60,
      y: 32,
      size: 7.5,
      font: regular,
      color: GRAY,
    });
  });

  const bytes = await doc.save();
  const out = path.join(__dirname, "client-request.pdf");
  fs.writeFileSync(out, bytes);
  console.log(`OK  ${out}  (${(bytes.length / 1024).toFixed(1)} KB, ${pages.length} pages)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
