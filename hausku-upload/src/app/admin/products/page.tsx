"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl: string | null;
  active: boolean;
  featured: boolean;
  category: { name: string };
  variants: { stockQty: number }[];
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      // Silently fail
    }
    setLoading(false);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`"${product.name}" wirklich löschen?`)) return;

    setDeleting(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        // If soft deleted (deactivated), update in place
        if (data.message?.includes("deaktiviert")) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === product.id ? { ...p, active: false } : p
            )
          );
        } else {
          // Hard deleted
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
        }
      }
    } catch {
      // Silently fail
    }
    setDeleting(null);
  };

  const totalStock = (variants: { stockQty: number }[]) =>
    variants.reduce((sum, v) => sum + v.stockQty, 0);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Produkte</h1>
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="border rounded-lg px-4 py-2 text-sm w-64"
          />
          <Link
            href="/admin/products/new"
            className="bg-lime-500 hover:bg-lime-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            + Neues Produkt
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Bild
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Kategorie
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Preis
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Lager
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
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  {search
                    ? "Keine Produkte gefunden"
                    : 'Noch keine Produkte vorhanden. Klicken Sie auf "+ Neues Produkt" um loszulegen.'}
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                      Bild
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatPrice(product.basePrice)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        totalStock(product.variants) === 0
                          ? "text-lime-600"
                          : totalStock(product.variants) <= 5
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {totalStock(product.variants)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.active ? "Aktiv" : "Inaktiv"}
                    </span>
                    {product.featured && (
                      <span className="ml-1 inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ★
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                      >
                        Bearbeiten
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deleting === product.id}
                        className="text-sm text-lime-500 hover:text-lime-700 font-medium disabled:opacity-50"
                      >
                        {deleting === product.id ? "..." : "Löschen"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        {filtered.length} von {products.length} Produkten
      </p>
    </div>
  );
}
