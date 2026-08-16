import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

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

  const [paidToday, ordersToday, paidOrders, openOrders, recentOrders] =
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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

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
    </div>
  );
}
