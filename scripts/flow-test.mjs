/**
 * Full app flow test against a running server.
 *   node scripts/flow-test.mjs
 *
 * Covers: customer register → /me → wishlist → profile → address → review →
 * guest order → order lookup → admin login → admin orders list → order status
 * update → invoice generation + download → review moderation → settings save.
 *
 * Everything it creates is deleted again at the end (see cleanup()).
 */
import { PrismaClient } from "@prisma/client";

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL_SMOKE || "admin@hausku.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD_SMOKE || "admin@123";

const prisma = new PrismaClient();

let pass = 0;
const failures = [];
const note = (msg) => console.log(msg);

function ok(label, extra = "") {
  pass++;
  console.log(`PASS  ${label}${extra ? "  — " + extra : ""}`);
}
function fail(label, detail) {
  failures.push({ label, detail: String(detail).slice(0, 500) });
  console.log(`FAIL  ${label}  — ${String(detail).slice(0, 300)}`);
}
function expect(label, cond, detail = "") {
  if (cond) ok(label, detail);
  else fail(label, detail || "condition not met");
}

async function api(method, path, { cookie, body } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (body) headers["content-type"] = "application/json";
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  let json = null;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON */
  }
  const setCookie = res.headers.getSetCookie
    ? res.headers.getSetCookie()
    : [res.headers.get("set-cookie")].filter(Boolean);
  const cookieOut = setCookie.map((c) => c.split(";")[0]).join("; ") || null;
  return { status: res.status, json, text, cookie: cookieOut };
}

const created = {
  customerEmail: `flowtest+${Date.now()}@example.com`,
  customerId: null,
  orderId: null,
  orderNumber: null,
  reviewId: null,
  invoiceId: null,
};

