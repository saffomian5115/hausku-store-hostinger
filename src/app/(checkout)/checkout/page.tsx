"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/CartContext";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 30;
const SHIPPING_FLAT_RATE = 4.99;
const VAT_RATE = 19;

type FormErrors = Record<string, string>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, itemCount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    street: "",
    street2: "",
    city: "",
    postalCode: "",
    country: "DE",
    paymentMethod: "stripe",
    notes: "",
  });

  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const vatAmount = parseFloat(((total * VAT_RATE) / 100).toFixed(2));
  const grandTotal = parseFloat((total + shipping + vatAmount).toFixed(2));

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.email.trim()) e.email = "E-Mail ist erforderlich";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Ungültige E-Mail-Adresse";
    if (!form.firstName.trim()) e.firstName = "Vorname ist erforderlich";
    if (!form.lastName.trim()) e.lastName = "Nachname ist erforderlich";
    if (!form.street.trim()) e.street = "Straße ist erforderlich";
    if (!form.city.trim()) e.city = "Stadt ist erforderlich";
    if (!form.postalCode.trim()) e.postalCode = "PLZ ist erforderlich";
    else if (!/^\d{4,5}$/.test(form.postalCode.trim()))
      e.postalCode = "Ungültige PLZ";
    if (!form.paymentMethod) e.paymentMethod = "Zahlungsart wählen";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cart.items.length === 0) return;

    setLoading(true);
    try {
      // Step 1: Create the order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          phone: form.phone || undefined,
          firstName: form.firstName,
          lastName: form.lastName,
          street: form.street,
          street2: form.street2 || undefined,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
          paymentMethod: form.paymentMethod,
          notes: form.notes || undefined,
          items: cart.items.map((item) => ({
            variantId: item.variantId,
            productId: item.productId,
            qty: item.qty,
          })),
        }),
      });

      let orderData: Record<string, unknown> = {};
      try {
        orderData = await orderRes.json();
      } catch {
        setErrors({ submit: "Server-Fehler. Bitte versuchen Sie es erneut." });
        setLoading(false);
        return;
      }

      if (!orderRes.ok) {
        setErrors({
          submit: (orderData.error as string) || "Fehler bei der Bestellung",
        });
        setLoading(false);
        return;
      }

      // Step 2: For Stripe payments, create a checkout session and redirect
      if (form.paymentMethod === "stripe") {
        const paymentRes = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "stripe",
            orderId: orderData.orderId,
          }),
        });

        let paymentData: Record<string, unknown> = {};
        try {
          paymentData = await paymentRes.json();
        } catch {
          setErrors({
            submit:
              "Fehler bei der Zahlung. Bitte versuchen Sie es erneut.",
          });
          setLoading(false);
          return;
        }

        if (!paymentRes.ok) {
          setErrors({
            submit:
              (paymentData.error as string) ||
              "Fehler bei der Zahlungsabwicklung",
          });
          setLoading(false);
          return;
        }

        // Redirect to Stripe Checkout
        clearCart();
        window.location.href = paymentData.url as string;
        return;
      }

      // For other payment methods (PayPal, Klarna) — redirect to success for now
      clearCart();
      router.push(
        `/checkout/success?order=${orderData.orderNumber}&total=${orderData.total}`
      );
    } catch {
      setErrors({ submit: "Netzwerkfehler. Bitte versuchen Sie es erneut." });
      setLoading(false);
    }
  };

  if (cart.items.length === 0 && !loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-4">
            Ihr Warenkorb ist leer
          </p>
          <Link
            href="/catalog"
            className="inline-block bg-lime-500 hover:bg-lime-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Weiter einkaufen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Minimal Checkout Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            hausku
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">1. Kontakt</span>
            <span>→</span>
            <span>2. Versand</span>
            <span>→</span>
            <span>3. Zahlung</span>
          </div>
          <Link
            href="/cart"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Zurück zum Warenkorb
          </Link>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto px-4 py-12"
      >
        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-3 space-y-6">
            <h1 className="text-2xl font-bold">Kasse</h1>

            {/* Guest Contact */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Kontaktdaten</h2>
                <p className="text-sm text-gray-500">
                  oder{" "}
                  <Link
                    href="/account"
                    className="text-red-500 hover:text-red-600"
                  >
                    Konto erstellen
                  </Link>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    placeholder="ihre@email.de"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Telefon (optional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full border rounded-lg px-4 py-3"
                    placeholder="+49 ..."
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-bold mb-4">Lieferadresse</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 ${
                      errors.firstName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 ${
                      errors.lastName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Straße *
                  </label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 ${
                      errors.street ? "border-red-500" : ""
                    }`}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    PLZ *
                  </label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 ${
                      errors.postalCode ? "border-red-500" : ""
                    }`}
                    placeholder="12345"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stadt *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 ${
                      errors.city ? "border-red-500" : ""
                    }`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-bold mb-4">Zahlungsart</h2>
              <div className="space-y-3">
                {[
                  {
                    id: "stripe",
                    label: "Kreditkarte / Apple Pay / Google Pay",
                    icon: "💳",
                  },
                  { id: "paypal", label: "PayPal", icon: "🅿️" },
                  {
                    id: "klarna",
                    label: "Klarna — Kauf auf Rechnung",
                    icon: "🏦",
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      form.paymentMethod === method.id
                        ? "border-gray-900 bg-gray-50"
                        : "hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={form.paymentMethod === method.id}
                      onChange={(e) =>
                        updateField("paymentMethod", e.target.value)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-bold mb-4">
                Bestellhinweise (optional)
              </h2>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
                rows={3}
                placeholder="Besondere Wünsche oder Hinweise..."
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Bestellübersicht</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded shrink-0 flex items-center justify-center text-gray-400 text-xs">
                      Bild
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {[item.size, item.color].filter(Boolean).join(" / ")} ×{" "}
                        {item.qty}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice(item.unitPrice * item.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span>
                    Zwischensumme ({itemCount}{" "}
                    {itemCount === 1 ? "Artikel" : "Artikel"})
                  </span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Versand</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">
                      Kostenlos
                    </span>
                  ) : (
                    <span>{formatPrice(shipping)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>MwSt. ({VAT_RATE}%)</span>
                  <span>{formatPrice(vatAmount)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Gesamt</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-6 font-semibold py-3 rounded-lg transition-colors ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-lime-500 hover:bg-lime-600 text-white"
                }`}
              >
                {loading
                  ? "Wird verarbeitet..."
                  : form.paymentMethod === "stripe"
                    ? "Zur Kasse gehen"
                    : "Bestellung aufgeben"}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Mit der Bestellung akzeptieren Sie unsere{" "}
                <Link href="/terms" className="underline">
                  AGB
                </Link>{" "}
                und{" "}
                <Link href="/privacy" className="underline">
                  Datenschutzrichtlinie
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
