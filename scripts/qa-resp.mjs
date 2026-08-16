// Phase 5 QA — responsiveness (390/768/1440) + DE/EN switch testing
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const CDP_PORT = 9227;
const BASE = process.env.BASE_URL || "http://localhost:3000";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "qa-resp-"));
const RESULTS = [];
const FAILS = [];

const chrome = spawn(
  CHROME,
  [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profile}`,
    "--headless=new",
    "--no-first-run",
    "--disable-gpu",
  ],
  { stdio: "ignore" }
);

let wsUrl = null;
for (let i = 0; i < 60; i++) {
  try {
    const res = await fetch(`http://localhost:${CDP_PORT}/json/list`);
    const targets = await res.json();
    const page = targets.find((t) => t.type === "page");
    if (page) {
      wsUrl = page.webSocketDebuggerUrl;
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 250));
}
if (!wsUrl) {
  console.error("NO DEVTOOLS");
  process.exit(1);
}

const ws = new WebSocket(wsUrl);
let msgId = 0;
const pending = new Map();
const consoleMsgs = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
  if (m.method === "Runtime.consoleAPICalled") {
    const txt = m.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
    if (!/Download the React DevTools|HMR|Fast Refresh/.test(txt)) consoleMsgs.push(txt);
  }
  if (m.method === "Runtime.exceptionThrown") {
    consoleMsgs.push(`[EXCEPTION] ${m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text}`);
  }
};
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
const evalJs = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) return { __error: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text };
  return r.result?.result?.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send("Page.enable");
await send("Runtime.enable");

async function setViewport(width, height = 900) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
}

const PAGES = ["/", "/catalog", "/product/laptopkissen-grau", "/cart", "/checkout", "/contact", "/about", "/login", "/register", "/returns", "/admin/login"];

// ─── Responsiveness check ───
async function respCheck(width) {
  await setViewport(width);
  const out = [];
  for (const page of PAGES) {
    await send("Page.navigate", { url: `${BASE}${page}` });
    await sleep(width < 768 ? 7000 : 5000);
    const r = await evalJs(`(() => {
      const vw = document.documentElement.clientWidth;
      const sw = document.documentElement.scrollWidth;
      const overflow = sw - vw;
      // worst offenders
      const offenders = [];
      if (overflow > 0) {
        for (const el of document.querySelectorAll('body *')) {
          const rect = el.getBoundingClientRect();
          if (rect.right > vw + 2 && rect.width > 0) {
            offenders.push({
              tag: el.tagName,
              cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 70),
              right: Math.round(rect.right),
              left: Math.round(rect.left),
              w: Math.round(rect.width),
            });
          }
        }
        offenders.sort((a, b) => b.right - a.right);
      }
      // nav visibility
      const hamburger = !!document.querySelector('button[aria-label*="Menü"], [data-testid="hamburger"], [class*="lg:hidden"] button, button[class*="md:hidden"]');
      const navLinks = [...document.querySelectorAll('nav a, header a')].filter(a => /Über uns|Über|Kontakt|Kontaktieren|About|Contact/i.test(a.textContent || ''));
      const navVisible = navLinks.filter(a => {
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }).length;
      return { vw, sw, overflow, offenders: offenders.slice(0, 4), navLinksTotal: navLinks.length, navVisible, hamburgerFound: !!hamburger };
    })()`);
    const status = r.overflow > 1 ? "❌" : "✅";
    out.push({ page, ...r, status });
    if (r.overflow > 1) {
      FAILS.push(`RESP ${width}px ${page}: overflow ${r.overflow}px → ${JSON.stringify(r.offenders.slice(0, 2))}`);
    }
  }
  return out;
}