async function run() {
  note(`\n=== FLOW TEST @ ${BASE} ===\n`);

  const variant = await prisma.productVariant.findFirst({
    where: { active: true },
    include: { product: { select: { id: true, name: true } } },
  });
  if (!variant) throw new Error("No active product variant — run db:seed first.");
  const productId = variant.product.id;

  // ── 1. Customer register ─────────────────────────────
  note("--- CUSTOMER AUTH ---");
  const reg = await api("POST", "/api/auth/register", {
    body: {
      email: created.customerEmail,
      password: "FlowTest@1234",
      name: "Flow Test",
    },
  });
  expect("register 201", reg.status === 201, `status=${reg.status} ${reg.text.slice(0, 200)}`);
  created.customerId = reg.json?.id ?? null;
  const customerCookie = reg.cookie;

  const me = await api("GET", "/api/auth/me", { cookie: customerCookie });
  expect(
    "GET /api/auth/me returns user (signed session)",
    me.json?.user?.email === created.customerEmail,
    `status=${me.status} body=${me.text.slice(0, 200)}`
  );

  // ── 2. Wishlist ──────────────────────────────────────
  note("\n--- WISHLIST ---");
  const toggle = await api("POST", "/api/wishlist/toggle", {
    cookie: customerCookie,
    body: { productId },
  });
  expect(
    "wishlist toggle → liked:true",
    toggle.json?.liked === true,
    `status=${toggle.status} body=${toggle.text.slice(0, 200)}`
  );
  const wl = await api("GET", "/api/wishlist", { cookie: customerCookie });
  const wlLen =
    wl.json?.wishlist?.length ?? wl.json?.items?.length ?? wl.json?.products?.length ?? 0;
  expect("GET /api/wishlist has item", wlLen >= 1, `body=${wl.text.slice(0, 200)}`);

  // ── 3. Profile + address ─────────────────────────────
  note("\n--- PROFILE / ADDRESS ---");
  const prof = await api("GET", `/api/customers/${created.customerId}/profile`, {
    cookie: customerCookie,
  });
  expect("profile GET 200", prof.status === 200, `status=${prof.status}`);
  const profPut = await api("PUT", `/api/customers/${created.customerId}/profile`, {
    cookie: customerCookie,
    body: { name: "Flow Tester" },
  });
  expect("profile PUT 200", profPut.status === 200, `status=${profPut.status} ${profPut.text.slice(0, 200)}`);

  const addr = await api("POST", `/api/customers/${created.customerId}/addresses`, {
    cookie: customerCookie,
    body: {
      firstName: "Flow",
      lastName: "Tester",
      street: "Teststr. 1",
      city: "Berlin",
      postalCode: "10115",
      country: "DE",
      isDefault: true,
    },
  });
  expect("address POST 201", addr.status === 201, `status=${addr.status} ${addr.text.slice(0, 200)}`);

  // ── 4. Review ────────────────────────────────────────
  note("\n--- REVIEW ---");
  const review = await api("POST", "/api/reviews", {
    cookie: customerCookie,
    body: { productId, rating: 5, title: "Flow test", body: "Automatischer Test." },
  });
  expect("review POST 201", review.status === 201, `status=${review.status} ${review.text.slice(0, 200)}`);
  created.reviewId = review.json?.review?.id ?? null;

  // ── 5. Guest order + lookup ──────────────────────────
  note("\n--- ORDER + LOOKUP ---");
  const order = await api("POST", "/api/orders", {
    body: {
      email: created.customerEmail,
      firstName: "Flow",
      lastName: "Tester",
      street: "Teststr. 1",
      city: "Berlin",
      postalCode: "10115",
      country: "DE",
      paymentMethod: "stripe",
      items: [{ variantId: variant.id, productId, qty: 1 }],
    },
  });
  expect("order POST 201", order.status === 201, `status=${order.status} ${order.text.slice(0, 200)}`);
  created.orderId = order.json?.orderId ?? null;
  created.orderNumber = order.json?.orderNumber ?? null;

  const lookup = await api("POST", "/api/orders/lookup", {
    body: { orderNumber: created.orderNumber, email: created.customerEmail },
  });
  expect(
    "order lookup 200 (email match)",
    lookup.status === 200 && !!lookup.json?.order,
    `status=${lookup.status} ${lookup.text.slice(0, 200)}`
  );
  const lookupWrong = await api("POST", "/api/orders/lookup", {
    body: { orderNumber: created.orderNumber, email: "wrong@example.com" },
  });
  expect("order lookup 403 (wrong email)", lookupWrong.status === 403, `status=${lookupWrong.status}`);

  // ── 6. Admin login + orders list ─────────────────────
  note("\n--- ADMIN ---");
  const login = await api("POST", "/api/admin/auth/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect("admin login 200", login.status === 200, `status=${login.status}`);
  const adminCookie = login.cookie;

  const ordersList = await api("GET", "/api/orders?limit=5", { cookie: adminCookie });
  expect(
    "GET /api/orders (admin list) 200",
    ordersList.status === 200 && Array.isArray(ordersList.json?.orders),
    `status=${ordersList.status} ${ordersList.text.slice(0, 200)}`
  );

  const detail = await api("GET", `/api/admin/orders/${created.orderId}`, { cookie: adminCookie });
  expect("admin order detail 200", detail.status === 200, `status=${detail.status}`);

  const statusUpdate = await api("PUT", `/api/admin/orders/${created.orderId}`, {
    cookie: adminCookie,
    body: { status: "CONFIRMED" },
  });
  expect(
    "admin order status PENDING→CONFIRMED",
    statusUpdate.status === 200 && statusUpdate.json?.order?.status === "CONFIRMED",
    `status=${statusUpdate.status} body=${statusUpdate.text.slice(0, 200)}`
  );

  const invoice = await api("POST", "/api/admin/invoices", {
    cookie: adminCookie,
    body: { orderId: created.orderId, type: "invoice" },
  });
  expect("invoice POST 201", invoice.status === 201, `status=${invoice.status} ${invoice.text.slice(0, 200)}`);
  created.invoiceId = invoice.json?.invoice?.id ?? null;

  if (created.invoiceId) {
    const dl = await fetch(`${BASE}/api/admin/invoices/${created.invoiceId}/download`, {
      headers: { cookie: adminCookie },
      redirect: "manual",
    });
    expect(
      "invoice download 200 + PDF",
      dl.status === 200 && (dl.headers.get("content-type") || "").includes("pdf"),
      `status=${dl.status} type=${dl.headers.get("content-type")}`
    );
  }

  const settingsGet = await api("GET", "/api/admin/settings", { cookie: adminCookie });
  expect("admin settings GET 200", settingsGet.status === 200, `status=${settingsGet.status}`);

  const settingsPut = await api("PUT", "/api/admin/settings", {
    cookie: adminCookie,
    body: { vatRate: settingsGet.json?.settings?.vatRate ?? 19 },
  });
  expect("admin settings PUT 200", settingsPut.status === 200, `status=${settingsPut.status} ${settingsPut.text.slice(0, 200)}`);

  // ── 7. Review moderation ─────────────────────────────
  note("\n--- REVIEW MODERATION ---");
  if (created.reviewId) {
    const patch = await api("PATCH", "/api/admin/reviews", {
      cookie: adminCookie,
      body: { id: created.reviewId, action: "approve" },
    });
    expect(
      "review approve PATCH 200",
      patch.status === 200 && patch.json?.review?.approved === true,
      `status=${patch.status} ${patch.text.slice(0, 200)}`
    );
  }

  // ── 8. Returns list ──────────────────────────────────
  const returns = await api("GET", "/api/admin/returns", { cookie: adminCookie });
  expect("admin returns list 200", returns.status === 200, `status=${returns.status}`);
}

async function cleanup() {
  note("\n--- CLEANUP ---");
  try {
    if (created.customerId) {
      const orders = await prisma.order.findMany({
        where: { guestEmail: created.customerEmail },
        select: { id: true },
      });
      const orderIds = orders.map((o) => o.id);
      if (orderIds.length) {
        await prisma.creditNote.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.invoice.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.returnRequest.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      }
      await prisma.review.deleteMany({ where: { customerId: created.customerId } });
      await prisma.wishlistItem.deleteMany({ where: { customerId: created.customerId } });
      await prisma.address.deleteMany({ where: { customerId: created.customerId } });
      await prisma.customer.delete({ where: { id: created.customerId } });
      note(`Cleaned up test customer #${created.customerId} + linked rows.`);
    }
  } catch (e) {
    note(`Cleanup warning: ${e.message}`);
  }
}

run()
  .catch((e) => {
    console.error("Flow test crashed:", e);
    failures.push({ label: "flow test crash", detail: e.stack || String(e) });
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
    note(`\n=== RESULT: ${pass} passed, ${failures.length} failed ===`);
    if (failures.length) {
      console.log("\n--- FAILURES ---");
      for (const f of failures) console.log(`\n✗ ${f.label}\n  ${f.detail}`);
      process.exitCode = 1;
    }
  });
