import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "@/lib/i18n";
import AnimatedSection from "@/components/shared/AnimatedSection";
import Marquee from "@/components/shared/Marquee";
import StatCounter from "@/components/shared/StatCounter";
import HeroBlob from "@/components/storefront/HeroBlob";
import ProductRail from "@/components/storefront/ProductRail";
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
  ArrowUpRight,
} from "lucide-react";

export default async function HomePage() {
  const { t, locale } = await getTranslations();
  const de = locale === "de";

  const [bestsellers, snackbox, laptopCushion, lunchBox1400] =
    await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        include: { category: true, variants: { where: { active: true } } },
        orderBy: { createdAt: "asc" },
        take: 6,
      }),
      prisma.product.findUnique({
        where: { slug: "couchbar-snackbox" },
        include: { category: true, variants: { where: { active: true } } },
      }),
      prisma.product.findUnique({
        where: { slug: "laptopkissen-grau" },
        include: { category: true, variants: { where: { active: true } } },
      }),
      prisma.product.findUnique({
        where: { slug: "brotdose-1400ml" },
        include: { category: true, variants: { where: { active: true } } },
      }),
    ]);

  const tickerItems = [
    de ? "Kostenloser Versand ab 30 €" : "Free shipping over €30",
    de ? "60 Tage Testzeit" : "60-day trial",
    de ? "2 Jahre Garantie" : "2 year warranty",
    de ? "Klimaneutraler Versand" : "Carbon-neutral shipping",
    de ? "100% auslaufsicher" : "100% leak-proof",
  ];

  return (
    <>
      {/* ═══ 1 — ANNOUNCEMENT MARQUEE ═══ */}
      <div className="bg-[#0F2A1C] text-lime-200 py-2.5 text-xs sm:text-sm font-medium tracking-wide">
        <Marquee speed={26}>
          {tickerItems.map((item, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap">
              <Leaf className="w-3.5 h-3.5 text-lime-400" />
              {item}
            </span>
          ))}
        </Marquee>
      </div>

      {/* ═══ 2 — HERO ═══ */}
      <section className="relative overflow-hidden">
        {/* Ambient gradient blobs + grain wash */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-24 w-[420px] h-[420px] bg-lime-300/40 rounded-full blur-[110px]" />
          <div className="absolute bottom-0 right-0 w-[380px] h-[380px] bg-amber-200/50 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-grain opacity-[0.04] mix-blend-multiply" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 md:pt-20 md:pb-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
            {/* Left — copy */}
            <div className="max-w-xl">
              <AnimatedSection animation="fadeUp" delay={0}>
                <span className="inline-flex items-center gap-2 bg-white shadow-sm border border-gray-100 rounded-full pl-1.5 pr-4 py-1.5 mb-7 -rotate-1">
                  <span className="w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    {de ? "Neu gedacht für dein Zuhause" : "Reimagined for your home"}
                  </span>
                </span>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={100}>
                <h1 className="font-display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4.2rem] font-semibold tracking-tight text-gray-900">
                  {de ? "Alltag, der sich" : "Everyday things,"}
                  <br />
                  <span className="relative inline-block">
                    {de ? "gut anfühlt" : "made to last"}
                    <svg
                      className="animate-swash absolute left-0 -bottom-2 w-full h-4"
                      viewBox="0 0 340 24"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 18C60 6 150 2 200 10C250 18 300 8 338 14"
                        stroke="#84CC16"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={200}>
                <p className="text-lg text-gray-600 leading-relaxed mt-7 max-w-md">
                  {de
                    ? "Edelstahl-Brotdosen, Snackboxen und Lapdesks — durchdacht designt, nachhaltig gemacht und für Jahre gebaut, nicht für eine Saison."
                    : "Stainless-steel lunch boxes, snack organizers and lapdesks — thoughtfully designed, sustainably made, and built for years, not a season."}
                </p>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={300}>
                <div className="flex flex-wrap items-center gap-4 mt-9">
                  <Link
                    href="/catalog"
                    className="group inline-flex items-center gap-2 bg-gray-900 hover:bg-lime-500 text-white font-semibold pl-7 pr-6 py-4 rounded-full transition-colors duration-300 shadow-lg shadow-gray-900/10"
                  >
                    {de ? "Jetzt entdecken" : "Shop the collection"}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-gray-700 font-semibold hover:text-lime-600 transition-colors border-b-2 border-transparent hover:border-lime-500 pb-1"
                  >
                    {de ? "Unsere Geschichte" : "Our story"}
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeIn" delay={450}>
                <div className="flex items-center gap-3 mt-10">
                  <div className="flex -space-x-2">
                    {["A", "L", "S", "M"].map((letter) => (
                      <div
                        key={letter}
                        className="w-8 h-8 rounded-full bg-lime-100 border-2 border-[#F6F2E7] flex items-center justify-center text-[11px] font-bold text-lime-700"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    4.8 {de ? "aus 47 Bewertungen" : "from 47 reviews"}
                  </span>
                </div>
              </AnimatedSection>
            </div>

            {/* Right — hero blob visual */}
            <div className="relative h-[380px] sm:h-[460px] lg:h-[520px]">
              <HeroBlob />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3 — BENTO TRUST GRID ═══ */}
      <AnimatedSection animation="fadeUp">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 md:-mt-6 pb-16 md:pb-20 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* Big story card */}
            <div className="col-span-2 lg:col-span-2 lg:row-span-2 bg-[#0F2A1C] rounded-3xl p-7 md:p-9 flex flex-col justify-between min-h-[220px] md:min-h-[280px] relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-lime-500/20 rounded-full blur-3xl" />
              <Globe2 className="w-7 h-7 text-lime-400 relative" />
              <div className="relative">
                <p className="text-white font-display text-2xl md:text-3xl font-medium leading-snug mb-2">
                  {de
                    ? "Klimabewusst produziert, für den Alltag gebaut."
                    : "Made with the climate in mind, built for daily life."}
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1 text-lime-300 text-sm font-semibold hover:text-lime-200 transition-colors"
                >
                  {de ? "Mehr erfahren" : "Learn more"}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {[
              { icon: ShieldCheck, title: de ? "2 Jahre Garantie" : "2-Year Warranty", tone: "bg-white" },
              { icon: Truck, title: de ? "Ab 30 € gratis" : "Free over €30", tone: "bg-lime-500 text-white" },
              { icon: RefreshCcw, title: de ? "60 Tage testen" : "60-Day Trial", tone: "bg-white" },
              { icon: CreditCard, title: de ? "Sichere Zahlung" : "Secure Checkout", tone: "bg-amber-100" },
            ].map((card, i) => (
              <div
                key={i}
                className={`${card.tone} rounded-3xl p-5 md:p-6 flex flex-col justify-between min-h-[130px] shadow-sm border border-black/[0.03]`}
              >
                <card.icon className={`w-5 h-5 ${card.tone.includes("text-white") ? "text-white" : "text-gray-900"}`} strokeWidth={1.8} />
                <p className={`font-semibold text-sm mt-4 ${card.tone.includes("text-white") ? "text-white" : "text-gray-900"}`}>
                  {card.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ 4 — PRODUCT RAIL (horizontal scroll-snap) ═══ */}
      {bestsellers.length > 0 && (
        <AnimatedSection animation="fadeUp">
          <section className="py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">
                    {de ? "Sortiment" : "The edit"}
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-2">
                    {de ? "Beliebt & bewährt" : "Popular & proven"}
                  </h2>
                </div>
                <Link
                  href="/catalog"
                  className="hidden sm:inline-flex items-center text-gray-700 hover:text-lime-600 font-medium transition-colors shrink-0"
                >
                  {t("home.viewAll")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <ProductRail products={bestsellers} />
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ═══ Divider — simple line with centered leaf badge ═══ */}
      <div className="flex items-center justify-center py-10 md:py-14">
        <div className="h-px w-16 sm:w-24 bg-lime-300" />
        <span className="mx-4 w-9 h-9 rounded-full bg-lime-500 flex items-center justify-center shadow-sm shadow-lime-500/25">
          <Leaf className="w-4 h-4 text-white" />
        </span>
        <div className="h-px w-16 sm:w-24 bg-lime-300" />
      </div>

      {/* ═══ 5 — EDITORIAL SPLIT: Snackbox ═══ */}
      {snackbox && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideLeft">
              <div className="sticky top-24 relative">
                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-gradient-to-br from-lime-50 to-emerald-100 shadow-xl relative group">
                  {snackbox.imageUrl ? (
                    <img
                      src={snackbox.imageUrl}
                      alt={snackbox.name}
                      className="w-full h-full object-contain p-10 transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lime-300">
                      <Package className="w-20 h-20" strokeWidth={1} />
                    </div>
                  )}
                </div>
                <div className="absolute -top-3 -right-3 bg-lime-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg -rotate-3">
                  <Leaf className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                  {snackbox.manufacturer || "HAUSKU"}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideRight">
              <div>
                <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">
                  {snackbox.category?.name}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-2 mb-4">
                  {snackbox.name}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  {snackbox.description}
                </p>
                <div className="flex flex-wrap gap-3 mb-9">
                  {snackbox.variants.slice(0, 3).map((v) => (
                    <span
                      key={v.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg text-sm text-gray-600"
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: v.colorHex || "#ccc" }} />
                      {v.color}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    href={`/product/${snackbox.slug}`}
                    className="inline-flex items-center bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-lime-500/25 hover:-translate-y-0.5"
                  >
                    {de ? "Jetzt personalisieren" : "Customize now"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(snackbox.basePrice)}
                  </span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ═══ 6 — EDITORIAL SPLIT: Laptop Cushion (reversed, dark band) ═══ */}
      {laptopCushion && (
        <section className="bg-[#0F2A1C] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection animation="slideRight" className="lg:order-2">
                <div>
                  <span className="text-xs font-bold text-lime-300 uppercase tracking-widest">
                    {laptopCushion.category?.name}
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-2 mb-4">
                    {laptopCushion.name}
                  </h2>
                  <p className="text-white/70 mb-8 leading-relaxed text-lg">
                    {laptopCushion.description}
                  </p>
                  <ul className="space-y-4 mb-9">
                    {[
                      { icon: Smartphone, text: t("home.ergoFeature1") },
                      { icon: Hand, text: t("home.ergoFeature2") },
                      { icon: Laptop, text: t("home.ergoFeature3") },
                      { icon: Feather, text: t("home.ergoFeature4") },
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <feat.icon className="w-4 h-4 text-lime-300" />
                        </span>
                        <span className="text-white/80 text-sm pt-1.5">{feat.text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Link
                      href={`/product/${laptopCushion.slug}`}
                      className="inline-flex items-center bg-lime-500 hover:bg-lime-400 text-[#0F2A1C] font-bold px-8 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {t("home.learnMore")}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                    <span className="text-2xl font-bold">
                      {formatPrice(laptopCushion.basePrice)}
                    </span>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slideLeft" className="lg:order-1">
                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-white/5 shadow-2xl relative group border border-white/10">
                  {laptopCushion.imageUrl ? (
                    <img
                      src={laptopCushion.imageUrl}
                      alt={laptopCushion.name}
                      className="w-full h-full object-contain p-10 transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <Package className="w-20 h-20" strokeWidth={1} />
                    </div>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* ═══ 7 — KINETIC STATS STRIP ═══ */}
      <AnimatedSection animation="fadeUp">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 text-center md:text-left">
            <StatCounter value={4.8} decimals={1} label={de ? "Ø Bewertung" : "avg. rating"} />
            <StatCounter value={2} suffix={de ? " Jahre" : "-yr"} label={de ? "Garantie" : "warranty"} />
            <StatCounter value={60} suffix=" " label={de ? "Tage Testzeit" : "day trial"} />
            <StatCounter value={100} suffix="%" label={de ? "recycelbar" : "recyclable"} />
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ 8 — EDITORIAL SPLIT: Lunchbox 1400ml ═══ */}
      {lunchBox1400 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideLeft">
              <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-gradient-to-br from-green-50 to-lime-100 shadow-xl relative group">
                {lunchBox1400.imageUrl ? (
                  <img
                    src={lunchBox1400.imageUrl}
                    alt={lunchBox1400.name}
                    className="w-full h-full object-contain p-10 transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-green-300">
                    <Package className="w-20 h-20" strokeWidth={1} />
                  </div>
                )}
                <div className="absolute -top-3 -right-3 bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg rotate-3">
                  {t("home.steelBadge")}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideRight">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase tracking-widest">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  {t("home.steelTag")}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-2 mb-4">
                  {lunchBox1400.name}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  {lunchBox1400.description}
                </p>
                <ul className="space-y-4 mb-9">
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
                      <span className="text-gray-600 text-sm pt-1.5">{feat.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    href={`/product/${lunchBox1400.slug}`}
                    className="inline-flex items-center bg-gray-900 hover:bg-lime-500 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {t("home.learnMore")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(lunchBox1400.basePrice)}
                  </span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ═══ 9 — TESTIMONIAL MARQUEE (two rows, opposite directions) ═══ */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 md:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              {t("home.reviewsTitle")}
            </h2>
            <p className="text-gray-500 mt-2">{t("home.reviewsAvg")}</p>
          </div>

          {[
            [
              { name: "Ludolph C.", title: de ? "Super Qualität" : "Great quality", text: de ? "Super hochwertig. Sogar eine Ersatzdichtung dabei." : "Really well made. Even comes with a spare seal." },
              { name: "Shakeel H.", title: de ? "Sehr zufrieden!" : "Very happy!", text: de ? "Mein Kind benutzt diese Edelstahl-Brotdose täglich." : "My kid uses this stainless lunchbox daily." },
              { name: "danescu a.", title: "Tip top", text: de ? "Die Box hat einen einfachen und praktischen Deckelverschluss." : "The box has a simple, practical lid latch." },
              { name: "Petra W.", title: de ? "Absolute Empfehlung" : "Highly recommend", text: de ? "Endlich eine Marke, die hält was sie verspricht." : "Finally a brand that keeps its promises." },
            ],
            [
              { name: "Jonas B.", title: de ? "Top Verarbeitung" : "Top build quality", text: de ? "Man merkt sofort die Liebe zum Detail." : "You notice the attention to detail immediately." },
              { name: "Meike S.", title: de ? "Alltagstauglich" : "Everyday-proof", text: de ? "Nutze die Snackbox jedes Wochenende." : "I use the snack box every single weekend." },
              { name: "Dominik R.", title: de ? "Schneller Versand" : "Fast shipping", text: de ? "Zwei Tage nach Bestellung war alles da." : "Everything arrived two days after ordering." },
              { name: "Aylin K.", title: de ? "Schönes Design" : "Beautiful design", text: de ? "Sieht auf jedem Küchentisch gut aus." : "Looks great on any kitchen table." },
            ],
          ].map((row, rowIdx) => (
            <Marquee key={rowIdx} speed={rowIdx === 0 ? 38 : 44} reverse={rowIdx === 1} className="mb-5 last:mb-0">
              {row.map((review, i) => (
                <div
                  key={i}
                  className="w-[300px] bg-white border border-stone-200 rounded-2xl p-6 shadow-sm shrink-0"
                >
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1.5 text-sm">{review.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.text}</p>
                  <span className="text-xs font-medium text-gray-400">{review.name}</span>
                </div>
              ))}
            </Marquee>
          ))}
        </section>
      </AnimatedSection>

      {/* ═══ 10 — NEWSLETTER ═══ */}
      <AnimatedSection animation="fadeUp">
        <section className="relative bg-[#0F2A1C] text-white py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-lime-500/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-400/15 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-lime-300 mb-6">
              <Leaf className="w-3.5 h-3.5" />
              {de ? "Der grüne Newsletter" : "The green newsletter"}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              {t("home.newsletterTitle")}
            </h2>
            <p className="text-emerald-200/70 mb-9 max-w-xl mx-auto">
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
