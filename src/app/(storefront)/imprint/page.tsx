import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: `${t("imprint.title")} | hausku`,
    description:
      "Impressum der NI Intellect UG (haftungsbeschränkt) — Angaben gemäß § 5 DDG.",
    robots: { index: true, follow: true },
  };
}

export default async function ImprintPage() {
  const { t } = await getTranslations();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("imprint.title")}</h1>
      <p className="text-sm text-gray-500 mb-8">{t("imprint.companyInfo")}</p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t("imprint.companyName")}</h2>
        <p className="text-gray-600 whitespace-pre-line">
          {t("imprint.companyName")}
          {"\n"}
          {t("imprint.addressLine1")}
          {"\n"}
          {t("imprint.addressLine2")}
          {"\n"}
          {t("imprint.representative")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("imprint.contactInfo")}</h2>
        <p className="text-gray-600">
          {t("imprint.phoneDisplay")}
          <br />
          <a
            href="mailto:saleshub@niintellect.de"
            className="text-lime-600 hover:text-lime-700 font-medium transition-colors"
          >
            {t("imprint.emailDisplay")}
          </a>
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("imprint.registerInfo")}</h2>
        <p className="text-gray-600">{t("imprint.registerDetails")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("imprint.taxInfo")}</h2>
        <p className="text-gray-600">{t("imprint.taxId")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("imprint.disputeResolution")}</h2>
        <p className="text-gray-600">{t("imprint.disputeResolutionText")}</p>
      </div>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t("imprint.disclaimer")}</h2>
        <p className="text-gray-600">{t("imprint.disclaimerText")}</p>
      </div>
    </div>
  );
}
