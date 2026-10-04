/**
 * HAUSKU E2E Stripe checkout test (TEST MODE ONLY).
 *
 * Flow: create order -> create Stripe checkout session -> pay with test card
 * 4242... in headless Chrome -> wait for success redirect -> report.
 *
 * Run: node scripts/e2e-checkout.mjs
 * Requires: dev server on localhost:3000 + `stripe listen` running.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://localhost:3000";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ART = path.resolve("scripts/artifacts");
fs.mkdirSync(ART, { recursive: true });

const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

async function api(method, p, body) {
  const res = await fetch(BASE + p, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }
  return { status: res.status, data };
}

async function fillAny(root, selectors, value) {
  for (const sel of selectors) {
    try {
      const el = await root.$(sel);
      if (!el) continue;
      await el.click({ clickCount: 3 });
      await el.type(value, { delay: 15 });
      log(`  filled ${sel}`);
      return true;
    } catch { /* try next */ }
  }
  log(`  !! not found: ${selectors[0]}`);
  return false;
}

async function dumpForm(page, tag) {
  try {
    const fields = await page.$$eval("input, select, textarea, button", (els) =>
      els.map((e) => ({
        tag: e.tagName,
        type: e.type || "",
        ac: e.autocomplete || "",
        name: e.name || "",
        placeholder: e.placeholder || "",
        text: (e.innerText || "").slice(0, 50),
        disabled: !!e.disabled,
      }))
    );
    fs.writeFileSync(path.join(ART, `${tag}-form.json`), JSON.stringify(fields, null, 2));
    log(`  form dump saved (${fields.length} elements):`, JSON.stringify(fields.map(f => `${f.tag}[${f.ac || f.name || f.text}]`)));
  } catch (e) { log("  dump failed:", e.message); }
}

// ──1. Create order ────────────────────────────────────────────────
const TEST_EMAIL = "test.e2e@hausku.com";
log("Step 1: create order via POST /api/orders");
const order = await api("POST", "/api/orders", {
  email: TEST_EMAIL,
  phone: "+4915112345678",
  firstName: "E2E",
  lastName: "Test",
  street: "Teststrasse 1",
  city: "Berlin",
  postalCode: "10115",
  country: "DE",
  paymentMethod: "stripe",
  items: [{ variantId: 6, productId: 6, qty: 1 }],
});
log(`  status=${order.status}`, JSON.stringify(order.data));
if (order.status !== 201) { console.error("ORDER CREATION FAILED"); process.exit(1); }
const { orderId, orderNumber } = order.data;

// ──2. Create payment session ──────────────────────────────────────
log("Step 2: create Stripe session via POST /api/payments");
const pay = await api("POST", "/api/payments", { provider: "stripe", orderId });
log(`  status=${pay.status}`, JSON.stringify(pay.data));
if (pay.status !== 200 || !pay.data.url) { console.error("PAYMENT SESSION FAILED"); process.exit(1); }
const sessionId = pay.data.sessionId;
log(`  orderId=${orderId} orderNumber=${orderNumber} sessionId=${sessionId}`);

