"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ReturnItem = {
  id: number;
  returnNumber: string;
  status: string;
  reason: string;
  items: Array<{ productName: string; variantLabel?: string | null; qty: number }>;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: number;
    orderNumber: string;
    total: number;
    status: string;
    guestEmail: string | null;
    guestName: string | null;
    items: Array<{
      productName: string;
      variantLabel: string | null;
      qty: number;
      unitPrice: number;
    }>;
    invoice: { id: number; invoiceNumber: string; pdfPath: string | null } | null;
    creditNotes: {
      id: number;
      creditNoteNumber: string;
      pdfPath: string | null;
      reason: string | null;
      amount: number;
    }[];
  };
  customer: { id: number; email: string; name: string | null } | null;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Eingegangen",
  APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt",
  RECEIVED: "Ware erhalten",
  REFUNDED: "Erstattet",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  RECEIVED: "bg-purple-100 text-purple-800",
  REFUNDED: "bg-green-100 text-green-800",
};

// Which statuses the admin can move TO from a given status
const NEXT_ACTIONS: Record<string, { status: string; label: string; tone: string }[]> = {
  PENDING: [
    { status: "APPROVED", label: "Genehmigen", tone: "bg-blue-500 hover:bg-blue-600 text-white" },
    { status: "REJECTED", label: "Ablehnen", tone: "border border-red-300 text-red-600 hover:bg-red-50" },
  ],
  APPROVED: [
    { status: "RECEIVED", label: "Ware erhalten", tone: "bg-purple-500 hover:bg-purple-600 text-white" },
    { status: "REJECTED", label: "Ablehnen", tone: "border border-red-300 text-red-600 hover:bg-red-50" },
  ],
  REJECTED: [
    { status: "APPROVED", label: "Doch genehmigen", tone: "bg-blue-500 hover:bg-blue-600 text-white" },
  ],
  RECEIVED: [
    { status: "REFUNDED", label: "Erstattung veranlassen", tone: "bg-green-500 hover:bg-green-600 text-white" },
    { status: "REJECTED", label: "Ablehnen", tone: "border border-red-300 text-red-600 hover:bg-red-50" },
  ],
  REFUNDED: [],
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function AdminReturnDetailPage() {
  const params = useParams();
  const returnId = params.id as string;

  const [returnRequest, setReturnRequest] = useState<ReturnItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnId]);

  const fetchReturn = async () => {
    try {
      const res = await fetch(`/api/admin/returns/${returnId}`);
      const data = await res.json();
      if (res.ok) {
        setReturnRequest(data.returnRequest);
        setAdminNote(data.returnRequest.adminNote || "");
        setError("");
      } else {
        setError(data.error || "Fehler beim Laden");
      }
    } catch {
      setError("Fehler beim Laden");
    }
    setLoading(false);
  };

  const updateStatus = async (status: string) => {
    if (!returnRequest) return;
    setUpdating(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/returns/${returnRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setReturnRequest(data.returnRequest);
        setAdminNote(data.returnRequest.adminNote || "");
        setMessage(`Status aktualisiert: ${STATUS_LABELS[status] || status}`);
      } else {
        setError(data.error || "Fehler beim Aktualisieren");
      }
    } catch {
      setError("Netzwerkfehler");
    }
    setUpdating(false);
  };

  const saveNote = async () => {
    if (!returnRequest) return;
    setUpdating(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/returns/${returnRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setReturnRequest(data.returnRequest);
        setAdminNote(data.returnRequest.adminNote || "");
        setMessage("Notiz gespeichert.");
      } else {
        setError(data.error || "Fehler beim Speichern");
      }
    } catch {
      setError("Netzwerkfehler");
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Retouren-Details</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-100 rounded-lg" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !returnRequest) {
    return (
      <div>
        <Link href="/admin/returns" className="text-gray-500 hover:text-gray-900 mb-4 inline-block">
          ← Zurück
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error || "Retoure nicht gefunden"}
        </div>
      </div>
    );
  }

  const nextActions = NEXT_ACTIONS[returnRequest.status] || [];
  const parsedItems =
    typeof returnRequest.items === "string"
      ? (JSON.parse(returnRequest.items || "[]") as ReturnItem["items"])
      : returnRequest.items;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/returns" className="text-gray-500 hover:text-gray-900">
            ← Zurück
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Retoure {returnRequest.returnNumber}
          </h1>
        </div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            STATUS_COLORS[returnRequest.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {STATUS_LABELS[returnRequest.status] || returnRequest.status}
        </span>
      </div>

      {message && (
        <div className="mb-6 bg-lime-50 border border-lime-200 text-lime-800 rounded-lg px-4 py-3 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Return info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Retouren-Informationen</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Bestellung</p>
                <Link
                  href={`/admin/orders/${returnRequest.order.id}`}
                  className="font-medium text-lime-600 hover:text-lime-700"
                >
                  {returnRequest.order.orderNumber}
                </Link>
              </div>
              <div>
                <p className="text-gray-500">Kunde</p>
                <p className="font-medium">
                  {returnRequest.customer?.name || returnRequest.order.guestName || "—"}
                </p>
                <p className="text-gray-500 text-xs">
                  {returnRequest.customer?.email || returnRequest.order.guestEmail || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Angefordert am</p>
                <p className="font-medium">
                  {new Date(returnRequest.createdAt).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Bestellstatus</p>
                <p className="font-medium capitalize">{returnRequest.order.status}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-500 text-sm mb-1">Grund</p>
              <p className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg p-3">
                {returnRequest.reason}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-gray-500 text-sm mb-1">Zurückzusendende Artikel</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 divide-y">
                {parsedItems.map((item, i) => (
                  <p key={i} className="text-sm text-gray-700 py-1">
                    {item.productName}
                    {item.variantLabel && (
                      <span className="text-gray-400"> ({item.variantLabel})</span>
                    )}{" "}
                    × {item.qty}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Admin note */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Interne Notiz (wird dem Kunden gemailt)</h2>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="z. B. Rücksendeadresse, Hinweise zur Erstattung…"
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            />
            <button
              onClick={saveNote}
              disabled={updating}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Notiz speichern
            </button>
          </div>

          {/* Credit notes */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Gutschriften</h2>
            {returnRequest.order.creditNotes.length > 0 ? (
              <div className="space-y-2">
                {returnRequest.order.creditNotes.map((cn) => (
                  <div
                    key={cn.id}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <div>
                      <span className="text-sm font-medium">{cn.creditNoteNumber}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatPrice(cn.amount)}
                      </span>
                      {cn.reason && (
                        <span className="text-xs text-gray-500 ml-2">{cn.reason}</span>
                      )}
                    </div>
                    <a
                      href={`/api/admin/credit-notes/${cn.id}/download`}
                      className="text-sm font-semibold text-lime-600 hover:text-lime-700"
                    >
                      PDF herunterladen ↓
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Noch keine Gutschrift erstellt — wird automatisch bei „Erstattet“ erzeugt.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Aktionen</h2>
            {nextActions.length > 0 ? (
              <div className="space-y-2">
                {nextActions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => updateStatus(action.status)}
                    disabled={updating}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${action.tone}`}
                  >
                    {action.label}
                  </button>
                ))}
                <p className="text-xs text-gray-500 pt-1">
                  Bei „Erstattung veranlassen“ wird automatisch eine Gutschrift erstellt und
                  der Kunde per E-Mail informiert.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Keine weiteren Aktionen für diesen Status.</p>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Bestellung</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Betrag</span>
                <span className="font-medium">{formatPrice(returnRequest.order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium capitalize">{returnRequest.order.status}</span>
              </div>
              <div className="pt-2">
                <Link
                  href={`/admin/orders/${returnRequest.order.id}`}
                  className="text-sm font-semibold text-lime-600 hover:text-lime-700"
                >
                  Zur Bestellung →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
