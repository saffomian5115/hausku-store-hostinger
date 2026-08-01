export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Einstellungen</h1>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Allgemein</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Shop-Name</label>
              <input type="text" defaultValue="hausku" className="w-full border rounded-lg px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Standard-Sprache</label>
              <select className="w-full border rounded-lg px-4 py-3">
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Shop-Beschreibung</label>
              <textarea className="w-full border rounded-lg px-4 py-3" rows={3} />
            </div>
          </div>
        </div>

        {/* VAT Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">MwSt. / VAT</h2>
          <p className="text-sm text-gray-500 mb-4">
            Konfigurieren Sie den MwSt.-Satz. Dieser wird automatisch auf alle Bestellungen angewendet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">MwSt.-Satz (%)</label>
              <input type="number" defaultValue="19" className="w-full border rounded-lg px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">MwSt.-ID (USt-IdNr.)</label>
              <input type="text" className="w-full border rounded-lg px-4 py-3" placeholder="DE123456789" />
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Versand</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kostenloser Versand ab (€)</label>
              <input type="number" defaultValue="30" className="w-full border rounded-lg px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Versandpauschale (€)</label>
              <input type="number" defaultValue="4.99" step="0.01" className="w-full border rounded-lg px-4 py-3" />
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">Shop-Informationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Unternehmensname (für Impressum)</label>
              <input type="text" defaultValue="NI Intellect UG" className="w-full border rounded-lg px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-Mail</label>
              <input type="email" className="w-full border rounded-lg px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon</label>
              <input type="tel" className="w-full border rounded-lg px-4 py-3" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Adresse</label>
              <input type="text" className="w-full border rounded-lg px-4 py-3" />
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

        <div className="flex justify-end">
          <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            Einstellungen speichern
          </button>
        </div>
      </div>
    </div>
  );
}
