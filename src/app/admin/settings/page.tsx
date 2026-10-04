"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

type SettingsForm = {
  shopName: string;
  defaultLanguage: string;
  shopDescription: string;
  vatRate: string;
  vatId: string;
  freeShippingThreshold: string;
  shippingFlatRate: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyManager: string;
};

const EMPTY_FORM: SettingsForm = {
  shopName: "",
  defaultLanguage: "de",
  shopDescription: "",
  vatRate: "19",
  vatId: "",
  freeShippingThreshold: "30",
  shippingFlatRate: "4.99",
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  companyManager: "",
};

type Status = { type: "success" | "error"; message: string } | null;
type TwoFaState = { enabled: boolean; pending: boolean } | null;
type TwoFaSetup = { secret: string; otpauth: string; previewCode: string };

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  // ── 2FA (Correction #30) ──
  const [twoFa, setTwoFa] = useState<TwoFaState>(null);
  const [twoFaSetup, setTwoFaSetup] = useState<TwoFaSetup | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaBusy, setTwoFaBusy] = useState(false);

  const load2faState = () => {
    fetch("/api/admin/auth/2fa")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setTwoFa(data ?? { enabled: false, pending: false }))
      .catch(() => setTwoFa({ enabled: false, pending: false }));
  };

  useEffect(() => {
    load2faState();
  }, []);

  const post2fa = async (action: "setup" | "confirm" | "disable", code?: string) => {
    setTwoFaBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "2FA-Aktion fehlgeschlagen." });
        return null;
      }
      return data;
    } catch {
      setStatus({ type: "error", message: "Netzwerkfehler bei 2FA-Aktion." });
      return null;
    } finally {
      setTwoFaBusy(false);
    }
  };

  const start2faSetup = async () => {
    const data = await post2fa("setup");
    if (data) setTwoFaSetup(data);
  };

  const confirm2fa = async () => {
    const data = await post2fa("confirm", twoFaCode);
    if (data) {
      setStatus({ type: "success", message: "2FA aktiviert — ab jetzt beim Login erforderlich." });
      setTwoFaSetup(null);
      setTwoFaCode("");
      load2faState();
    }
  };

  const disable2fa = async () => {
    const data = await post2fa("disable", twoFaCode);
    if (data) {
      setStatus({ type: "success", message: "2FA deaktiviert." });
      setTwoFaCode("");
      load2faState();
    }
  };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          const s = data.settings;
          setForm({
            shopName: s.shopName ?? "",
            defaultLanguage: s.defaultLanguage ?? "de",
            shopDescription: s.shopDescription ?? "",
            vatRate: s.vatRate != null ? String(s.vatRate) : "19",
            vatId: s.vatId ?? "",
            freeShippingThreshold:
              s.freeShippingThreshold != null
                ? String(s.freeShippingThreshold)
                : "30",
            shippingFlatRate:
              s.shippingFlatRate != null ? String(s.shippingFlatRate) : "4.99",
            companyName: s.companyName ?? "",
            companyEmail: s.companyEmail ?? "",
            companyPhone: s.companyPhone ?? "",
            companyAddress: s.companyAddress ?? "",
            companyManager: s.companyManager ?? "",
          });
        }
      })
      .catch(() => {
        setStatus({ type: "error", message: "Einstellungen konnten nicht geladen werden." });
      })
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field: keyof SettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const vatRate = parseFloat(form.vatRate);
    const threshold = parseFloat(form.freeShippingThreshold);
    const flatRate = parseFloat(form.shippingFlatRate);

    if (
      isNaN(vatRate) ||
      vatRate < 0 ||
      vatRate > 100 ||
      isNaN(threshold) ||
      threshold < 0 ||
      isNaN(flatRate) ||
      flatRate < 0
    ) {
      setStatus({
        type: "error",
        message: "Bitte gültige Zahlen für MwSt., Versandschwelle und Versandpauschale eingeben.",
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: form.shopName,
          defaultLanguage: form.defaultLanguage,
          shopDescription: form.shopDescription,
          vatRate,
          vatId: form.vatId,
          freeShippingThreshold: threshold,
          shippingFlatRate: flatRate,
          companyName: form.companyName,
          companyEmail: form.companyEmail,
          companyPhone: form.companyPhone,
          companyAddress: form.companyAddress,
          companyManager: form.companyManager,
        }),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Einstellungen gespeichert ✅" });
      } else {
        const data = await res.json().catch(() => null);
        setStatus({
          type: "error",
          message: data?.error || "Fehler beim Speichern.",
        });
      }
    } catch {
      setStatus({ type: "error", message: "Netzwerkfehler." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Einstellungen</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-100 rounded-lg" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Einstellungen</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {status && (
          <div
            className={`rounded-lg border p-4 text-sm ${
              status.type === "success"
                ? "bg-lime-50 border-lime-200 text-lime-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* General Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Allgemein</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Shop-Name</label>
              <input
                type="text"
                value={form.shopName}
                onChange={(e) => updateField("shopName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Shop-Beschreibung</label>
              <textarea
                value={form.shopDescription}
                onChange={(e) => updateField("shopDescription", e.target.value)}
                className={inputClass}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* VAT Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">MwSt. / VAT</h2>
          <p className="text-sm text-gray-500 mb-4">
            Konfigurieren Sie den MwSt.-Satz. Dieser wird automatisch auf alle
            Bestellungen angewendet (Warenkorb, Checkout, Bestell-API).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">MwSt.-Satz (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.vatRate}
                onChange={(e) => updateField("vatRate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">MwSt.-ID (USt-IdNr.)</label>
              <input
                type="text"
                value={form.vatId}
                onChange={(e) => updateField("vatId", e.target.value)}
                className={inputClass}
                placeholder="DE123456789"
              />
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Versand</h2>
          <p className="text-sm text-gray-500 mb-4">
            Kostenloser Versand ab dem angegebenen Bestellwert, darunter gilt
            die Versandpauschale.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kostenloser Versand ab (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.freeShippingThreshold}
                onChange={(e) => updateField("freeShippingThreshold", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Versandpauschale (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.shippingFlatRate}
                onChange={(e) => updateField("shippingFlatRate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Shop-Informationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Unternehmensname (für Impressum)</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-Mail</label>
              <input
                type="email"
                value={form.companyEmail}
                onChange={(e) => updateField("companyEmail", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon</label>
              <input
                type="tel"
                value={form.companyPhone}
                onChange={(e) => updateField("companyPhone", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Adresse</label>
              <input
                type="text"
                value={form.companyAddress}
                onChange={(e) => updateField("companyAddress", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Geschäftsführung</label>
              <input
                type="text"
                value={form.companyManager}
                onChange={(e) => updateField("companyManager", e.target.value)}
                className={inputClass}
                placeholder="Nazia Iqbal"
              />
              <p className="text-xs text-gray-500 mt-1">
                Wird auf Rechnungs-PDFs mitgedruckt.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Zahlungsanbieter</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Stripe</h3>
                <p className="text-sm text-gray-500">Kreditkarte, Apple Pay, Google Pay</p>
              </div>
              <span className="text-sm text-gray-400">Konfiguration über Umgebungsvariablen</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">PayPal</h3>
                <p className="text-sm text-gray-500">PayPal-Zahlungen</p>
              </div>
              <span className="text-sm text-gray-400">Konfiguration über Umgebungsvariablen</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Klarna</h3>
                <p className="text-sm text-gray-500">Kauf auf Rechnung</p>
              </div>
              <span className="text-sm text-gray-400">Konfiguration über Umgebungsvariablen</span>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication (Correction #30) */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Zwei-Faktor-Authentifizierung (2FA)</h2>
          {twoFa === null ? (
            <p className="text-sm text-gray-500">Lade 2FA-Status…</p>
          ) : twoFa.enabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                <ShieldCheck className="w-5 h-5" />
                2FA ist aktiv — der Admin-Login erfordert einen 6-stelligen Code aus Ihrer Authenticator-App.
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                  className={inputClass}
                  placeholder="Aktueller Code"
                  inputMode="numeric"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={disable2fa}
                  disabled={twoFaBusy || twoFaCode.length !== 6}
                  className="text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 font-medium px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  2FA deaktivieren
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Schützen Sie den Admin-Zugang mit einem Einmalcode (TOTP) — kompatibel mit
                Google Authenticator, Microsoft Authenticator, Authy, 1Password, Bitwarden.
              </p>
              {!twoFaSetup ? (
                <button
                  type="button"
                  onClick={start2faSetup}
                  disabled={twoFaBusy}
                  className="bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                >
                  2FA jetzt einrichten
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Schritt 1: Schlüssel in der App eintragen</p>
                    <p className="text-xs text-gray-500 mb-2">
                      In der Authenticator-App „＋“ → „Schlüssel eingeben“ wählen und diesen
                      Base32-Schlüssel übernehmen:
                    </p>
                    <code className="block bg-gray-50 border rounded-lg p-3 font-mono text-sm break-all select-all">
                      {twoFaSetup.secret}
                    </code>
                    <p className="text-xs text-gray-400 mt-1">
                      Kontoname: hausku Admin · Algorithmus: SHA1 · 6 Ziffern · 30 s
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Schritt 2: Mit aktuellem Code bestätigen</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={twoFaCode}
                        onChange={(e) => setTwoFaCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                        className={inputClass}
                        placeholder="6-stelliger Code"
                        inputMode="numeric"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={confirm2fa}
                        disabled={twoFaBusy || twoFaCode.length !== 6}
                        className="bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        2FA aktivieren
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            {saving ? "Speichert..." : "Einstellungen speichern"}
          </button>
        </div>
      </form>
    </div>
  );
}
