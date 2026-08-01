"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/storefront/AuthContext";
import { useLocale } from "@/components/shared/LocaleContext";

type Address = {
  id: number;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  street2: string | null;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const { t } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    street2: "",
    city: "",
    postalCode: "",
    isDefault: false,
  });

  const fetchAddresses = () => {
    if (!user) return;
    fetch(`/api/customers/${user.id}/addresses`)
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchAddresses();
  }, [user, authLoading]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/customers/${user.id}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Speichern");
        setSaving(false);
        return;
      }

      setAddresses((prev) => {
        const updated = form.isDefault
          ? prev.map((a) => ({ ...a, isDefault: false }))
          : prev;
        return [...updated, data.address].sort((a, b) =>
          a.isDefault ? -1 : b.isDefault ? 1 : 0
        );
      });
      setShowForm(false);
      setForm({
        firstName: "",
        lastName: "",
        street: "",
        street2: "",
        city: "",
        postalCode: "",
        isDefault: false,
      });
    } catch {
      setError("Netzwerkfehler");
    }
    setSaving(false);
  };

  const handleDelete = async (addressId: number) => {
    if (!user || !confirm("Adresse wirklich löschen?")) return;

    try {
      await fetch(`/api/customers/${user.id}/addresses/${addressId}`, {
        method: "DELETE",
      });
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    } catch {
      // Silently fail
    }
  };

  // Loading
  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("account.addresses")}</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("account.addresses")}</h1>
        <div className="border rounded-lg p-12 text-center text-gray-500">
          <p className="text-lg font-medium mb-4">
            {t("account.loginRequiredAddresses")}
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("account.addresses")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-lime-500 hover:bg-lime-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {showForm ? t("common.cancel") : t("account.addAddress")}
        </button>
      </div>

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
              className="block px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {t("account.orders")}
            </Link>
            <Link
              href="/account/addresses"
              className="block px-4 py-3 bg-gray-900 text-white rounded-lg font-medium"
            >
              {t("account.addresses")}
            </Link>
          </nav>
        </aside>

        <main className="md:col-span-3">
          {/* Add Form */}
          {showForm && (
            <div className="border rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">{t("account.newAddress")}</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("account.firstName")} *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("account.lastName")} *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t("account.street")} *</label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("account.postalCode")} *</label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("account.city")} *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">{t("account.setAsDefault")}</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      saving
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {saving ? t("account.saving") : t("account.saveAddress")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 && !showForm ? (
            <div className="border rounded-lg p-12 text-center text-gray-500">
              <p className="text-lg font-medium">{t("account.noAddresses")}</p>
              <p className="mt-2">{t("account.addAddressHint")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`border rounded-lg p-6 ${
                    addr.isDefault ? "border-gray-900 bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-gray-900">
                          {addr.firstName} {addr.lastName}
                        </p>
                        {addr.isDefault && (
                          <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">
                          {t("account.defaultAddress")}
                        </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {addr.street}
                        {addr.street2 && <>, {addr.street2}</>}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.postalCode} {addr.city}
                      </p>
                      <p className="text-sm text-gray-600">{addr.country}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="text-gray-400 hover:text-lime-500 transition-colors p-2"
                      aria-label="Adresse löschen"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
