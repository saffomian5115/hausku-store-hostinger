export default function AdminDashboardPage() {
  const stats = [
    { label: "Umsatz (heute)", value: "€0.00", change: "+0%", color: "text-green-600" },
    { label: "Bestellungen (heute)", value: "0", change: "+0", color: "text-blue-600" },
    { label: "Offene Bestellungen", value: "0", change: "", color: "text-orange-600" },
    { label: "Produkte", value: "0", change: "", color: "text-purple-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
            {stat.change && (
              <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Letzte Bestellungen</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          Noch keine Bestellungen vorhanden.
        </div>
      </div>
    </div>
  );
}
