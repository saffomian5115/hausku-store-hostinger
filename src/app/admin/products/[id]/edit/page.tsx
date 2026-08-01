"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

type Category = {
  id: number;
  name: string;
};

type ProductData = {
  id: number;
  name: string;
  description: string;
  basePrice: string;
  categoryId: number;
  imageUrl: string;
  active: boolean;
  featured: boolean;
  manufacturer: string;
  safetyWarnings: string;
  variants: {
    id?: number;
    sku: string;
    size: string;
    color: string;
    colorHex: string;
    stockQty: number;
    priceOverride: string;
  }[];
};

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${productId}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([productData, categoryData]) => {
        if (productData.product) {
          const p = productData.product;
          setProduct({
            id: p.id,
            name: p.name,
            description: p.description || "",
            basePrice: p.basePrice.toString(),
            categoryId: p.categoryId,
            imageUrl: p.imageUrl || "",
            active: p.active,
            featured: p.featured,
            manufacturer: p.manufacturer || "",
            safetyWarnings: p.safetyWarnings || "",
            variants: p.variants.map(
              (v: {
                id: number;
                sku: string;
                size: string | null;
                color: string | null;
                colorHex: string | null;
                stockQty: number;
                priceOverride: number | null;
              }) => ({
                id: v.id,
                sku: v.sku,
                size: v.size || "",
                color: v.color || "",
                colorHex: v.colorHex || "#000000",
                stockQty: v.stockQty,
                priceOverride: v.priceOverride?.toString() || "",
              })
            ),
          });
        } else {
          setError(productData.error || "Produkt nicht gefunden");
        }
        setCategories(categoryData.categories || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Fehler beim Laden");
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Produkt bearbeiten
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Link
          href="/admin/products"
          className="text-gray-500 hover:text-gray-900 mb-4 inline-block"
        >
          ← Zurück
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error || "Produkt nicht gefunden"}
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
        <h1 className="text-2xl font-bold text-gray-900">
          Produkt bearbeiten: {product.name}
        </h1>
      </div>
      <ProductForm mode="edit" categories={categories} initialData={product} />
    </div>
  );
}
