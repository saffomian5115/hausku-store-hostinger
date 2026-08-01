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
};



function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function OrdersPage() {
  const { t } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
