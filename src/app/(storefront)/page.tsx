import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import ProductCard from "@/components/storefront/ProductCard";
import { getTranslations } from "@/lib/i18n";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HeroCutouts from "@/components/storefront/HeroCutouts";
import { formatPrice } from "@/lib/format";

// Force static rendering at build time (cookies() in i18n makes it dynamic by default)
// export const dynamic = "force-static";

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
      <section className="relative hero-bg text-white overflow-hidden min-h-[420px] md:min-h-[500px] flex items-center">
        {/* Hero bg image with zoom-in animation */}
        <div className="absolute inset-0 animate-hero-zoom" style={{ backgroundImage: "url('/bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 30%' }} />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-10" />
        {/* Decorative lime glow accents */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-10">
          <div className="absolute top-10 left-10 w-80 h-80 bg-lime-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-64 h-64 bg-lime-400 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-2xl">
            <AnimatedSection animation="fadeUp" delay={0}>
              <span className="inline-block px-4 py-1.5 bg-lime-500/20 text-lime-300 text-sm font-medium rounded-full mb-6 border border-lime-500/30 backdrop-blur-sm">
                {t("home.heroTagline")}
              </span>
            </AnimatedSection>
            <AnimatedSection animation="fadeUp" delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t("home.heroTitle1")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-green-300">
                  {t("home.heroTitleHighlight")}
                </span>
                {t("home.heroTitle2")}<br />
                <span className="text-gray-300">{t("home.heroSubtitle")}</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="fadeUp" delay={200}>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                {t("home.heroDescription")}
              </p>
            </AnimatedSection>
            <AnimatedSection animation="fadeUp" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/catalog" className="inline-flex items-center justify-center bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 hover:scale-[1.02] animate-pulse-glow">
                  {t("home.heroCTA")}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/about" className="inline-flex items-center justify-center border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/10">
                  {t("nav.about")}
                </Link>
              </div>
            </AnimatedSection>
          </div>

          {/* Right side — Cutout images */}
          <div className="relative h-[420px] hidden lg:block">
            <HeroCutouts />
          </div>
        </div>
        </div>
      </section>

      {/* ═══ SECTION 3: Social Proof ═══ */}
      <AnimatedSection animation="fadeIn">
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400 font-medium mb-6 uppercase tracking-wider">{t("home.trusted")}</p>
          <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
            {[
              { icon: "🛡️", label: t("home.warranty") },
              { icon: "⭐", label: t("home.rating") },
              { icon: "🚚", label: t("home.fastShipping") },
              { icon: "🔄", label: t("home.returnPolicy") },
              { icon: "🌍", label: t("home.carbonNeutral") },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-gray-500">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* ═══ SECTION 4: Trust Badges ═══ */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: "🛡️", title: t("home.warranty"), subtitle: t("home.warrantyAll") },
              { icon: "🚚", title: t("home.freeShippingShort"), subtitle: t("home.freeShipBadge") },
              { icon: "🔄", title: t("home.trialPeriod"), subtitle: t("home.trialBadge") },
              { icon: "💳", title: t("home.securePayment"), subtitle: t("home.securePaymentDesc") },
              { icon: "🌍", title: t("home.climateTitle"), subtitle: t("home.climateBadge") },
              { icon: "📦", title: t("home.dhlTitle"), subtitle: t("home.dhlGreenDesc") },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <span className="text-2xl mb-2">{badge.icon}</span>
                <p className="font-semibold text-gray-900 text-sm">{badge.title}</p>
                <p className="text-xs text-gray-500">{badge.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ═══ SECTION 6: Popular Products with Gallery Float Animation ═══ */}
      {bestsellers.length > 0 && (
        <AnimatedSection animation="fadeUp">
        <section className="bg-gray-50 py-16 md:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("home.popularProducts")}</h2>
                <p className="text-gray-500">{t("home.popularProductsDesc")}</p>
              </div>
              <Link href="/catalog" className="hidden sm:inline-flex items-center text-lime-500 hover:text-lime-600 font-medium transition-colors">
                {t("home.viewAll")}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gallery-grid">
              {bestsellers.map((product, index) => (
                <div key={product.id} className={`gallery-card gallery-card-${index + 1}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
        </AnimatedSection>
      )}

      {/* ═══ SECTION 7: Promo Banner ═══ */}
      <AnimatedSection animation="scaleIn">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-lime-400 via-lime-500 to-green-500 text-gray-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="inline-block px-3 py-1 bg-white/40 rounded-full text-sm font-medium mb-4">{t("home.promoTitle")}</span>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">{t("home.promoHeadline")}</h3>
              <p className="text-gray-700 max-w-lg">{t("home.promoDescription")}</p>
            </div>
            <Link href="/catalog" className="flex-shrink-0 bg-white text-lime-600 font-bold px-8 py-3.5 rounded-lg hover:bg-gray-100 transition-colors shadow-lg">{t("home.shopNow")}</Link>
          </div>
        </div>
      </section>
      </AnimatedSection>



      {/* ═══ SECTION 10: Premium & Sustainable — Snackbox Showcase ═══ */}
      {snackbox && (
      <AnimatedSection animation="slideLeft">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Image with 3D hover lens effect */}
          <div className="relative group perspective-3d">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 shadow-xl transition-all duration-500 group-hover:shadow-2xl relative product-image-card">
              {snackbox.imageUrl ? (
                <img
                  src={snackbox.imageUrl}
                  alt={snackbox.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-300">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              {/* Decorative overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 bg-lime-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-float-slow">
              🌿 {snackbox.manufacturer || "HAUSKU"}
            </div>
          </div>

          {/* Right — Details */}
          <div>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full mb-4">
              ✨ {t("home.personalization")}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{snackbox.name}</h2>
            <p className="text-sm text-amber-600 font-medium mb-4">
              {snackbox.category?.name} · {snackbox.variants.length > 0 ? snackbox.variants[0]?.color : ''}
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {snackbox.description}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              {snackbox.variants.slice(0, 3).map((v) => (
                <span key={v.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: v.colorHex || "#ccc" }} />
                  {v.color}
                </span>
              ))}
              {snackbox.variants.length > 3 && (
                <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-500">
                  +{snackbox.variants.length - 3}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                href={`/product/${snackbox.slug}`}
                className="inline-flex items-center bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-lime-500/25 hover:shadow-xl hover:scale-[1.02]"
              >
                {t("home.personalizeNow")}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{formatPrice(snackbox.basePrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>
      )}

      {/* ═══ SECTION 11: German Engineering — Laptop Cushion (Image Right, Data Left) ═══ */}
      {laptopCushion && (
      <AnimatedSection animation="slideRight">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Details */}
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mb-4">
              🇩🇪 {t("home.ergonomics")}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{laptopCushion.name}</h2>
            <p className="text-sm text-indigo-500 font-medium mb-4">
              {laptopCushion.category?.name} · {laptopCushion.variants.length > 0 ? laptopCushion.variants[0]?.color : ''}
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {laptopCushion.description}
            </p>
            {/* Feature bullet points */}
            <ul className="space-y-3 mb-8">
              {[
                { icon: "📱", text: t("home.ergoFeature1") },
                { icon: "🖐️", text: t("home.ergoFeature2") },
                { icon: "💻", text: t("home.ergoFeature3") },
                { icon: "🪶", text: t("home.ergoFeature4") },
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{feat.icon}</span>
                  <span className="text-gray-600 text-sm">{feat.text}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                href={`/product/${laptopCushion.slug}`}
                className="inline-flex items-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02]"
              >
                {t("home.learnMore")}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{formatPrice(laptopCushion.basePrice)}</span>
              </div>
            </div>
          </div>

          {/* Right — Image */}
          <div className="relative group perspective-3d">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-xl transition-all duration-500 group-hover:shadow-2xl relative product-image-card">
              {laptopCushion.imageUrl ? (
                <img
                  src={laptopCushion.imageUrl}
                  alt={laptopCushion.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-300">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="absolute -top-3 -left-3 bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-float-slow">
              🏆 {t("home.ergoBadge")}
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>
      )}

      {/* ═══ SECTION 12: Stainless Steel Excellence — Brotdose 1400ml (Image Left, Data Right) ═══ */}
      {lunchBox1400 && (
      <AnimatedSection animation="slideLeft">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Image */}
          <div className="relative group perspective-3d">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-200 shadow-xl transition-all duration-500 group-hover:shadow-2xl relative product-image-card">
              {lunchBox1400.imageUrl ? (
                <img
                  src={lunchBox1400.imageUrl}
                  alt={lunchBox1400.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="absolute -top-3 -right-3 bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-float-slow">
              🥇 {t("home.steelBadge")}
            </div>
          </div>

          {/* Right — Details */}
          <div>
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full mb-4">
              🥗 {t("home.steelTag")}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{lunchBox1400.name}</h2>
            <p className="text-sm text-slate-500 font-medium mb-4">
              {lunchBox1400.category?.name} · {lunchBox1400.variants.length > 0 ? lunchBox1400.variants[0]?.size : ''} · {lunchBox1400.variants.length > 0 ? lunchBox1400.variants[0]?.color : ''}
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {lunchBox1400.description}
            </p>
            {/* Feature bullet points */}
            <ul className="space-y-3 mb-8">
              {[
                { icon: "🔒", text: t("home.steelFeature1") },
                { icon: "🍱", text: t("home.steelFeature2") },
                { icon: "🧼", text: t("home.steelFeature3") },
                { icon: "🌱", text: t("home.steelFeature4") },
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{feat.icon}</span>
                  <span className="text-gray-600 text-sm">{feat.text}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                href={`/product/${lunchBox1400.slug}`}
                className="inline-flex items-center bg-slate-700 hover:bg-slate-800 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-slate-700/25 hover:shadow-xl hover:scale-[1.02]"
              >
                {t("home.learnMore")}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{formatPrice(lunchBox1400.basePrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>
      )}

      {/* ═══ SECTION 13: Why hausku ═══ */}
      <AnimatedSection animation="fadeUp">
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("home.whyTitle")} <span className="text-lime-500">hausku</span></h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">{t("home.whySubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🛡️", title: t("home.warrantyTitle"), text: t("home.warrantyText") },
              { icon: "🌍", title: t("home.climateTitle"), text: t("home.climateText") },
              { icon: "🔄", title: t("home.trialTitle"), text: t("home.trialText") },
              { icon: "📦", title: t("home.dhlTitle"), text: t("home.dhlText") },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* ═══ SECTION 14: Reviews ═══ */}
      <AnimatedSection animation="scaleIn">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t("home.reviewsTitle")}</h2>
          <div className="flex items-center justify-center gap-1 text-yellow-400 text-lg">{"★★★★★".split("").map((star, i) => (<span key={i}>{star}</span>))}</div>
          <p className="text-gray-500 mt-2">{t("home.reviewsAvg")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Ludolph C.", rating: 5, title: "Super Qualität", text: "Super hochwertig. Sogar eine Ersatzdichtung dabei.", date: "Mai 2026" },
            { name: "Shakeel H.", rating: 5, title: "Sehr zufrieden!", text: "Mein Kind benutzt diese Edelstahl-Brotdose täglich.", date: "Mai 2025" },
            { name: "danescu a.", rating: 5, title: "Tip top", text: "Die Box hat einen einfachen und praktischen Deckelverschluss.", date: "Dez 2025" },
          ].map((review, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 text-yellow-400 mb-3">{"★".repeat(review.rating)}</div>
              <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.text}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-medium text-gray-600">{review.name}</span>
                <span>{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      </AnimatedSection>

      {/* ═══ SECTION 15: Newsletter ═══ */}
      <AnimatedSection animation="fadeUp">
      <section className="bg-gray-900 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home.newsletterTitle")}</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">{t("home.newsletterDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder={t("home.newsletterPlaceholder")} className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent" />
            <a href="#" className="bg-lime-500 hover:bg-lime-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap text-center">{t("home.newsletterCTA")}</a>
          </div>
          <p className="text-xs text-gray-500 mt-4">{t("home.newsletterDisclaimer")}</p>
        </div>
      </section>
      </AnimatedSection>
    </>
  );
}