// ─── DE/EN switch test via real UI click ───
async function langTest() {
  await setViewport(1440);
  const results = {};

  // Ensure fresh DE state
  await send("Network.enable");
  await send("Network.clearBrowserCookies");
  await send("Page.navigate", { url: `${BASE}/` });
  await sleep(8000);

  const deBefore = await evalJs(`(() => {
    const body = document.body.innerText;
    return {
      lang: document.documentElement.lang,
      hasGermanHero: /Alltag, der sich|Jetzt entdecken/.test(body),
      hasEnglish: /Everyday things|Shop the collection/.test(body),
      rawKeys: (body.match(/\\b[a-z]{2,}\\.[a-z0-9]+\\.?[a-z0-9.]*/g) || []).slice(0, 10),
    };
  })()`);
  results.deBefore = deBefore;

  // Click language globe then "English"
  const clicked = await evalJs(`(() => {
    const globe = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '').toLowerCase().includes('sprache'));
    if (!globe) return 'NO_GLOBE';
    globe.click();
    return 'GLOBE_CLICKED';
  })()`);
  await sleep(800);
  const clickedEn = await evalJs(`(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent && b.textContent.includes('English'));
    if (!btn) return 'NO_EN_BTN';
    btn.click();
    return 'EN_CLICKED';
  })()`);
  results.switch = { clicked, clickedEn };
  // switchLocale reloads the page
  await sleep(9000);

  const enAfter = await evalJs(`(() => {
    const body = document.body.innerText;
    return {
      cookie: document.cookie,
      lang: document.documentElement.lang,
      hasGermanHero: /Alltag, der sich|Jetzt entdecken/.test(body),
      hasEnglish: /Everyday things|Shop the collection/.test(body),
      rawKeys: (body.match(/\\b[a-z]{2,}\\.[a-z0-9]+\\.?[a-z0-9.]*/g) || []).slice(0, 10),
    };
  })()`);
  results.enAfter = enAfter;
  if (enAfter.hasEnglish && !enAfter.hasGermanHero) {
    RESULTS.push("✅ DE→EN switch: hero text switched to English");
  } else {
    FAILS.push(`LANG switch: ${JSON.stringify(enAfter)}`);
  }
  return results;
}

// ─── Raw key leak scan across pages (EN) ───
async function rawKeyScan() {
  await setViewport(1440);
  const leaks = [];
  for (const page of PAGES) {
    await send("Page.navigate", { url: `${BASE}${page}` });
    await sleep(5000);
    const found = await evalJs(`(() => {
      const matches = new Set();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const m = n.textContent.match(/\\b[a-z]+\\.[a-z0-9]+(?:\\.[a-z0-9]+)*/g);
        if (m) for (const x of m) {
          if (/^(nav|home|catalog|product|cart|checkout|account|contact|about|footer|common|admin|imprint|returns|wishlist)\\./.test(x)) matches.add(x);
        }
      }
      return [...matches].slice(0, 8);
    })()`);
    if (found && found.length) leaks.push({ page, keys: found });
  }
  return leaks;
}

// ═══ RUN ═══
console.log(`Target: ${BASE}`);
console.log("\n── RESPONSIVENESS ──");
for (const width of [390, 768, 1440]) {
  const rows = await respCheck(width);
  console.log(`\n### ${width}px`);
  for (const r of rows) {
    const extra = r.overflow > 1 ? ` overflow=${r.overflow}px` : "";
    console.log(`  ${r.status} ${r.page}  (nav links visible: ${r.navVisible}/${r.navLinksTotal})${extra}`);
    if (r.overflow > 1 && r.offenders.length) {
      for (const o of r.offenders) console.log(`      offender: <${o.tag}> w=${o.w} right=${o.right} ${o.cls.slice(0, 60)}`);
    }
  }
  const total = rows.length;
  const ok = rows.filter((r) => r.overflow <= 1).length;
  RESULTS.push(`${width}px: ${ok}/${total} pages no horizontal overflow`);
}

console.log("\n── DE/EN SWITCH ──");
const lang = await langTest();
console.log("  DE before:", JSON.stringify(lang.deBefore));
console.log("  switch:", JSON.stringify(lang.switch));
console.log("  EN after:", JSON.stringify(lang.enAfter));

console.log("\n── RAW KEY LEAK SCAN (EN) ──");
const leaks = await rawKeyScan();
if (!leaks.length) {
  RESULTS.push("✅ No raw translation keys leaked in rendered text");
  console.log("  none");
} else {
  for (const l of leaks) {
    FAILS.push(`LANG leak on ${l.page}: ${l.keys.join(", ")}`);
    console.log(`  ❌ ${l.page}: ${l.keys.join(", ")}`);
  }
}

console.log("\n── CONSOLE ERRORS (samples) ──");
const realErrors = consoleMsgs.filter((m) => /error|failed|exception/i.test(m));
console.log(realErrors.length ? realErrors.slice(0, 8).join("\n  ") : "  none");

console.log("\n══════════ SUMMARY ══════════");
for (const r of RESULTS) console.log("  " + r);
if (FAILS.length) {
  console.log("\n  FAILURES:");
  for (const f of FAILS) console.log("   ❌ " + f);
} else {
  console.log("  No failures 🎉");
}

chrome.kill();
process.exit(0);
