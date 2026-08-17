"use client";

import { useState, useEffect, useCallback } from "react";

type ReviewItem = {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  approved: boolean;
  rejected: boolean;
  createdAt: string;
  product: { id: number; name: string; slug: string; imageUrl: string | null };
  customer: { id: number; name: string | null; email: string } | null;
};

const FILTERS = [
  { value: "", label: "Alle" },
  { value: "pending", label: "Ausstehend" },
  { value: "approved", label: "Freigegeben" },
  { value: "rejected", label: "Abgelehnt" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [message, setMessage] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    try {
      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const act = async (id: number, action: "approve" | "reject" | "reset") => {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "Fehler beim Speichern");
        return;
      }
      fetchReviews();
    } catch {
      setMessage("Netzwerkfehler");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Bewertung wirklich löschen?")) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "Fehler beim Löschen");
        return;
      }
      fetchReviews();
    } catch {
      setMessage("Netzwerkfehler");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Bewertungen</h1>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Produkt</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Kunde</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Bewertung</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Text</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Datum</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Wird geladen...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Keine Bewertungen gefunden.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 align-top">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{review.product.name}</p>
                    <a
                      href={`/product/${review.product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-lime-600 hover:underline"
                    >
                      Ansehen →
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-medium text-gray-900">{review.customer?.name || "—"}</p>
                    <p className="text-gray-500">{review.customer?.email || "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-amber-500 font-medium">
                      {"★".repeat(review.rating)}
                      <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[300px]">
                    {review.title && <p className="font-semibold text-gray-900">{review.title}</p>}
                    <p className="whitespace-pre-line">{review.body}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(review.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        review.approved
                          ? "bg-green-100 text-green-700"
                          : review.rejected
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {review.approved
                        ? "Freigegeben"
                        : review.rejected
                        ? "Abgelehnt"
                        : "Ausstehend"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      {!review.approved && (
                        <button
                          onClick={() => act(review.id, "approve")}
                          className="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Freigeben
                        </button>
                      )}
                      {!review.rejected && review.approved && (
                        <button
                          onClick={() => act(review.id, "reject")}
                          className="text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Ablehnen
                        </button>
                      )}
                      <button
                        onClick={() => remove(review.id)}
                        className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Löschen
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
        {reviews.length} Bewertung{reviews.length !== 1 ? "en" : ""}
      </p>
    </div>
  );
}
