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

  // ─── Settings ──────────────────────────────────────────
  const settings = [
    { key: "vat_rate", value: "19" },
    { key: "shipping_flat_rate", value: "4.99" },
    { key: "free_shipping_threshold", value: "30" },
    { key: "store_name", value: "hausku" },
    { key: "store_email", value: "info@hausku.de" },
    { key: "company_name", value: "NI Intellect UG" },
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
