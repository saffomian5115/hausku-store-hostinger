"use client";

import { useRouter, usePathname } from "next/navigation";

export default function LanguageSwitcher({ currentLocale = "de" }: { currentLocale?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLang = (lang: string) => {
    // Replace the locale segment in the URL
    const segments = pathname.split("/");
    if (segments[1] === "de" || segments[1] === "en") {
      segments[1] = lang;
    } else {
      segments.splice(1, 0, lang);
    }
    router.push(segments.join("/") || "/");
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchLang("de")}
        className={`px-2 py-1 rounded transition-colors ${
          currentLocale === "de"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        DE
      </button>
      <button
        onClick={() => switchLang("en")}
        className={`px-2 py-1 rounded transition-colors ${
          currentLocale === "en"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        EN
      </button>
    </div>
  );
}