// ──3. Pay in headless Chrome ──────────────────────────────────────
log("Step 3: launching Chrome, opening Stripe checkout");
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--disable-dev-shm-usage", "--window-size=1400,1100", "--lang=de-DE"],
});
let page;
try {
  page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1100 });
  await page.goto(pay.data.url, { waitUntil: "networkidle2", timeout: 60000 });
  await page.screenshot({ path: path.join(ART, "01-checkout-loaded.png") });
  log("  checkout loaded:", page.url());

  // contact/shipping fields (page level)
  log("Step 4: filling contact + shipping form");
  if (!(await page.$('input[autocomplete="email"], input[name="email"]'))) {
    log("  email field not visible yet (may be collapsed)");
  } else {
    const emailVal = await page.$eval('input[autocomplete="email"], input[name="email"]', (el) => el.value).catch(() => "");
    if (!emailVal) await fillAny(page, ['input[autocomplete="email"]', 'input[name="email"]'], TEST_EMAIL);
  }
  await fillAny(page, ['input[autocomplete="shipping name"]', 'input[autocomplete="billing name"]', 'input[autocomplete="name"]', 'input[name="name"]', 'input[name="shipping[name]"]'], "E2E Test");
  await fillAny(page, ['input[autocomplete="shipping address-line1"]', 'input[autocomplete="address-line1"]', 'input[name="addressLine1"]'], "Teststrasse 1");
  await fillAny(page, ['input[autocomplete="shipping address-level2"]', 'input[autocomplete="address-level2"]', 'input[name="locality"]'], "Berlin");
  await fillAny(page, ['input[autocomplete="shipping postal-code"]', 'input[autocomplete="postal-code"]', 'input[name="postalCode"]'], "10115");
  // phone is optional — fill if present
  await fillAny(page, ['input[autocomplete="shipping tel"]', 'input[autocomplete="tel"]', 'input[name="phone"]'], "+4915112345678");

  // country select (native select only)
  try {
    const handled = await page.evaluate(() => {
      const s = document.querySelector('select[autocomplete="shipping country"], select[autocomplete="country"], select[name="country"]');
      if (!s) return "absent";
      if (s.value === "DE" || s.value === "Germany") return "already-DE";
      s.value = "DE";
      s.dispatchEvent(new Event("change", { bubbles: true }));
      return "set-DE";
    });
    log(`  country select: ${handled}`);
  } catch { /* ignore */ }

  // card fields live inside Stripe's iframe
  log("Step 5: waiting for card iframe...");
  let cardFrame = null;
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    for (const f of page.frames()) {
      try {
        const el = await f.$('input[autocomplete="cc-number"]');
        if (el) { cardFrame = f; break; }
      } catch { /* cross-origin frame etc. */ }
    }
    if (cardFrame) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!cardFrame) {
    log("  !! card iframe NOT found");
    await dumpForm(page, "no-card-frame");
    await page.screenshot({ path: path.join(ART, "FAIL-no-card-frame.png"), fullPage: true });
    throw new Error("card iframe not found");
  }
  log("  card iframe found");
  await fillAny(cardFrame, ['input[autocomplete="cc-name"]'], "E2E Test");
  await fillAny(cardFrame, ['input[autocomplete="cc-number"]'], "4242424242424242");
  await fillAny(cardFrame, ['input[autocomplete="cc-exp"]'], "1230");
  await fillAny(cardFrame, ['input[autocomplete="cc-csc"]'], "123");
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ART, "02-filled.png") });

  // ──4. Submit payment ──────────────────────────────────────────
  log("Step 6: clicking pay button");
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button[type="submit"]')];
    const pick =
      btns.find((b) => /bezahlen|pay now|jetzt|weiter|continue|bestell/i.test(b.innerText)) ||
      btns[btns.length - 1];
    if (!pick) return null;
    if (pick.disabled) return "disabled";
    pick.scrollIntoView();
    pick.click();
    return pick.innerText.slice(0, 40);
  });
  log(`  clicked: ${clicked}`);
  if (!clicked || clicked === "disabled") {
    await dumpForm(page, "submit-failed");
    await page.screenshot({ path: path.join(ART, "FAIL-submit.png"), fullPage: true });
    throw new Error("pay button not clickable: " + clicked);
  }

  // ──5. Wait for redirect to success page ───────────────────────
  log("Step 7: waiting for success redirect...");
  try {
    await page.waitForFunction(() => location.href.includes("/checkout/success"), { timeout: 60000 });
  } catch {
    await dumpForm(page, "no-redirect");
    await page.screenshot({ path: path.join(ART, "FAIL-no-redirect.png"), fullPage: true });
    const body = await page.evaluate(() => document.body.innerText.slice(0, 800));
    log("  !! no redirect. page text:", body);
    throw new Error("success redirect timeout");
  }
  await new Promise((r) => setTimeout(r, 2500)); // let verify API finish
  const finalUrl = page.url();
  const pageText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  await page.screenshot({ path: path.join(ART, "03-success-page.png"), fullPage: true });
  log("  landed:", finalUrl);
  log("  success page text:\n" + pageText.split("\n").map((l) => "    " + l).join("\n"));

  fs.writeFileSync(
    path.join(ART, "e2e-result.json"),
    JSON.stringify({ orderId, orderNumber, sessionId, finalUrl, pageText, ok: finalUrl.includes("/checkout/success") }, null, 2)
  );
  log("RESULT: SUCCESS — artifacts saved in", ART);
} catch (err) {
  log("RESULT: FAILED —", err.message);
  try { if (page) await page.screenshot({ path: path.join(ART, "FAIL-general.png"), fullPage: true }); } catch {}
  process.exitCode = 1;
} finally {
  await browser.close();
}
