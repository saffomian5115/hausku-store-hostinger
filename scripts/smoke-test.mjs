/**
 * End-to-end smoke test: hits every page + API route and reports status codes.
 * Usage: node scripts/smoke-test.mjs
 * Requires a running dev/prod server (default http://localhost:3000).
 */
const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";

const EMAIL = process.env.ADMIN_EMAIL_SMOKE || "admin@hausku.com";
const PASSWORD = process.env.ADMIN_PASSWORD_SMOKE || "admin@123";

let pass = 0;
const failures = [];

async function hit(method, path, { cookie, body, redirect = "manual" } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (body) headers["content-type"] = "application/json";
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      redirect,
    });
  } catch (err) {
    failures.push({ method, path, status: "NETWORK ERROR", detail: String(err) });
    return { res: null, text: "" };
  }
  const text = await res.text().catch(() => "");
  return { res, text };
}

async function check(label, method, path, expected, opts) {
  const { res, text } = await hit(method, path, opts);
  const status = res ? res.status : "ERR";
  const ok = Array.isArray(expected) ? expected.includes(status) : status === expected;
  const line = `${ok ? "PASS" : "FAIL"} [${status}] ${method} ${path}  ${label}`;
  console.log(line);
  if (ok) {
    pass++;
  } else {
    failures.push({
      label,
      method,
      path,
      status,
      expected,
      detail: text.slice(0, 400).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    });
  }
  return { res, text };
}

function extractCookie(res) {
  if (!res) return null;
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const all = raw.length ? raw : [res.headers.get("set-cookie")].filter(Boolean);
  return all.map((c) => c.split(";")[0]).join("; ") || null;
}

async function main() {
  console.log(`\n=== SMOKE TEST @ ${BASE} ===\n`);
  console.log("--- PUBLIC PAGES ---");
  const publicPages = [
    "/",
    "/catalog",
    "/cart",
    "/about",
    "/contact",
    "/imprint",
    "/privacy",
    "/terms",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/order-lookup",
    "/returns",
    "/wishlist",
    "/account",
    "/account/orders",
    "/account/addresses",
    "/checkout",
  ];
  for (const p of publicPages) await check("page", "GET", p, [200, 302, 307]);

  console.log("\n--- PUBLIC APIs ---");
  await check("categories", "GET", "/api/categories", 200);
  await check("settings", "GET", "/api/settings", 200);
  await check("auth me (anon)", "GET", "/api/auth/me", [200, 401]);
  const products = await check("products list", "GET", "/api/products", 200);

  // Product detail pages + public single-product API
  let slugs = [];
  try {
    const parsed = JSON.parse(products.text);
    const list = Array.isArray(parsed) ? parsed : parsed.products || parsed.data || [];
    slugs = list.map((p) => p.slug).filter(Boolean);
  } catch {
    /* ignore */
  }
  if (!slugs.length) {
    slugs = [
      "laptopkissen-grau",
      "laptopkissen-schwarz",
      "brotdose-850ml",
      "brotdose-1200ml",
      "brotdose-1400ml",
      "couchbar-snackbox",
    ];
  }
  console.log(`  (product slugs: ${slugs.join(", ")})`);
  for (const s of slugs) await check("product page", "GET", `/product/${s}`, 200);

  console.log("\n--- ADMIN LOGIN ---");
  const login = await hit("POST", "/api/admin/auth/login", {
    body: { email: EMAIL, password: PASSWORD },
  });
  const cookie = extractCookie(login.res);
  const loginStatus = login.res ? login.res.status : "ERR";
  const loginOk = loginStatus === 200 && cookie;
  console.log(`${loginOk ? "PASS" : "FAIL"} [${loginStatus}] POST /api/admin/auth/login`);
  if (loginOk) pass++;
  else
    failures.push({
      label: "admin login",
      method: "POST",
      path: "/api/admin/auth/login",
      status: loginStatus,
      expected: 200,
      detail: login.text.slice(0, 300),
    });

  console.log("\n--- ADMIN APIs ---");
  await check("admin me", "GET", "/api/admin/auth/me", 200, { cookie });
  await check("admin 2fa state", "GET", "/api/admin/auth/2fa", 200, { cookie });
  await check("admin products", "GET", "/api/admin/products", 200, { cookie });
  await check("admin customers", "GET", "/api/admin/customers", 200, { cookie });
  await check("admin returns", "GET", "/api/admin/returns", 200, { cookie });
  await check("admin reviews", "GET", "/api/admin/reviews", 200, { cookie });
  await check("admin settings", "GET", "/api/admin/settings", 200, { cookie });

  // Admin detail routes need real ids
  const adminProducts = await hit("GET", "/api/admin/products", { cookie });
  let apIds = [];
  try {
    const p = JSON.parse(adminProducts.text);
    const list = Array.isArray(p) ? p : p.products || p.data || [];
    apIds = list.map((x) => x.id).filter((x) => x != null);
  } catch {
    /* ignore */
  }
  if (apIds.length) {
    await check("admin product detail", "GET", `/api/admin/products/${apIds[0]}`, 200, { cookie });
  }

  // Admin order detail page id: pull it from the server-rendered orders list HTML.
  const adminOrdersPage = await hit("GET", "/admin/orders", { cookie });
  const orderIds = [...new Set([...adminOrdersPage.text.matchAll(/\/admin\/orders\/(\d+)/g)].map((m) => m[1]))];

  console.log("\n--- ADMIN PAGES ---");
  const adminPages = [
    "/admin",
    "/admin/products",
    "/admin/products/new",
    "/admin/orders",
    "/admin/returns",
    "/admin/reviews",
    "/admin/customers",
    "/admin/settings",
    "/admin/login",
  ];
  if (apIds.length) adminPages.push(`/admin/products/${apIds[0]}/edit`);
  if (orderIds.length) adminPages.push(`/admin/orders/${orderIds[0]}`);
  for (const p of adminPages) await check("admin page", "GET", p, [200, 302, 307], { cookie });

  console.log("\n=== RESULT ===");
  console.log(`PASSED: ${pass}`);
  console.log(`FAILED: ${failures.length}`);
  if (failures.length) {
    console.log("\n--- FAILURES ---");
    for (const f of failures) {
      console.log(
        `\n✗ ${f.label} — ${f.method} ${f.path}\n  status=${f.status} expected=${JSON.stringify(
          f.expected
        )}\n  ${f.detail || ""}`
      );
    }
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
