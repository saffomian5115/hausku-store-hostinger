"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

type Category = {
  id: number;
  name: string;
};

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Neues Produkt</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/products"
          className="text-gray-500 hover:text-gray-900"
        >
          ← Zurück
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Neues Produkt</h1>
      </div>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
