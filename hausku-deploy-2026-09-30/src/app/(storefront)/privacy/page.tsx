import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: `${t("privacy.title")} | hausku`,
    description:
      "Datenschutzerklärung der NI Intellect UG (haftungsbeschränkt) — Informationen zur Verarbeitung personenbezogener Daten auf hausku.com.",
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage() {
  const { t } = await getTranslations();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("privacy.title")}</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 whitespace-pre-line">{t("privacy.introText")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("privacy.responsibleBody")}</h2>
        <p className="text-gray-600 whitespace-pre-line">{t("privacy.responsibleBodyText")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("privacy.orderDataTitle")}</h2>
        <p className="text-gray-600 whitespace-pre-line">{t("privacy.orderDataText")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("privacy.paypalTitle")}</h2>
        <p className="text-gray-600 whitespace-pre-line">{t("privacy.paypalText")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("privacy.klarnaTitle")}</h2>
        <p className="text-gray-600 whitespace-pre-line">{t("privacy.klarnaText")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("privacy.retentionTitle")}</h2>
        <p className="text-gray-600 whitespace-pre-line">{t("privacy.retentionText")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("privacy.rightsTitle")}</h2>
        <p className="text-gray-600 whitespace-pre-line">{t("privacy.rightsText")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("privacy.complaintTitle")}</h2>
        <p className="text-gray-600 whitespace-pre-line">{t("privacy.complaintText")}</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">{t("privacy.objectionTitle")}</h2>
        <p className="text-gray-600 whitespace-pre-line">{t("privacy.objectionText")}</p>
      </div>
    </div>
  );
}
