"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  id?: number;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  stockQty: number;
  priceOverride: string;
};

type Category = {
  id: number;
  name: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  categories: Category[];
  initialData?: {
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
    variants: Variant[];
  };
};

export default function ProductForm({
  mode,
  categories,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    basePrice: initialData?.basePrice || "",
    categoryId: initialData?.categoryId?.toString() || "",
    imageUrl: initialData?.imageUrl || "",
    active: initialData?.active ?? true,
    featured: initialData?.featured ?? false,
    manufacturer: initialData?.manufacturer || "",
    safetyWarnings: initialData?.safetyWarnings || "",
  });

  const [variants, setVariants] = useState<Variant[]>(
    initialData?.variants || [
      { sku: "", size: "", color: "", colorHex: "#000000", stockQty: 0, priceOverride: "" },
    ]
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Hochladen");
        setUploading(false);
        return;
      }

      setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
    } catch {
      setError("Netzwerkfeehler beim Hochladen");
    }
    setUploading(false);
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { sku: "", size: "", color: "", colorHex: "#000000", stockQty: 0, priceOverride: "" },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validate
    if (!form.name || !form.basePrice || !form.categoryId) {
      setError("Name, Preis und Kategorie sind erforderlich");
      setSaving(false);
      return;
    }

    if (variants.length === 0) {
      setError("Mindestens eine Variante ist erforderlich");
      setSaving(false);
      return;
    }

    // Validate variants
    for (let i = 0; i < variants.length; i++) {
      if (!variants[i].sku) {
        setError(`SKU ist für Variante ${i + 1} erforderlich`);
        setSaving(false);
        return;
      }
    }

    try {
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${initialData?.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          variants,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Speichern");
        setSaving(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Netzwerkfehler");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold mb-4">Grunddaten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preis (€) *</label>
            <input
              type="number"
              step="0.01"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategorie *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full border rounded-lg px-4 py-3"
              required
            >
              <option value="">Kategorie wählen</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-4 py-3"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold mb-4">Produktbild</h2>
        <div className="flex items-start gap-6">
          {form.imageUrl && (
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs shrink-0">
              Bild
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800"
            />
            {uploading && (
              <p className="text-sm text-gray-500 mt-2">Wird hochgeladen...</p>
            )}
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Oder URL eingeben</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 text-sm"
                placeholder="/images/products/example.jpg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Varianten</h2>
          <button
            type="button"
            onClick={addVariant}
            className="text-sm text-lime-500 hover:text-lime-600 font-medium"
          >
            + Variante hinzufügen
          </button>
        </div>
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 relative"
            >
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-lime-500"
                >
                  ✕
                </button>
              )}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">SKU *</label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Größe</label>
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, "size", e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="M"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Farbe</label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, "color", e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Schwarz"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Farbcode</label>
                  <input
                    type="color"
                    value={variant.colorHex}
                    onChange={(e) => updateVariant(index, "colorHex", e.target.value)}
                    className="w-full h-9 border rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Lager *</label>
                  <input
                    type="number"
                    value={variant.stockQty}
                    onChange={(e) =>
                      updateVariant(index, "stockQty", parseInt(e.target.value) || 0)
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold mb-4">Optionen</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Aktiv (im Shop sichtbar)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Empfohlen (auf Startseite)</span>
          </label>
        </div>
      </div>

      {/* GPSR */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold mb-4">Sicherheitsinformationen (GPSR)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hersteller</label>
            <input
              type="text"
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Warnhinweise</label>
            <textarea
              value={form.safetyWarnings}
              onChange={(e) => setForm({ ...form, safetyWarnings: e.target.value })}
              className="w-full border rounded-lg px-4 py-3"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            saving
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gray-900 hover:bg-gray-800 text-white"
          }`}
        >
          {saving
            ? "Wird gespeichert..."
            : mode === "create"
            ? "Produkt erstellen"
            : "Änderungen speichern"}
        </button>
      </div>
    </form>
  );
}
