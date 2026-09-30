"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type LookupResult = {
  order: {
    orderNumber: string;
    status: string;
    total: number;
    currency: string;
    createdAt: string;
    paidAt: string | null;
    paymentMethod: string | null;
    trackingNumber: string | null;
    trackingCarrier: string | null;
    shippingName: string | null;
    items: {
      productName: string;
      variantLabel: string | null;
      qty: number;
      unitPrice: number;
    }[];
  };
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ausstehend",
  CONFIRMED: "Bestätigt",
  PROCESSING: "In Bearbeitung",
  SHIPPED: "Versendet",
  DELIVERED: "Geliefert",
  CANCELLED: "Storniert",
  RETURNED: "Retourniert",
  REFUNDED: "Rückerstattet",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-orange-100 text-orange-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bestellung konnte nicht gefunden werden.");
      } else {
        setResult(data as LookupResult);
      }
    } catch {
      setError("Netzwerkfehler — bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  const order = result?.order;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Bestellung verfolgen
      </h1>
      <p className="text-gray-500 mb-8">
        Gib deine Bestellnummer und die bei der Bestellung verwendete E-Mail ein,
        um den Status deiner Bestellung zu sehen.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 mb-8"
      >
        <div>
          <label
            htmlFor="order-number"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Bestellnummer
          </label>
          <input
            id="order-number"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
            placeholder="z.B. hausku-20260817-1234"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="order-email"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            E-Mail-Adresse
          </label>
          <input
            id="order-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="du@beispiel.de"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? "Wird gesucht…" : "Bestellung suchen"}
        </button>
      </form>

      {order && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-gray-500">Bestellnummer</p>
              <p className="font-bold text-gray-900">{order.orderNumber}</p>
            </div>
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${
                STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-6">
              <div>
                <p className="text-gray-500">Bestellt am</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("de-DE")}
                </p>
              </div>
              {order.paidAt && (
                <div>
                  <p className="text-gray-500">Bezahlt am</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.paidAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Gesamtbetrag</p>
                <p className="font-medium text-gray-900">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800 mb-6">
                📦 Sendungsnummer:{" "}
                <span className="font-semibold">{order.trackingNumber}</span>
                {order.trackingCarrier && (
                  <span className="text-indigo-600"> ({order.trackingCarrier})</span>
                )}
              </div>
            )}

            <h2 className="font-bold text-gray-900 mb-3">Artikel</h2>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.productName}
                    </p>
                    <p className="text-gray-500">
                      {[item.variantLabel, `${item.qty}×`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {formatPrice(item.unitPrice * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {order.paidAt && (
              <a
                href={`/api/orders/${order.orderNumber}/invoice?email=${encodeURIComponent(
                  email
                )}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lime-600 hover:text-lime-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Rechnung (PDF) herunterladen
              </a>
            )}

            {!order.paidAt && order.status !== "CANCELLED" && (
              <Link
                href="/contact"
                className="mt-6 inline-block text-sm text-gray-500 hover:text-lime-600 underline"
              >
                Frage zu deiner Bestellung? Kontaktiere uns
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
