import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import ProductCard from "@/components/storefront/ProductCard";
import { getTranslations } from "@/lib/i18n";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroProduct from "@/components/storefront/HeroProduct";
import NewsletterForm from "@/components/shared/NewsletterForm";
import { formatPrice } from "@/lib/format";
import {
  ShieldCheck,
  Star,
  Truck,
  RefreshCcw,
  Globe2,
  CreditCard,
  Package,
  Leaf,
  Smartphone,
  Hand,
  Laptop,
  Feather,
  Lock,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default async function HomePage() {
  const { t } = await getTranslations();

  const [bestsellers, snackbox, laptopCushion, lunchBox1400] =
    await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        include: {
          category: true,
          variants: { where: { active: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 3,
      }),
      prisma.product.findUnique({
        where: { slug: "couchbar-snackbox" },
        include: {
          category: true,
          variants: { where: { active: true } },
        },
      }),
      prisma.product.findUnique({
        where: { slug: "laptopkissen-grau" },
        include: {
          category: true,
          variants: { where: { active: true } },
        },
      }),
      prisma.product.findUnique({
        where: { slug: "brotdose-1400ml" },
        include: {
          category: true,
          variants: { where: { active: true } },
        },
      }),
    ]);

  return (
    <>
      {/* ═══ SECTION 1: Top Utility Bar ═══ */}
      <div className="bg-lime-500 text-gray-900 text-center py-2 text-sm font-medium">
        <div className="max-w-7xl mx-auto px-4">
          <span className="hidden sm:inline">🚚 {t("home.freeShipping")}</span>
          <span className="hidden sm:inline mx-3 opacity-50">|</span>
          <span className="hidden md:inline">🔄 {t("home.trialPeriod")}</span>
          <span className="hidden md:inline mx-3 opacity-50">|</span>
          <span className="hidden lg:inline">🇩🇪 {t("home.deliveryTime")}</span>
          <span className="sm:hidden">🚚 {t("home.freeShippingShort")}</span>
        </div>
      </div>

      {/* ═══ SECTION 2: Hero ═══ */}
      <section className="relative hero-bg text-white overflow-hidden min-h-[420px] md:min-h-[520px] flex items-center">
        {/* Hero bg image with zoom-in animation, color-graded to deep green */}
        <div
          className="absolute inset-0 animate-hero-zoom"
          style={{
            backgroundImage: "url('/bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
        {/* Deep green grade — neutralizes the teal photo and fits the eco brand */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a2318]/95 via-[#0d2f1f]/90 to-[#123724]/70 z-10" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a2318] to-transparent z-10" />
        {/* Subtle lime glow accents */}
        <div className="absolute inset-0 opacity-25 pointer-events-none z-10">
          <div className="absolute top-10 right-1/3 w-96 h-96 bg-lime-500 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl">
              <AnimatedSection animation="fadeUp" delay={0}>
                <span className="inline-block px-4 py-1.5 bg-lime-500/15 text-lime-300 text-sm font-medium rounded-full mb-6 border border-lime-400/25 backdrop-blur-sm">
                  {t("home.heroTagline")}
                </span>
              </AnimatedSection>
              <AnimatedSection animation="fadeUp" delay={100}>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-[1.1]">
                  {t("home.heroTitle1")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-emerald-300">
                    {t("home.heroTitleHighlight")}
                  </span>
                  {t("home.heroTitle2")}
                  <br />
                  <span className="text-gray-300">{t("home.heroSubtitle")}</span>
                </h1>
              </AnimatedSection>
              <AnimatedSection animation="fadeUp" delay={200}>
                <p className="text-lg text-gray-300 mb-9 leading-relaxed max-w-lg">
                  {t("home.heroDescription")}
                </p>
              </AnimatedSection>
              <AnimatedSection animation="fadeUp" delay={300}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center justify-center bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-lime-500/25 hover:shadow-lime-500/40 hover:-translate-y-0.5"
                  >
                    {t("home.heroCTA")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center border border-white/25 hover:border-white/50 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
                  >
                    {t("nav.about")}
                  </Link>
                </div>
              </AnimatedSection>
            </div>

            {/* Right side — single hero product */}
            <div className="relative h-[420px] hidden lg:block">
              <HeroProduct />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: Social Proof ═══ */}
      <AnimatedSection animation="fadeIn">
        <section className="bg-white py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-400 font-medium mb-6 uppercase tracking-wider">
              {t("home.trusted")}
            </p>
            <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
              {[
                { icon: ShieldCheck, label: t("home.warranty") },
                { icon: Star, label: t("home.rating") },
                { icon: Truck, label: t("home.fastShipping") },
                { icon: RefreshCcw, label: t("home.returnPolicy") },
                { icon: Globe2, label: t("home.carbonNeutral") },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-gray-500"
                >
                  <item.icon className="w-5 h-5 text-lime-600" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ SECTION 4: Trust Badges ═══ */}
      <section className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: ShieldCheck, title: t("home.warranty"), subtitle: t("home.warrantyAll") },
              { icon: Truck, title: t("home.freeShippingShort"), subtitle: t("home.freeShipBadge") },
              { icon: RefreshCcw, title: t("home.trialPeriod"), subtitle: t("home.trialBadge") },
              { icon: CreditCard, title: t("home.securePayment"), subtitle: t("home.securePaymentDesc") },
              { icon: Globe2, title: t("home.climateTitle"), subtitle: t("home.climateBadge") },
              { icon: Package, title: t("home.dhlTitle"), subtitle: t("home.dhlGreenDesc") },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center bg-white rounded-xl p-4 border border-stone-100 shadow-sm"
              >
                <badge.icon className="w-6 h-6 text-lime-600 mb-2.5" strokeWidth={1.8} />
                <p className="font-semibold text-gray-900 text-sm">{badge.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{badge.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: Popular Products ═══ */}
      {bestsellers.length > 0 && (
        <AnimatedSection animation="fadeUp">
          <section className="bg-stone-50 py-16 md:py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="font-display text-3xl font-semibold tracking-tight text-gray-900 mb-2">
                    {t("home.popularProducts")}
                  </h2>
                  <p className="text-gray-500">{t("home.popularProductsDesc")}</p>
                </div>
                <Link
                  href="/catalog"
                  className="hidden sm:inline-flex items-center text-lime-600 hover:text-lime-700 font-medium transition-colors"
                >
                  {t("home.viewAll")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {bestsellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="sm:hidden mt-8 text-center">
                <Link
                  href="/catalog"
                  className="inline-flex items-center text-lime-600 hover:text-lime-700 font-medium transition-colors"
                >
                  {t("home.viewAll")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ═══ SECTION 6: Promo Banner ═══ */}
      <AnimatedSection animation="scaleIn">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-lime-500 via-emerald-500 to-green-600 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative px-8 py-12 md:px-12 md:py-14 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                  {t("home.promoTitle")}
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                  {t("home.promoHeadline")}
                </h3>
                <p className="text-white/85 max-w-lg">{t("home.promoDescription")}</p>
              </div>
              <Link
                href="/catalog"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-lg hover:bg-lime-50 transition-colors shadow-lg"
              >
                {t("home.shopNow")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ SECTION 7: Premium & Sustainable — Snackbox Showcase ═══ */}
      {snackbox && (
        <AnimatedSection animation="slideLeft">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative group">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-lime-50 to-emerald-100 shadow-xl transition-all duration-500 group-hover:shadow-2xl relative">
                  {snackbox.imageUrl ? (
                    <img
                      src={snackbox.imageUrl}
                      alt={snackbox.name}
                      className="w-full h-full object-contain p-8 md:p-12 transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lime-300">
                      <Package className="w-20 h-20" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-lime-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="absolute -top-3 -right-3 bg-lime-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                  <Leaf className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                  {snackbox.manufacturer || "HAUSKU"}
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-100 text-lime-700 text-sm font-medium rounded-full mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("home.personalization")}
                </span>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-gray-900 mb-2">
                  {snackbox.name}
                </h2>
                <p className="text-sm text-lime-700 font-medium mb-4">
                  {snackbox.category?.name} ·{" "}
                  {snackbox.variants.length > 0 ? snackbox.variants[0]?.color : ""}
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {snackbox.description}
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  {snackbox.variants.slice(0, 3).map((v) => (
                    <span
                      key={v.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg text-sm text-gray-600"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: v.colorHex || "#ccc" }}
                      />
                      {v.color}
                    </span>
                  ))}
                  {snackbox.variants.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-stone-100 rounded-lg text-sm text-gray-500">
                      +{snackbox.variants.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Link
                    href={`/product/${snackbox.slug}`}
                    className="inline-flex items-center bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-lime-500/25 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {t("home.personalizeNow")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(snackbox.basePrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ═══ SECTION 8: German Engineering — Laptop Cushion (Image Right, Data Left) ═══ */}
      {laptopCushion && (
        <AnimatedSection animation="slideRight">
          <section className="bg-stone-50 border-y border-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
                    🇩🇪 {t("home.ergonomics")}
                  </span>
                  <h2 className="font-display text-3xl font-semibold tracking-tight text-gray-900 mb-2">
                    {laptopCushion.name}
                  </h2>
                  <p className="text-sm text-emerald-600 font-medium mb-4">
                    {laptopCushion.category?.name} ·{" "}
                    {laptopCushion.variants.length > 0
                      ? laptopCushion.variants[0]?.color
                      : ""}
                  </p>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {laptopCushion.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      { icon: Smartphone, text: t("home.ergoFeature1") },
                      { icon: Hand, text: t("home.ergoFeature2") },
                      { icon: Laptop, text: t("home.ergoFeature3") },
                      { icon: Feather, text: t("home.ergoFeature4") },
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <feat.icon className="w-4 h-4 text-emerald-600" />
                        </span>
                        <span className="text-gray-600 text-sm pt-1.5">
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Link
                      href={`/product/${laptopCushion.slug}`}
                      className="inline-flex items-center bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-lime-500/25 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {t("home.learnMore")}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(laptopCushion.basePrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 shadow-xl transition-all duration-500 group-hover:shadow-2xl relative">
                    {laptopCushion.imageUrl ? (
                      <img
                        src={laptopCushion.imageUrl}
                        alt={laptopCushion.name}
                        className="w-full h-full object-contain p-8 md:p-12 transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-300">
                        <Package className="w-20 h-20" strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="absolute -top-3 -left-3 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                    {t("home.ergoBadge")}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ═══ SECTION 9: Stainless Steel Excellence — Brotdose 1400ml (Image Left, Data Right) ═══ */}
      {lunchBox1400 && (
        <AnimatedSection animation="slideLeft">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative group">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-lime-100 shadow-xl transition-all duration-500 group-hover:shadow-2xl relative">
                  {lunchBox1400.imageUrl ? (
                    <img
                      src={lunchBox1400.imageUrl}
                      alt={lunchBox1400.name}
                      className="w-full h-full object-contain p-8 md:p-12 transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-green-300">
                      <Package className="w-20 h-20" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="absolute -top-3 -right-3 bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                  {t("home.steelBadge")}
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  {t("home.steelTag")}
                </span>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-gray-900 mb-2">
                  {lunchBox1400.name}
                </h2>
                <p className="text-sm text-green-700 font-medium mb-4">
                  {lunchBox1400.category?.name} ·{" "}
                  {lunchBox1400.variants.length > 0
                    ? lunchBox1400.variants[0]?.size
                    : ""}{" "}
                  ·{" "}
                  {lunchBox1400.variants.length > 0
                    ? lunchBox1400.variants[0]?.color
                    : ""}
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {lunchBox1400.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: Lock, text: t("home.steelFeature1") },
                    { icon: UtensilsCrossed, text: t("home.steelFeature2") },
                    { icon: Sparkles, text: t("home.steelFeature3") },
                    { icon: Leaf, text: t("home.steelFeature4") },
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <feat.icon className="w-4 h-4 text-green-700" />
                      </span>
                      <span className="text-gray-600 text-sm pt-1.5">
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Link
                    href={`/product/${lunchBox1400.slug}`}
                    className="inline-flex items-center bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-lime-500/25 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {t("home.learnMore")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(lunchBox1400.basePrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ═══ SECTION 10: Why hausku ═══ */}
      <AnimatedSection animation="fadeUp">
        <section className="bg-stone-50 border-t border-stone-100 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-gray-900 mb-4">
                {t("home.whyTitle")}{" "}
                <span className="text-lime-600">hausku</span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                {t("home.whySubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, title: t("home.warrantyTitle"), text: t("home.warrantyText") },
                { icon: Globe2, title: t("home.climateTitle"), text: t("home.climateText") },
                { icon: RefreshCcw, title: t("home.trialTitle"), text: t("home.trialText") },
                { icon: Package, title: t("home.dhlTitle"), text: t("home.dhlText") },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-stone-100"
                >
                  <span className="w-11 h-11 rounded-xl bg-lime-50 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-lime-600" strokeWidth={1.8} />
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ SECTION 11: Reviews ═══ */}
      <AnimatedSection animation="scaleIn">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-gray-900 mb-3">
              {t("home.reviewsTitle")}
            </h2>
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-500 mt-2">{t("home.reviewsAvg")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Ludolph C.", rating: 5, title: "Super Qualität", text: "Super hochwertig. Sogar eine Ersatzdichtung dabei.", date: "Mai 2026" },
              { name: "Shakeel H.", rating: 5, title: "Sehr zufrieden!", text: "Mein Kind benutzt diese Edelstahl-Brotdose täglich.", date: "Mai 2025" },
              { name: "danescu a.", rating: 5, title: "Tip top", text: "Die Box hat einen einfachen und praktischen Deckelverschluss.", date: "Dez 2025" },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 text-yellow-400 mb-3">
                  {Array.from({ length: review.rating }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {review.text}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-medium text-gray-600">{review.name}</span>
                  <span>{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ SECTION 12: Newsletter ═══ */}
      <AnimatedSection animation="fadeUp">
        <section className="bg-emerald-950 text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight mb-4">
              {t("home.newsletterTitle")}
            </h2>
            <p className="text-emerald-200/70 mb-8 max-w-xl mx-auto">
              {t("home.newsletterDesc")}
            </p>
            <NewsletterForm
              placeholder={t("home.newsletterPlaceholder")}
              cta={t("home.newsletterCTA")}
            />
            <p className="text-xs text-emerald-200/50 mt-4">
              {t("home.newsletterDisclaimer")}
            </p>
          </div>
        </section>
      </AnimatedSection>
    </>
  );
}
