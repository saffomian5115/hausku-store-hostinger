"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/shared/LocaleContext";
import AnimatedSection from "@/components/shared/AnimatedSection";

export default function ContactPage() {
  const { t, locale } = useLocale();
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    // Simulate form submission — to be replaced with actual API
    await new Promise((r) => setTimeout(r, 1500));
    setFormState("success");
  };

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
                💬 {t("contact.title")}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t("contact.title")}
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
                {t("contact.subtitle")}
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

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* ═══ LEFT: Contact Form ═══ */}
            <div className="lg:col-span-3">
              <AnimatedSection animation="fadeUp">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("contact.formTitle")}</h2>

                  {formState === "success" ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                      <span className="text-4xl mb-4 block">✅</span>
                      <p className="text-green-800 font-semibold text-lg">{t("contact.formSuccess")}</p>
                      <button
                        onClick={() => { setFormState("idle"); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                        className="mt-4 text-green-600 hover:text-green-700 font-medium underline"
                      >
                        {locale === "de" ? "Neue Nachricht" : "New message"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("contact.formName")} *</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 focus:outline-none transition-all text-gray-900"
                            placeholder={locale === "de" ? "Ihr Name" : "Your name"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("contact.formEmail")} *</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 focus:outline-none transition-all text-gray-900"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("contact.formSubject")} *</label>
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 focus:outline-none transition-all text-gray-900"
                          placeholder={locale === "de" ? "Betreff Ihrer Nachricht" : "Subject of your message"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("contact.formMessage")} *</label>
                        <textarea
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 focus:outline-none transition-all text-gray-900 resize-none"
                          placeholder={locale === "de" ? "Ihre Nachricht an uns..." : "Your message to us..."}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={formState === "sending"}
                        className="w-full bg-lime-500 hover:bg-lime-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-lime-500/25 hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        {formState === "sending" ? (
                          <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {t("contact.formSending")}
                          </>
                        ) : (
                          <>
                            {t("contact.formSubmit")}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                          </>
                        )}
                      </button>

                      {formState === "error" && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                          <p className="text-red-700 text-sm">{t("contact.formError")}</p>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Notice about form being disabled */}
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-700 text-sm flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">ℹ️</span>
                      <span>{t("contact.contactFormHint")}</span>
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* ═══ RIGHT: Contact Information ═══ */}
            <div className="lg:col-span-2">
              <AnimatedSection animation="fadeUp" delay={100}>
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("contact.infoTitle")}</h2>

                  {/* Email */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-lime-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t("contact.infoEmail")}</h3>
                        <a href="mailto:info@hausku.de" className="text-lime-600 hover:text-lime-700 font-medium transition-colors">
                          info@hausku.de
                        </a>
                        <p className="text-xs text-gray-400 mt-1">{t("contact.responseTime")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t("contact.infoPhone")}</h3>
                        <p className="text-gray-500">{t("contact.phonePlaceholder")}</p>
                        <p className="text-xs text-gray-400 mt-1">{locale === "de" ? "Bitte vom Klient ergänzen" : "To be provided by client"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t("contact.infoAddress")}</h3>
                        <p className="text-gray-500">{t("contact.addressPlaceholder")}</p>
                        <p className="text-xs text-gray-400 mt-1">{locale === "de" ? "Bitte vom Klient ergänzen" : "To be provided by client"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t("contact.infoHours")}</h3>
                        <p className="text-gray-500">{t("contact.hoursPlaceholder")}</p>
                        <p className="text-xs text-gray-400 mt-1">{locale === "de" ? "Bitte vom Klient ergänzen" : "To be provided by client"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Back to Home */}
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 mt-8"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    {locale === "de" ? "Zurück zur Startseite" : "Back to Home"}
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
