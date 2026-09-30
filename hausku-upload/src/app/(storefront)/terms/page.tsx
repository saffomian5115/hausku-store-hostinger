import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: `${t("terms.title")} | hausku`,
    description:
      "Allgemeine Geschäftsbedingungen und Kundeninformationen der NI Intellect UG (haftungsbeschränkt) für hausku.com.",
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage() {
  const { t } = await getTranslations();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("terms.title")}</h1>

      <div className="prose prose-gray max-w-none">
        {/* Part I — AGB */}
        <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-6">
          {t("terms.agbIntro")}
        </h2>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.agbContentTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.agbContentText")}</p>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.contractConclusionTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.contractConclusionText")}</p>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.retentionTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.retentionText")}</p>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">
          {t("terms.warrantyTitle")}
        </h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.warrantyText")}</p>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.lawTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.lawText")}</p>

        {/* Part II — Kundeninformationen */}
        <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-6 mt-12">
          {t("terms.customerInfoTitle")}
        </h2>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.sellerIdentityTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.sellerIdentityText")}</p>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.contractStepsTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.contractStepsText")}</p>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.languageTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.languageText")}</p>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.essentialFeaturesTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.essentialFeaturesText")}</p>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.pricesTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.pricesText")}</p>

        <h3 id="lieferzahlung" className="text-xl font-bold mt-8 mb-4 text-gray-900 scroll-mt-24">{t("terms.deliveryTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.deliveryText")}</p>

        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("terms.liabilityTitle")}</h3>
        <p className="text-gray-600 whitespace-pre-line">{t("terms.liabilityText")}</p>
      </div>
    </div>
  );
}
