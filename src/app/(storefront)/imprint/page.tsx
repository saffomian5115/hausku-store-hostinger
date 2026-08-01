"use client";

import { useLocale } from "@/components/shared/LocaleContext";

export default function ImprintPage() {
  const { t } = useLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("imprint.title")}</h1>
      <div className="prose prose-gray max-w-none">
        <h2 className="text-xl font-bold mb-4">{t("imprint.companyInfo")}</h2>
        <p className="text-gray-600">
          NI Intellect UG<br />
          [Straße Nr.]<br />
          [PLZ Ort]<br />
          Deutschland
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("imprint.contactInfo")}</h2>
        <p className="text-gray-600">
          Telefon: [pending]<br />
          E-Mail: info@hausku.de
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("imprint.registerInfo")}</h2>
        <p className="text-gray-600">
          {t("imprint.registerDetails")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("imprint.taxInfo")}</h2>
        <p className="text-gray-600">
          {t("imprint.taxId")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("imprint.ceo")}</h2>
        <p className="text-gray-600">
          {t("imprint.ceoName")}
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">{t("imprint.disclaimer")}</h2>
        <p className="text-gray-600">
          {t("imprint.disclaimerText")}
        </p>
      </div>
    </div>
  );
}
