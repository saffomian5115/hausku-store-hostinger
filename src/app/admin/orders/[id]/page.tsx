"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type OrderItem = {
  productName: string;
  variantLabel: string | null;
  qty: number;
  unitPrice: number;
};

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string;
  guestEmail: string | null;
  guestName: string | null;
  guestPhone: string | null;
  paymentMethod: string | null;
  paymentId: string | null;
  shippingName: string | null;
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingPostal: string | null;
  shippingCountry: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
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

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(() => {
        setError("Fehler beim Laden");
        setLoading(false);
      });
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      } else {
        const data = await res.json();
        setError(data.error || "Fehler beim Aktualisieren");
      }
    } catch {
      setError("Netzwerkfehler");
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Bestelldetails
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-100 rounded-lg" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Link
          href="/admin/orders"
          className="text-gray-500 hover:text-gray-900 mb-4 inline-block"
        >
          ← Zurück
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error || "Bestellung nicht gefunden"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="text-gray-500 hover:text-gray-900"
          >
            ← Zurück
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Bestellung {order.orderNumber}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={updating}
            className="border rounded-lg px-4 py-2 text-sm font-medium"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Kundeninformationen</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium">{order.guestName || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">E-Mail</p>
                <p className="font-medium">{order.guestEmail || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Telefon</p>
                <p className="font-medium">{order.guestPhone || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Zahlungsart</p>
                <p className="font-medium capitalize">
                  {order.paymentMethod || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Lieferadresse</h2>
            <div className="text-sm">
              <p className="font-medium">{order.shippingName || "—"}</p>
              <p className="text-gray-600">
                {order.shippingStreet || "—"}
              </p>
              <p className="text-gray-600">
                {order.shippingPostal || "—"} {order.shippingCity || "—"}
              </p>
              <p className="text-gray-600">
                {order.shippingCountry || "DE"}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Bestellte Artikel</h2>
            <div className="divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.variantLabel && (
                      <p className="text-sm text-gray-500">{item.variantLabel}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.unitPrice)} × {item.qty}
                    </p>
                    <p className="font-medium">
                      {formatPrice(item.unitPrice * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-bold mb-4">Bestellhinweise</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Zusammenfassung</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Bestellt am</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium">
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Zwischensumme</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Versand</span>
                <span>
                  {order.shippingCost === 0
                    ? "Kostenlos"
                    : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  MwSt. ({order.vatRate}%)
                </span>
                <span>{formatPrice(order.vatAmount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Gesamt</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Aktionen</h2>
            <div className="space-y-2">
              {order.status === "PENDING" && (
                <button
                  onClick={() => handleStatusUpdate("CONFIRMED")}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Bestätigen
                </button>
              )}
              {order.status === "CONFIRMED" && (
                <button
                  onClick={() => handleStatusUpdate("PROCESSING")}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                >
                  In Bearbeitung setzen
                </button>
              )}
              {order.status === "PROCESSING" && (
                <button
                  onClick={() => handleStatusUpdate("SHIPPED")}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                  Als versendet markieren
                </button>
              )}
              {order.status === "SHIPPED" && (
                <button
                  onClick={() => handleStatusUpdate("DELIVERED")}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Als geliefert markieren
                </button>
              )}
              {!["CANCELLED", "RETURNED", "REFUNDED", "DELIVERED"].includes(
                order.status
              ) && (
                <button
                  onClick={() => handleStatusUpdate("CANCELLED")}
                  disabled={updating}
                  className="w-full px-4 py-2 border border-lime-300 text-lime-600 rounded-lg text-sm font-medium hover:bg-lime-50 transition-colors"
                >
                  Stornieren
                </button>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Metadaten</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">ID:</span>{" "}
                <span className="font-mono">{order.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Währung:</span>{" "}
                <span>{order.currency}</span>
              </div>
              {order.paymentId && (
                <div>
                  <span className="text-gray-500">Payment ID:</span>{" "}
                  <span className="font-mono text-xs">{order.paymentId}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Aktualisiert:</span>{" "}
                <span>
                  {new Date(order.updatedAt).toLocaleDateString("de-DE")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
