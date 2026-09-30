"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ReturnItem = {
  id: number;
  returnNumber: string;
  status: string;
  reason: string;
  createdAt: string;
  order: { orderNumber: string; total: number };
  customer: { id: number; email: string; name: string | null } | null;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Eingegangen",
  APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt",
  RECEIVED: "Ware erhalten",
  REFUNDED: "Erstattet",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  RECEIVED: "bg-purple-100 text-purple-800",
  REFUNDED: "bg-green-100 text-green-800",
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/admin/returns?${params.toString()}`);
      const data = await res.json();
      setReturns(data.returns || []);
    } catch {
      // Silently fail
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Retouren</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">Alle Status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Retouren-Nr.
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Bestellung
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Kunde
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Grund
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Datum
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Wird geladen...
                </td>
              </tr>
            ) : returns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  {statusFilter
                    ? "Keine Retouren mit diesem Status"
                    : "Noch keine Retouren vorhanden."}
                </td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/returns/${r.id}`}
                      className="font-medium text-gray-900 hover:text-lime-500"
                    >
                      {r.returnNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {r.order.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-medium text-gray-900">
                      {r.customer?.name || "—"}
                    </p>
                    <p className="text-gray-500">{r.customer?.email || "—"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                    {r.reason}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(r.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[r.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/returns/${r.id}`}
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        {returns.length} Retoure{returns.length !== 1 ? "n" : ""}
      </p>
    </div>
  );
}
