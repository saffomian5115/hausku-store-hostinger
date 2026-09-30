"use client";

import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Surface the underlying cause if Next wraps the original error.
  const cause =
    (error as unknown as { cause?: Error }).cause?.message ?? error.message;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-lime-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-lime-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Etwas ist schiefgelaufen
        </h1>
        <p className="text-gray-500 mb-6">
          Bitte versuche es erneut. Falls das Problem weiterhin besteht,
          kontaktiere den Support und gib die Details unten weiter.
        </p>
        <pre className="text-left text-xs bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 overflow-x-auto whitespace-pre-wrap">
          {cause || "Unknown error"}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-lg transition-colors"
          >
            Erneut versuchen
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
