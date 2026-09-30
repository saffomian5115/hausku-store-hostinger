"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/format";

type Customer = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  isGuest: boolean;
  createdAt: string;
  orderCount: number;
  totalRevenue: number;
};



export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (q?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    try {
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch {
      // Silently fail
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };



  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kunden</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kunden suchen..."
            className="border rounded-lg px-4 py-2 text-sm w-64"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Suchen
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Registrierte Kunden</p>
          <p className="text-2xl font-bold">
            {customers.filter((c) => !c.isGuest).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Gäste-Konten</p>
          <p className="text-2xl font-bold">
            {customers.filter((c) => c.isGuest).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Gesamtumsatz</p>
          <p className="text-2xl font-bold">
            {formatPrice(customers.reduce((sum, c) => sum + c.totalRevenue, 0))}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                E-Mail
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Bestellungen
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Umsatz
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Typ
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Registriert
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Wird geladen...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {search
                    ? "Keine Kunden gefunden"
                    : "Noch keine Kunden vorhanden."}
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {customer.name || "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 text-sm">{customer.orderCount}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatPrice(customer.totalRevenue)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        customer.isGuest
                          ? "bg-gray-100 text-gray-600"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {customer.isGuest ? "Gast" : "Registriert"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString("de-DE")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        {customers.length} Kunde{customers.length !== 1 ? "n" : ""}
      </p>
    </div>
  );
}
