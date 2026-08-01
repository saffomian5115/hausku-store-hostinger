"use client";

import Link from "next/link";
import { useLocale } from "@/components/shared/LocaleContext";
import AnimatedSection from "@/components/shared/AnimatedSection";

export default function AboutPage() {
  const { t, locale } = useLocale();

  return (
    <>
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-80 h-80 bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-64 h-64 bg-white rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <AnimatedSection animation="fadeUp">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-sm font-medium rounded-full mb-6 backdrop-blur-sm border border-white/20">
                HAUSKU
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t("about.title")}
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
                {t("about.missionText")}
              </p>
            </div>
          </AnimatedSection>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 60V30C240 50 480 60 720 60C960 60 1200 50 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══ MISSION SECTION ═══ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideLeft">
              <div>
                <span className="inline-block px-3 py-1 bg-lime-100 text-lime-700 text-sm font-medium rounded-full mb-4">
                  {t("about.mission")}
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {t("about.mission")}
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t("about.missionText")}
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideRight">
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-lime-100 to-green-100 flex items-center justify-center shadow-xl">
                  <div className="text-center p-8">
                    <span className="text-7xl mb-4 block">🌱</span>
                    <p className="text-2xl font-bold text-lime-700">
                      {locale === "de" ? "Nachhaltigkeit trifft Design" : "Sustainability meets Design"}
                    </p>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg px-6 py-4 border border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{locale === "de" ? "Made in Germany" : "Made in Germany"}</p>
                  <p className="text-xs text-gray-500">{locale === "de" ? "🇩🇪 Deutsches Design" : "🇩🇪 German Design"}</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ OUR STORY ═══ */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full mb-4">
                📖 {t("about.story")}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("about.story")}</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t("about.storyText")}
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ VALUES SECTION ═══ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-lime-100 text-lime-700 text-sm font-medium rounded-full mb-4">
              💚 {t("about.values")}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("about.values")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🛡️", title: t("about.valueQuality"), text: t("about.valueQualityText"), color: "from-blue-100 to-blue-50", iconColor: "text-blue-500" },
              { icon: "🌍", title: t("about.valueSustainability"), text: t("about.valueSustainabilityText"), color: "from-green-100 to-green-50", iconColor: "text-green-500" },
              { icon: "✨", title: t("about.valueDesign"), text: t("about.valueDesignText"), color: "from-purple-100 to-purple-50", iconColor: "text-purple-500" },
              { icon: "💬", title: t("about.valueService"), text: t("about.valueServiceText"), color: "from-amber-100 to-amber-50", iconColor: "text-amber-500" },
            ].map((value, i) => (
              <AnimatedSection key={i} animation="scaleIn" delay={i * 100}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{value.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{value.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM SECTION ═══ */}
      <AnimatedSection animation="fadeUp">
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mb-4">
                👥 {t("about.team")}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("about.team")}</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">
                {t("about.teamText")}
              </p>
              {/* Team avatar placeholder */}
              <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 rounded-full bg-gradient-to-br from-lime-200 to-green-200 flex items-center justify-center text-lime-600 font-bold text-xl shadow-md border-2 border-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 italic">
                {locale === "de"
                  ? "👥 Team-Fotos können hier hinzugefügt werden, sobald der Kunde sie bereitstellt."
                  : "👥 Team photos can be added here once the client provides them."}
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ AMAZON / CTA SECTION ═══ */}
      <AnimatedSection animation="scaleIn">
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-lime-400 via-lime-500 to-green-500 text-gray-900">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
              <div className="relative px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-white/40 rounded-full text-sm font-medium mb-4">🛒 {t("about.amazonLink")}</span>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{t("about.amazonLink")}</h3>
                  <p className="text-gray-700 max-w-lg">{t("about.amazonLinkDesc")}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://www.amazon.de/s?me=A1H38T7KVDATDQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-white text-lime-600 font-bold px-8 py-3.5 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    🛒 Amazon.de
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                  <Link
                    href="/catalog"
                    className="inline-flex items-center bg-lime-600 text-white font-bold px-8 py-3.5 rounded-lg hover:bg-lime-700 transition-colors shadow-lg"
                  >
                    {t("about.cta")}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </>
  );
}
