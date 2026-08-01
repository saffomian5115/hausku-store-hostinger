"use client";

import { useLocale } from "@/components/shared/LocaleContext";

export default function ReturnsPage() {
  const { t } = useLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("returns.title")}</h1>
      <div className="prose prose-gray max-w-none">
        <h2 className="text-xl font-bold mb-4">{t("returns.intro")}</h2>
        <p className="text-gray-600">
          {t("returns.withdrawalText")}
        </p>

        <p className="text-gray-600 mt-4">
          {t("returns.withdrawalPeriod")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("returns.form")}</h2>
        <p className="text-gray-600">
          [Wird vom Klient ergänzt — Muster-Widerrufsformular gemäß Anlage 1 zu Art. 246a § 1 Abs. 2 EGBGB]
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("returns.returnShipment")}</h2>
        <p className="text-gray-600">
          [Rücksendeadresse und Prozess werden vom Klient ergänzt]
        </p>
      </div>
    </div>
  );
}
