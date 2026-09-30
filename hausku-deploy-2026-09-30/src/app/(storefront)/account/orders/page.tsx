"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/storefront/AuthContext";
import { useLocale } from "@/components/shared/LocaleContext";

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    productName: string;
    variantLabel: string | null;
    qty: number;
    unitPrice: number;
  }[];
  invoice?: {
    id: number;
    invoiceNumber: string;
    pdfPath: string | null;
    issuedAt: string;
  } | null;
  creditNotes?: {
    id: number;
    creditNoteNumber: string;
    pdfPath: string | null;
    amount: number;
    issuedAt: string;
  }[];
  returnRequests?: {
    id: number;
    returnNumber: string;
    status: string;
    reason: string;
    createdAt: string;
  }[];
};



function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

const RETURN_STATUS_LABELS: Record<string, string> = {
  PENDING: "Eingegangen",
  APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt",
  RECEIVED: "Ware erhalten",
  REFUNDED: "Erstattet",
};

const RETURN_REASONS = [
  "Artikel gefällt mir nicht",
  "Falscher Artikel geliefert",
  "Artikel beschädigt",
  "Größe/Farbe passt nicht",
  "Anderer Grund",
];

export default function OrdersPage() {
  const { t } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnOrderId, setReturnOrderId] = useState<number | null>(null);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnItems, setReturnItems] = useState<Record<number, boolean>>({});
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(`/api/customers/${user.id}/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, authLoading]);

  const openReturnForm = (order: Order) => {
    setReturnOrderId(order.id);
    setReturnReason(RETURN_REASONS[0]);
    setReturnItems(
      Object.fromEntries(order.items.map((_, i) => [i, true]))
    );
    setReturnError("");
    setReturnSuccess("");
  };

  const submitReturn = async (order: Order) => {
    if (!user) return;
    setReturnSubmitting(true);
    setReturnError("");
    setReturnSuccess("");

    const selected = order.items
      .map((item, i) => (returnItems[i] ? { ...item, i } : null))
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (selected.length === 0) {
      setReturnError("Bitte wählen Sie mindestens einen Artikel aus.");
      setReturnSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/customers/${user.id}/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          reason: returnReason,
          items: selected.map((s) => ({
            productName: s.productName,
            variantLabel: s.variantLabel,
            qty: s.qty,
          })),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setReturnSuccess(
          `Retoure ${data.returnRequest.returnNumber} wurde angefordert. Wir melden uns in Kürze per E-Mail.`
        );
        setReturnOrderId(null);
        // Refresh orders to show the new return status
        const ordersRes = await fetch(`/api/customers/${user.id}/orders`);
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      } else {
        setReturnError(data.error || "Fehler beim Anfordern der Retoure");
      }
    } catch {
      setReturnError("Netzwerkfehler");
    }
    setReturnSubmitting(false);
  };

  // Loading
  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t("account.orders")}
        </h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t("account.orders")}
        </h1>
        <div className="border rounded-lg p-12 text-center text-gray-500">
          <p className="text-lg font-medium mb-4">
            {t("account.ordersLoginRequired")}
          </p>
          <Link
            href="/account"
            className="inline-block bg-lime-500 hover:bg-lime-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {t("account.signIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t("account.orders")}
      </h1>

      {returnSuccess && (
        <div className="mb-6 bg-lime-50 border border-lime-200 text-lime-800 rounded-lg px-4 py-3 text-sm">
          {returnSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <nav className="space-y-1">
            <Link
              href="/account"
              className="block px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {t("account.overview")}
            </Link>
            <Link
              href="/account/orders"
              className="block px-4 py-3 bg-gray-900 text-white rounded-lg font-medium"
            >
              {t("account.orders")}
            </Link>
            <Link
              href="/account/addresses"
              className="block px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {t("account.addresses")}
            </Link>
          </nav>
        </aside>

        {/* Orders List */}
        <main className="md:col-span-3">
          {orders.length === 0 ? (
            <div className="border rounded-lg p-12 text-center text-gray-500">
              <p className="text-lg font-medium">{t("account.noOrders")}</p>
              <Link
                href="/catalog"
                className="mt-4 inline-block text-lime-500 hover:text-lime-600 font-medium"
              >
                {t("account.shopNow")}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : order.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t(`order.status${order.status}`) || order.status}
                      </span>
                      <p className="font-bold text-gray-900 mt-1">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-gray-600">
                        {item.productName}
                        {item.variantLabel && (
                          <span className="text-gray-400">
                            {" "}
                            ({item.variantLabel})
                          </span>
                        )}{" "}
                        × {item.qty}
                      </p>
                    ))}
                  </div>

                  {/* Invoice / credit note downloads */}
                  {(order.invoice?.pdfPath || (order.creditNotes?.length ?? 0) > 0) && (
                    <div className="border-t mt-3 pt-3 flex flex-wrap gap-3">
                      {order.invoice?.pdfPath && (
                        <a
                          href={`/api/customers/${user!.id}/invoices/${order.invoice.id}/download`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime-600 hover:text-lime-700 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          {t("account.invoiceDownload")}{" "}
                          ({order.invoice.invoiceNumber})
                        </a>
                      )}
                      {order.creditNotes
                        ?.filter((cn) => cn.pdfPath)
                        .map((cn) => (
                          <a
                            key={cn.id}
                            href={`/api/customers/${user!.id}/credit-notes/${cn.id}/download`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lime-600 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            {t("account.creditNoteDownload")}{" "}
                            ({cn.creditNoteNumber})
                          </a>
                        ))}
                    </div>
                  )}

                  {/* Returns (Widerruf) */}
                  {(order.returnRequests?.length ?? 0) > 0 && (
                    <div className="border-t mt-3 pt-3">
                      {order.returnRequests!.map((r) => (
                        <div
                          key={r.id}
                          className="flex flex-wrap items-center gap-2 text-sm"
                        >
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              r.status === "REFUNDED"
                                ? "bg-green-100 text-green-800"
                                : r.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : r.status === "APPROVED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {t("account.return")} {RETURN_STATUS_LABELS[r.status] || r.status}
                          </span>
                          <span className="text-gray-500">
                            {r.returnNumber}
                          </span>
                          {r.reason && r.reason !== "Kein Grund angegeben" && (
                            <span className="text-gray-400 text-xs">
                              {r.reason}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Return request form (Widerruf) */}
                  {order.status === "DELIVERED" &&
                    !(order.returnRequests ?? []).some((r) =>
                      ["PENDING", "APPROVED", "RECEIVED"].includes(r.status)
                    ) && (
                      <div className="border-t mt-3 pt-3">
                        {returnOrderId !== order.id ? (
                          <button
                            onClick={() => openReturnForm(order)}
                            className="text-sm font-semibold text-lime-600 hover:text-lime-700 transition-colors"
                          >
                            {t("account.requestReturn")} →
                          </button>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-3">
                              {t("account.returnTitle")}
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                              {t("account.returnHint")}
                            </p>

                            <div className="space-y-2 mb-3">
                              {order.items.map((item, i) => (
                                <label
                                  key={i}
                                  className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!returnItems[i]}
                                    onChange={(e) =>
                                      setReturnItems((prev) => ({
                                        ...prev,
                                        [i]: e.target.checked,
                                      }))
                                    }
                                    className="accent-lime-500"
                                  />
                                  {item.productName}
                                  {item.variantLabel && (
                                    <span className="text-gray-400">
                                      ({item.variantLabel})
                                    </span>
                                  )}{" "}
                                  × {item.qty}
                                </label>
                              ))}
                            </div>

                            <select
                              value={returnReason}
                              onChange={(e) => setReturnReason(e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-sm mb-3 bg-white"
                            >
                              {RETURN_REASONS.map((reason) => (
                                <option key={reason} value={reason}>
                                  {reason}
                                </option>
                              ))}
                            </select>

                            {returnError && (
                              <p className="text-sm text-red-600 mb-2">
                                {returnError}
                              </p>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => submitReturn(order)}
                                disabled={returnSubmitting}
                                className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                              >
                                {returnSubmitting ? "..." : t("account.submitReturn")}
                              </button>
                              <button
                                onClick={() => {
                                  setReturnOrderId(null);
                                  setReturnError("");
                                }}
                                disabled={returnSubmitting}
                                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                {t("account.cancelAdd")}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
