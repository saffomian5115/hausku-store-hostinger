"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const total = parseFloat(searchParams.get("total") || "0") || 0;
  const sessionId = searchParams.get("session_id") || "";

  const [verified, setVerified] = useState(!sessionId); // If no session_id, already verified
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    total: number;
    guestEmail: string | null;
  } | null>(null);

  useEffect(() => {
    if (sessionId) {
      // Verify the Stripe session and get order details
      fetch(`/api/payments/stripe/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orderNumber) {
            setOrderData({
              orderNumber: data.orderNumber,
              total: data.total,
              guestEmail: data.guestEmail || null,
            });
          }
          setVerified(true);
        })
        .catch(() => {
          setVerified(true);
        });
    }
  }, [sessionId]);

  const displayOrderNumber = orderData?.orderNumber || orderNumber || "Unbekannt";
  const displayTotal = orderData?.total || total || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Vielen Dank für Ihre Bestellung!
      </h1>
      <p className="text-gray-600 mb-2">
        Ihre Bestellung wurde erfolgreich aufgegeben.
      </p>

      {!verified ? (
        <div className="bg-gray-50 rounded-lg p-6 my-8">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 my-8 text-left">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Bestellnummer</p>
              <p className="font-bold text-gray-900">{displayOrderNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Gesamtbetrag</p>
              <p className="font-bold text-gray-900">
                {displayTotal > 0 ? formatPrice(displayTotal) : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-600 mb-8">
        Sie erhalten in Kürze eine Bestätigungs-E-Mail mit den Details Ihrer
        Bestellung.
      </p>

      {/* Invoice download + order tracking for guests */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        {orderData?.guestEmail && displayOrderNumber !== "Unbekannt" && (
          <a
            href={`/api/orders/${displayOrderNumber}/invoice?email=${encodeURIComponent(
              orderData.guestEmail
            )}`}
            className="inline-flex items-center justify-center gap-2 border border-lime-500 text-lime-600 hover:bg-lime-50 font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Rechnung (PDF) herunterladen
          </a>
        )}
        <Link
          href="/order-lookup"
          className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Bestellung verfolgen
        </Link>
      </div>

      <div className="flex gap-4 justify-center">
        <Link
          href="/catalog"
          className="bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Weiter einkaufen
        </Link>
        <Link
          href="/"
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Minimal Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            hausku
          </Link>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
