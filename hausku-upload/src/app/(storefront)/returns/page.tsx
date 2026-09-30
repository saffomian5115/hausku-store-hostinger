import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslations();
  return {
    title: `${t("returns.title")} | hausku`,
    description:
      locale === "de"
        ? "Widerrufsbelehrung und Muster-Widerrufsformular der NI Intellect UG (haftungsbeschränkt)."
        : "Cancellation policy and model withdrawal form of NI Intellect UG (haftungsbeschränkt).",
    robots: { index: true, follow: true },
  };
}

function FormLine({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-gray-600">
      <span className="mt-1.5 block w-6 h-0.5 bg-gray-300 flex-shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </li>
  );
}

export default async function ReturnsPage() {
  const { t, locale } = await getTranslations();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("returns.title")}</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600">{t("returns.consumersOnly")}</p>

        <h2 className="text-xl font-bold mt-10 mb-4 text-gray-900">{t("returns.withdrawalHeading")}</h2>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("returns.intro")}</h3>

        <p className="text-gray-600 font-medium">{t("returns.withdrawalText")}</p>

        <p className="text-gray-600 whitespace-pre-line mt-4">{t("returns.withdrawalPeriod")}</p>

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-2">
          {t("returns.exerciseHeading")}
        </h3>
        <p className="text-gray-600 whitespace-pre-line">{t("returns.exerciseText")}</p>

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-2">
          {t("returns.consequencesHeading")}
        </h3>
        <p className="text-gray-600 whitespace-pre-line">{t("returns.consequencesText")}</p>

        <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-2">
          {t("returns.exclusionsHeading")}
        </h3>
        <p className="text-gray-600 whitespace-pre-line">{t("returns.exclusionsText")}</p>

        {/* Muster-Widerrufsformular */}
        <h2 className="text-xl font-bold mt-12 mb-4 text-gray-900">{t("returns.form")}</h2>
        <p className="text-gray-600 italic mb-4">{t("returns.formIntro")}</p>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 not-prose">
          <ul className="space-y-3">
            <FormLine text={t("returns.formTo")} />
            <FormLine text={t("returns.formRevoke")} />
            <FormLine text={t("returns.formOrdered")} />
            <FormLine text={t("returns.formName")} />
            <FormLine text={t("returns.formAddress")} />
            <FormLine text={t("returns.formSignature")} />
            <FormLine text={t("returns.formDate")} />
          </ul>
          <p className="text-sm text-gray-500 mt-5">{t("returns.formStrikeNote")}</p>
        </div>

        <h2 className="text-xl font-bold mt-12 mb-4 text-gray-900">{t("returns.returnShipment")}</h2>
        <p className="text-gray-600">{t("returns.returnShipmentText")}</p>

        <div className="mt-8">
          <a
            href={locale === "de" ? "/api/legal/withdrawal-form?lang=de" : "/api/legal/withdrawal-form?lang=en"}
            download
            className="inline-flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-lime-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t("returns.downloadForm")}
          </a>
        </div>
      </div>
    </div>
  );
}
