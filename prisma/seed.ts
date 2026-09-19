import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Categories ────────────────────────────────────────
  const kueche = await prisma.category.upsert({
    where: { slug: "kueche" },
    update: {},
    create: { name: "Küche", slug: "kueche", sortOrder: 1 },
  });

  const haushalt = await prisma.category.upsert({
    where: { slug: "haushalt" },
    update: {},
    create: { name: "Haushalt", slug: "haushalt", sortOrder: 2 },
  });

  console.log("✅ Categories created");

  // ─── Products (Real HAUSKU Products) ────────────────────
  const products = [
    // ── Laptop Cushions ──
    {
      name: "Laptopkissen für Bett & Sofa — Grau",
      slug: "laptopkissen-grau",
      description:
        "Ergonomisches Lapdesk aus Polyester und Holz. Integrierter Smartphone-Tablet-Slot, Handgelenkauflage und Mausbereich. Passt bis 17 Zoll Laptops. Leicht & komfortabel für Büro, Lernen und Entspannung.",
      basePrice: 29.90,
      imageUrl: "/images/products/laptopkissen-grau.jpg",
      categoryId: haushalt.id,
      featured: true,
      manufacturer: "HAUSKU",
      variants: [
        { sku: "HSK-LK-GRY-001", color: "Grau", colorHex: "#808080", stockQty: 20, size: null },
      ],
    },
    {
      name: "Laptopkissen für Bett & Sofa — Schwarz",
      slug: "laptopkissen-schwarz",
      description:
        "Ergonomisches Lapdesk aus Polyester und Holz in eleganter schwarzer Ausführung. Integrierter Smartphone-Tablet-Slot, Handgelenkauflage und Mausbereich. Passt bis 17 Zoll Laptops.",
      basePrice: 29.90,
      imageUrl: "/images/products/laptopkissen-schwarz.jpg",
      categoryId: haushalt.id,
      featured: true,
      manufacturer: "HAUSKU",
      variants: [
        { sku: "HSK-LK-BLK-001", color: "Schwarz", colorHex: "#1a1a1a", stockQty: 25, size: null },
      ],
    },

    // ── Lunch Boxes ──
    {
      name: "HAUSKU Edelstahl Brotdose 850 ml",
      slug: "brotdose-850ml",
      description:
        "Auslaufsichere Edelstahl-Brotdose mit verschiebbarer Trennwand und klappbarem Besteckset. 18/08 Lebensmittelqualität, BPA-frei, spülmaschinenfest. Inkl. Ersatzdichtung und 100% Baumwollbeutel. Ideal für Kinder und kleine Portionen.",
      basePrice: 11.95,
      imageUrl: "/images/products/brotdose-850ml.jpg",
      categoryId: kueche.id,
      featured: true,
      manufacturer: "HAUSKU",
      variants: [
        { sku: "HSK-LB-850-SLV", color: "Silber", colorHex: "#C0C0C0", stockQty: 40, size: "850 ml" },
      ],
    },
    {
      name: "HAUSKU Edelstahl Brotdose 1200 ml",
      slug: "brotdose-1200ml",
      description:
        "Große auslaufsichere Edelstahl-Brotdose mit Silikondichtung und Rastverschluss. Verstellbare Trennwand, klappbares Besteckset, Ersatzdichtung und Baumwollbeutel inklusive. Perfekt für Büro, Schule und Meal Prep.",
      basePrice: 14.95,
      imageUrl: "/images/products/brotdose-1200ml.jpg",
      categoryId: kueche.id,
      featured: false,
      manufacturer: "HAUSKU",
      variants: [
        { sku: "HSK-LB-1200-SLV", color: "Silber", colorHex: "#C0C0C0", stockQty: 35, size: "1200 ml" },
      ],
    },
    {
      name: "HAUSKU Edelstahl Brotdose 1400 ml",
      slug: "brotdose-1400ml",
      description:
        "Die größte HAUSKU Brotdose mit exklusivem Dip-Sauce-Behälter. Auslaufsicher dank Silikondichtung, verstellbare Trennwand, klappbares Besteckset, Ersatzdichtung und Baumwollbeutel. Ideal für große Mahlzeiten.",
      basePrice: 15.95,
      imageUrl: "/images/products/brotdose-1400ml.jpg",
      categoryId: kueche.id,
      featured: true,
      manufacturer: "HAUSKU",
      variants: [
        { sku: "HSK-LB-1400-SLV", color: "Silber", colorHex: "#C0C0C0", stockQty: 30, size: "1400 ml" },
      ],
    },

    // ── Couch Bar ──
    {
      name: "HAUSKU Couch Bar Snackbox",
      slug: "couchbar-snackbox",
      description:
        "Vielseitiger Snack-Organizer für die Couch aus Bambus und Edelstahl. 2 große Schalen + 1 Dip-Schale, integrierte Getränkehalter, Flaschenöffner, 2 Kork-Untersetzer und Tragegriff. Elegante Zweifarben-Optik.",
      basePrice: 39.90,
      imageUrl: "/images/products/couchbar-snackbox.jpg",
      categoryId: haushalt.id,
      featured: true,
      manufacturer: "HAUSKU",
      variants: [
        { sku: "HSK-CB-NAT-001", color: "Natur/Schwarz", colorHex: "#d4a574", stockQty: 15, size: null },
      ],
    },
  ];

  for (const product of products) {
    const { variants, ...productData } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: productData.name,
        description: productData.description,
        basePrice: productData.basePrice,
        imageUrl: productData.imageUrl,
        categoryId: productData.categoryId,
        featured: productData.featured,
        manufacturer: productData.manufacturer,
      },
      create: {
        ...productData,
        variants: {
          create: variants,
        },
      },
    });
  }

  console.log(`✅ ${products.length} products created`);

  // ─── Sample Customers ──────────────────────────────────
  const reviewCustomers = [
    { email: "ludolph.c@example.com", name: "Ludolph C." },
    { email: "shakeel.h@example.com", name: "Shakeel H." },
    { email: "danescu.a@example.com", name: "danescu a." },
    { email: "petra.w@example.com", name: "Petra W." },
    { email: "jonas.b@example.com", name: "Jonas B." },
    { email: "meike.s@example.com", name: "Meike S." },
    { email: "dominik.r@example.com", name: "Dominik R." },
    { email: "aylin.k@example.com", name: "Aylin K." },
    { email: "review.pending@example.com", name: "Neuer Kunde" },
  ];

  for (const c of reviewCustomers) {
    await prisma.customer.upsert({
      where: { email: c.email },
      update: { name: c.name },
      create: { email: c.email, name: c.name, isGuest: false },
    });
  }

  console.log(`✅ ${reviewCustomers.length} sample customers created`);

  // ─── Sample Reviews (approved → live on product pages) ──
  const reviews: {
    slug: string;
    email: string;
    rating: number;
    title: string;
    body: string;
    approved?: boolean;
  }[] = [
    // brotdose-850ml
    { slug: "brotdose-850ml", email: "ludolph.c@example.com", rating: 5, title: "Super Qualität", body: "Super hochwertig. Sogar eine Ersatzdichtung dabei. Meine Tochter liebt die Brotdose!" },
    { slug: "brotdose-850ml", email: "shakeel.h@example.com", rating: 5, title: "Sehr zufrieden!", body: "Mein Kind benutzt diese Edelstahl-Brotdose täglich. Absolut auslaufsicher und leicht zu reinigen." },
    { slug: "brotdose-850ml", email: "danescu.a@example.com", rating: 4, title: "Tip top", body: "Die Box hat einen einfachen und praktischen Deckelverschluss. Der Beutel ist eine schöne Zugabe." },
    // brotdose-1200ml
    { slug: "brotdose-1200ml", email: "aylin.k@example.com", rating: 4, title: "Schönes Design", body: "Sieht auf jedem Küchentisch gut aus und die Trennwand ist super praktisch für Meal Prep." },
    // brotdose-1400ml
    { slug: "brotdose-1400ml", email: "petra.w@example.com", rating: 5, title: "Absolute Empfehlung", body: "Endlich eine Marke, die hält was sie verspricht. Der Dip-Behälter ist das i-Tüpfelchen." },
    // laptopkissen-grau
    { slug: "laptopkissen-grau", email: "jonas.b@example.com", rating: 5, title: "Top Verarbeitung", body: "Man merkt sofort die Liebe zum Detail. Der Smartphone-Slot ist genial durchdacht." },
    // laptopkissen-schwarz
    { slug: "laptopkissen-schwarz", email: "dominik.r@example.com", rating: 5, title: "Schneller Versand", body: "Zwei Tage nach Bestellung war alles da. Das Kissen ist bequem und stabil zugleich." },
    // couchbar-snackbox
    { slug: "couchbar-snackbox", email: "meike.s@example.com", rating: 4, title: "Alltagstauglich", body: "Nutze die Snackbox jedes Wochenende. Die Getränkehalter sind der absolute Clou für den Filmabend." },
    // one pending review → shows up in Admin → Bewertungen for moderation
    { slug: "brotdose-1200ml", email: "review.pending@example.com", rating: 5, title: "Tolle Box", body: "Sehr robust und die Silikondichtung sitzt perfekt. Bestelle gleich noch eine zweite.", approved: false },
  ];

  for (const review of reviews) {
    const product = await prisma.product.findUnique({
      where: { slug: review.slug },
      select: { id: true },
    });
    const customer = await prisma.customer.findUnique({
      where: { email: review.email },
      select: { id: true },
    });
    if (!product || !customer) continue;

    await prisma.review.upsert({
      where: {
        customerId_productId: {
          customerId: customer.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        customerId: customer.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        approved: review.approved ?? true,
        rejected: false,
      },
    });
  }

  console.log(`✅ ${reviews.length} sample reviews created`);

  // ─── Sample Paid Orders (demo revenue for the dashboard chart) ──
  // Fixed order numbers keep the seed idempotent (upsert by orderNumber).
  const VAT_RATE = 19;
  const SHIPPING_FLAT = 4.99;
  const FREE_SHIPPING_FROM = 30;

  const demoOrders = [
    { seq: 1, daysAgo: 20, slug: "brotdose-850ml", qty: 1, name: "Ludolph C.", email: "ludolph.c@example.com" },
    { seq: 2, daysAgo: 18, slug: "laptopkissen-grau", qty: 1, name: "Jonas B.", email: "jonas.b@example.com" },
    { seq: 3, daysAgo: 16, slug: "couchbar-snackbox", qty: 1, name: "Meike S.", email: "meike.s@example.com" },
    { seq: 4, daysAgo: 15, slug: "brotdose-1400ml", qty: 2, name: "Petra W.", email: "petra.w@example.com" },
    { seq: 5, daysAgo: 13, slug: "brotdose-1200ml", qty: 1, name: "Aylin K.", email: "aylin.k@example.com" },
    { seq: 6, daysAgo: 11, slug: "laptopkissen-schwarz", qty: 1, name: "Dominik R.", email: "dominik.r@example.com" },
    { seq: 7, daysAgo: 9, slug: "brotdose-850ml", qty: 2, name: "Shakeel H.", email: "shakeel.h@example.com" },
    { seq: 8, daysAgo: 7, slug: "couchbar-snackbox", qty: 1, name: "danescu a.", email: "danescu.a@example.com" },
    { seq: 9, daysAgo: 5, slug: "laptopkissen-grau", qty: 1, name: "Petra W.", email: "petra.w@example.com" },
    { seq: 10, daysAgo: 4, slug: "brotdose-1400ml", qty: 1, name: "Ludolph C.", email: "ludolph.c@example.com" },
    { seq: 11, daysAgo: 2, slug: "brotdose-1200ml", qty: 2, name: "Jonas B.", email: "jonas.b@example.com" },
    { seq: 12, daysAgo: 0, slug: "brotdose-850ml", qty: 1, name: "Aylin K.", email: "aylin.k@example.com" },
  ];

  for (const demo of demoOrders) {
    const product = await prisma.product.findUnique({
      where: { slug: demo.slug },
      include: { variants: { where: { active: true }, orderBy: { id: "asc" }, take: 1 } },
    });
    const variant = product?.variants[0];
    if (!product || !variant) continue;

    const orderNumber = `hausku-demo-${String(demo.seq).padStart(3, "0")}`;
    const exists = await prisma.order.findUnique({ where: { orderNumber } });
    if (exists) continue; // idempotent

    const unitPrice = variant.priceOverride ?? product.basePrice;
    const subtotal = parseFloat((unitPrice * demo.qty).toFixed(2));
    const shippingCost = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FLAT;
    const vatAmount = parseFloat(((subtotal * VAT_RATE) / 100).toFixed(2));
    const total = parseFloat((subtotal + shippingCost + vatAmount).toFixed(2));

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - demo.daysAgo);
    createdAt.setHours(10 + (demo.seq % 8), (demo.seq * 13) % 60, 0, 0);
    const paidAt = new Date(createdAt.getTime() + 45 * 60 * 1000);

    await prisma.order.create({
      data: {
        orderNumber,
        status: demo.daysAgo >= 10 ? "DELIVERED" : "CONFIRMED",
        subtotal,
        shippingCost,
        vatRate: VAT_RATE,
        vatAmount,
        total,
        currency: "EUR",
        guestEmail: demo.email,
        guestName: demo.name,
        paymentMethod: "stripe",
        paymentId: `demo_pi_${demo.seq}`,
        paidAt,
        createdAt,
        shippingName: demo.name,
        shippingStreet: "Roggenring 26",
        shippingCity: "Hamberge",
        shippingPostal: "23619",
        shippingCountry: "DE",
        items: {
          create: [
            {
              productId: product.id,
              variantId: variant.id,
              productName: product.name,
              variantLabel: [variant.size, variant.color].filter(Boolean).join(" / ") || null,
              qty: demo.qty,
              unitPrice,
            },
          ],
        },
      },
    });
  }

  console.log(`✅ ${demoOrders.length} sample paid orders created`);

  // ─── Settings ──────────────────────────────────────────
  // Real company data from client-provided Impressum (2026-09). Keys must match
  // SETTING_KEYS in src/lib/settings/index.ts (store_name/store_email were dead keys).
  const settings = [
    { key: "vat_rate", value: "19" },
    { key: "vat_id", value: "DE367665227" },
    { key: "shipping_flat_rate", value: "4.99" },
    { key: "free_shipping_threshold", value: "30" },
    { key: "shop_name", value: "hausku" },
    { key: "company_name", value: "NI Intellect UG (haftungsbeschränkt)" },
    { key: "company_email", value: "saleshub@niintellect.de" },
    { key: "company_phone", value: "+49 176 45972009" },
    { key: "company_address", value: "Roggenring 26, 23619 Hamberge, Deutschland" },
    { key: "company_manager", value: "Nazia Iqbal" },
    { key: "return_days", value: "60" },
    { key: "warranty_years", value: "2" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("✅ Settings created");

  console.log("🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
