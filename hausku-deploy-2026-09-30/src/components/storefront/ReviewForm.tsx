"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function ReviewForm({ productId }: { productId: number }) {
  const { user, loading } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-gray-600 mb-4">
          Melde dich an, um eine Bewertung zu schreiben.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="bg-lime-500 hover:bg-lime-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Registrieren
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (rating < 1) {
      setError("Bitte wähle eine Sternebewertung.");
      return;
    }
    if (body.trim().length < 3) {
      setError("Bitte schreibe einen kurzen Bewertungstext.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bewertung konnte nicht gespeichert werden.");
      } else {
        setSuccess(
          data.message || "Danke! Deine Bewertung wurde übermittelt."
        );
        setRating(0);
        setTitle("");
        setBody("");
      }
    } catch {
      setError("Netzwerkfehler — bitte erneut versuchen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 border border-gray-200 rounded-2xl p-6"
    >
      <h3 className="font-bold text-gray-900 mb-4">Bewertung schreiben</h3>

      {success && (
        <div className="bg-lime-50 border border-lime-200 text-lime-800 text-sm rounded-xl px-4 py-3 mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Star rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deine Bewertung
        </label>
        <div className="flex gap-1" role="radiogroup" aria-label="Sternebewertung">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 rounded"
              aria-label={`${value} von 5 Sternen`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  (hoverRating || rating) >= value
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="review-title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Titel (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="z.B. Super Qualität"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="review-body"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Deine Erfahrung
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          required
          placeholder="Wie ist das Produkt im Alltag?"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
      >
        {submitting ? "Wird gesendet…" : "Bewertung absenden"}
      </button>
      <p className="text-xs text-gray-400 mt-3">
        Deine Bewertung wird nach Freigabe durch uns veröffentlicht.
      </p>
    </form>
  );
}
