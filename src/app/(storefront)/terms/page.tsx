"use client";

import { useLocale } from "@/components/shared/LocaleContext";

export default function TermsPage() {
  const { t } = useLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("terms.title")}</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600">
          {t("terms.pending")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">1. {t("terms.scope")}</h2>
        <p className="text-gray-600">
          {t("terms.pending")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">2. {t("terms.contractConclusion")}</h2>
        <p className="text-gray-600">
          {t("terms.pending")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">3. {t("terms.rightOfWithdrawal")}</h2>
        <p className="text-gray-600">
          {t("terms.withdrawalText")}
        </p>
      </div>
    </div>
  );
}
