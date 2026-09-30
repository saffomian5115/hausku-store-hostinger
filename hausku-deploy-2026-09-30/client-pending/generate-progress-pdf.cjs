/**
 * HAUSKU — Progress Update PDF Generator
 * Clean English PDF for the client: what has been completed + what remains
 * on the client side (the 3 critical items from client-request.pdf).
 * Run:  node client-pending/generate-progress-pdf.cjs
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
const GREEN_OK = rgb(0.09, 0.5, 0.24);

const A4 = { w: 595.28, h: 841.89 };
const M = 52;

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

  const done = (label, detail) => {
    ensure(15);
    const size = 9.8;
    const cx = M + 6;
    const cy = y - size + 2.5;
    // check circle + drawn checkmark (WinAnsi can't encode ✓ glyph)
    page.drawCircle({ x: cx, y: cy, size: 5.2, color: GREEN_OK });
    page.drawLine({ start: { x: cx - 2.2, y: cy - 0.4 }, end: { x: cx - 0.6, y: cy - 2 }, thickness: 1.1, color: WHITE });
    page.drawLine({ start: { x: cx - 0.6, y: cy - 2 }, end: { x: cx + 2.2, y: cy + 1.8 }, thickness: 1.1, color: WHITE });
    page.drawText(label, { x: M + 18, y: y - size, size, font: bold, color: DARK });
    if (detail) {
      page.drawText(detail, { x: M + 18 + bold.widthOfTextAtSize(label, size) + 6, y: y - size, size: 9.3, font: regular, color: GRAY });
    }
    y -= 15.5;
  };

  const rule = () => {
    ensure(14);
    page.drawLine({ start: { x: M, y: y - 4 }, end: { x: A4.w - M, y: y - 4 }, thickness: 0.75, color: LINE });
    y -= 14;
  };

  const sectionHeader = (num, title, tag) => {
    ensure(58);
    page.drawRectangle({ x: M, y: y - 26, width: 26, height: 26, color: FOREST });
    page.drawText(num, { x: M + (num.length === 1 ? 9.5 : 5.5), y: y - 18.5, size: 13, font: bold, color: WHITE });
    page.drawText(title, { x: M + 36, y: y - 13, size: 13.5, font: bold, color: DARK });
    page.drawText(tag, { x: M + 36, y: y - 25, size: 8.5, font: bold, color: FOREST });
    y -= 36;
  };

  // ============ HEADER BAND ============
  const bandH = 92;
  page.drawRectangle({ x: 0, y: A4.h - bandH, width: A4.w, height: bandH, color: FOREST });
  page.drawRectangle({ x: 0, y: A4.h - bandH - 5, width: A4.w, height: 5, color: DEEP });
  page.drawText("HAUSKU", { x: M, y: A4.h - 42, size: 24, font: bold, color: WHITE });
  page.drawText("Progress Update — Webshop Development Status", { x: M, y: A4.h - 62, size: 12, font: regular, color: SOFT });
  page.drawText("Date: September 20, 2026  ·  Status: ON TRACK", { x: M, y: A4.h - 80, size: 8, font: regular, color: SOFT });
  y = A4.h - bandH - 5 - 26;

  // Intro
  para(
    "Dear Waqar,",
    { color: DARK, size: 10.5, gap: 6 }
  );
  para(
    "Here is a short update on the HAUSKU webshop. The development work is approximately 70% complete and " +
      "on schedule. All major systems — legal pages, payments infrastructure, security, customer accounts, " +
      "transactional emails and the complete new design — are finished and tested. Below you will find what " +
      "has been completed, followed by the three items we still need from your side before launch.",
    { size: 10.5, gap: 10 }
  );

  // Progress bar
  ensure(40);
  const barW = A4.w - M * 2;
  page.drawText("OVERALL PROGRESS", { x: M, y: y - 8, size: 8, font: bold, color: GRAY });
  page.drawText("~70%", { x: A4.w - M - 30, y: y - 8, size: 8, font: bold, color: FOREST });
  y -= 16;
  page.drawRectangle({ x: M, y: y - 10, width: barW, height: 10, color: SOFT });
  page.drawRectangle({ x: M, y: y - 10, width: barW * 0.7, height: 10, color: FOREST });
  y -= 24;

  rule();

  // ============ SECTION 1: COMPLETED ============
  sectionHeader("1", "Completed — Development Side", "ALL MAJOR SYSTEMS DONE AND TESTED");

  para("Legal & Compliance", { size: 10, font: bold, color: FOREST, gap: 5 });
  done("Impressum, AGB, Privacy Policy, Returns pages", "— live from Haendlerbund texts");
  done("GPSR product safety data", "— structured, per product, complete");
  done("Withdrawal form (Widerrufsformular)", "— downloadable PDF");
  done("Legal company data everywhere", "— invoices, emails, footer, contact");
  y -= 4;

  para("Design & Storefront", { size: 10, font: bold, color: FOREST, gap: 5 });
  done("Complete new design system", "— forest green brand palette, entire shop");
  done("Bilingual storefront", "— German & English throughout");
  done("Shipping logic", "— free-shipping threshold, live rates");
  done("Unsubstantiated marketing claims removed", "— legally safe wording");
  y -= 4;

  para("Customer Accounts", { size: 10, font: bold, color: FOREST, gap: 5 });
  done("Registration, login, logout", "— incl. Sign in with Google");
  done("Password reset via email", "— secure, time-limited tokens");
  done("Profile & address management", "— full create / edit / delete");
  done("DSGVO account deletion", "— one click, legally compliant");
  y -= 4;

  para("Security (Professional Hardening)", { size: 10, font: bold, color: FOREST, gap: 5 });
  done("All admin APIs protected", "— session guards on every route");
  done("Signed session cookies", "— tamper-proof (HMAC)");
  done("Rate limiting & bcrypt password hashing", "— brute-force protection");
  y -= 4;

  para("Payments & Orders", { size: 10, font: bold, color: FOREST, gap: 5 });
  done("Stripe Checkout integration ready", "— cards, Apple Pay, Google Pay");
  done("Invoices & credit notes", "— automatic PDFs, legally formatted");
  done("Returns (RMA) system", "— request to refund, fully tracked");
  y -= 4;

  para("Transactional Emails", { size: 10, font: bold, color: FOREST, gap: 5 });
  done("All emails in German + English", "— order, shipping, returns, contact, welcome, reset");
  done("Legal email footer", "— complete company block in every email");
  y -= 10;

  rule();

  // ============ SECTION 2: PENDING FROM CLIENT ============
  sectionHeader("2", "Pending — Your Side (3 Items)", "DETAILED IN SEPARATE PDF: CLIENT-REQUEST.PDF");

  para(
    "Only these three items are holding up the launch. Everything else on our side is ready.",
    { size: 10, gap: 8 }
  );

  const pending = [
    ["1.  Stripe API Keys (payments)", "test keys from dashboard.stripe.com — without these no order can be placed"],
    ["2.  AGB final approval", "confirm the adapted web-shop terms (or send revised text)"],
    ["3.  Tracking / analytics decision", "which tools (if any)? — determines the cookie consent banner"],
  ];
  for (const [label, detail] of pending) {
    ensure(28);
    const size = 10;
    page.drawRectangle({ x: M, y: y - size - 6, width: A4.w - M * 2, height: 26, color: SOFT });
    page.drawText(label, { x: M + 10, y: y - 8, size, font: bold, color: DEEP });
    page.drawText(detail, { x: M + 10, y: y - 20, size: 8.8, font: regular, color: GRAY });
    y -= 34;
  }
  y -= 4;

  para(
    "As soon as these arrive: Stripe keys > payment test (1 day)  ·  AGB > legal closed (same day)  ·  " +
      "Tracking decision > consent banner if needed (2 days). Then we fix a launch date together.",
    { size: 10, gap: 14 }
  );

  para("Best regards,", { size: 10.5, color: DARK, gap: 2 });
  para("HAUSKU Development Team", { size: 10.5, font: bold, color: FOREST, gap: 18 });

  // Footer on every page
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 44 }, end: { x: A4.w - M, y: 44 }, thickness: 0.75, color: LINE });
    p.drawText("HAUSKU Webshop  ·  NI Intellect UG (haftungsbeschraenkt)  ·  Roggenring 26, 23619 Hamberge  ·  saleshub@niintellect.de", {
      x: M, y: 32, size: 7.5, font: regular, color: GRAY,
    });
    p.drawText(`Page ${i + 1} of ${pages.length}`, {
      x: A4.w - M - 60, y: 32, size: 7.5, font: regular, color: GRAY,
    });
  });

  const bytes = await doc.save();
  const out = path.join(__dirname, "progress-update.pdf");
  fs.writeFileSync(out, bytes);
  console.log(`OK  ${out}  (${(bytes.length / 1024).toFixed(1)} KB, ${pages.length} pages)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
