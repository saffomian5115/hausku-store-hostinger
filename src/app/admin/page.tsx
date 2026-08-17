import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import DashboardAutoRefresh from "@/components/admin/DashboardAutoRefresh";

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

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(value: Date): string {
  return new Date(value).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [paidToday, ordersToday, paidOrders, openOrders, recentOrders, lowStockVariants] =
    await Promise.all([
      prisma.order.aggregate({
        where: { paidAt: { not: null, gte: todayStart } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.aggregate({
        where: { paidAt: { not: null } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.count({
        where: {
          paidAt: null,
          status: { notIn: ["CANCELLED", "REFUNDED", "RETURNED"] },
        },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          paidAt: true,
          guestName: true,
          guestEmail: true,
        },
      }),
      prisma.productVariant.findMany({
        where: { active: true, stockQty: { lte: 5 } },
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrl: true } },
        },
        orderBy: { stockQty: "asc" },
        take: 10,
      }),
    ]);

  const stats = [
    {
      label: "Umsatz (heute)",
      value: formatPrice(paidToday._sum.total || 0),
      sub: `${paidToday._count} bezahlte Bestellung${paidToday._count !== 1 ? "en" : ""}`,
      color: "text-green-600",
    },
    {
      label: "Bestellungen (heute)",
      value: String(ordersToday),
      sub: "erstellt heute",
      color: "text-blue-600",
    },
    {
      label: "Bezahlt",
      value: String(paidOrders._count),
      sub: `${formatPrice(paidOrders._sum.total || 0)} gesamt`,
      color: "text-lime-600",
    },
    {
      label: "Offen (unbezahlt)",
      value: String(openOrders),
      sub: "warten auf Zahlung",
      color: "text-orange-600",
    },
  ];

  const paidCount = paidOrders._count;
  const totalTracked = paidCount + openOrders;
  const paidPct = totalTracked > 0 ? Math.round((paidCount / totalTracked) * 100) : 0;
  const openPct = totalTracked > 0 ? 100 - paidPct : 0;

  return (
    <DashboardAutoRefresh>
      {/* Low-Stock Alert */}
      {lowStockVariants.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Niedriger Lagerbestand
            </h2>
            <span className="text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-medium">
              {lowStockVariants.length} Artikel{lowStockVariants.length !== 1 ? "e" : ""}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {lowStockVariants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center gap-3 bg-white rounded-lg border border-amber-100 p-3"
              >
                <div className="w-10 h-10 rounded-md bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                  {variant.product.imageUrl ? (
                    <img
                      src={variant.product.imageUrl}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-stone-400">img</span>
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/admin/products/${variant.product.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-lime-600 truncate block"
                  >
                    {variant.product.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {[variant.size, variant.color].filter(Boolean).join(" / ") || "Standard"}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      variant.stockQty === 0 ? "text-red-600" : "text-orange-600"
                    }`}
                  >
                    {variant.stockQty === 0 ? "Ausverkauft" : `Nur noch ${variant.stockQty} Stk.`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
            {stat.sub && (
              <p className={`text-sm mt-1 ${stat.color}`}>{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Payment Status Bar */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Zahlungsstatus</h2>
          <span className="text-sm text-gray-500">
            {totalTracked} Bestellung{totalTracked !== 1 ? "en" : ""} gesamt
          </span>
        </div>
        {totalTracked === 0 ? (
          <div className="h-4 rounded-full bg-gray-100" />
        ) : (
          <div
            className="flex h-4 rounded-full overflow-hidden bg-gray-100"
            role="img"
            aria-label={`${paidCount} bezahlt, ${openOrders} offen`}
          >
            <div
              className="bg-lime-500 transition-all"
              style={{ width: `${paidPct}%` }}
            />
            <div
              className="bg-orange-400 transition-all"
              style={{ width: `${openPct}%` }}
            />
          </div>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-lime-500" />
            <span className="text-gray-600">Bezahlt</span>
            <span className="font-medium">{paidCount}</span>
            <span className="text-gray-400">({paidPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-gray-600">Offen</span>
            <span className="font-medium">{openOrders}</span>
            <span className="text-gray-400">({openPct}%)</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Letzte Bestellungen</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-lime-600 hover:text-lime-700"
          >
            Alle ansehen →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Noch keine Bestellungen vorhanden.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Bestellnr.
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Kunde
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Datum
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Betrag
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Zahlung
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-gray-900 hover:text-lime-500"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-medium text-gray-900">
                      {order.guestName || "—"}
                    </p>
                    <p className="text-gray-500">{order.guestEmail || "—"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    {order.paidAt ? (
                      <div>
                        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-lime-100 text-lime-700">
                          Bezahlt
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(order.paidAt)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Offen</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block text-xs font-medium px-3 py-1.5 rounded-full ${
                        STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardAutoRefresh>
  );
}
