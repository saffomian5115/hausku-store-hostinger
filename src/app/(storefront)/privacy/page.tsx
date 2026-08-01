"use client";

import { useLocale } from "@/components/shared/LocaleContext";

export default function PrivacyPage() {
  const { t } = useLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("privacy.introduction")}</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600">
          {t("privacy.pending")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("privacy.introText")}</h2>
        <p className="text-gray-600">
          {t("privacy.pending")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">1. {t("privacy.responsibleBody")}</h2>
        <p className="text-gray-600">
          NI Intellect UG<br />
          [Adresse pending vom Klient]
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">2. {t("privacy.collectedData")}</h2>
        <p className="text-gray-600">
          {t("privacy.pending")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">3. {t("privacy.cookies")}</h2>
        <p className="text-gray-600">
          {t("privacy.pending")}
        </p>
      </div>
    </div>
  );
}
