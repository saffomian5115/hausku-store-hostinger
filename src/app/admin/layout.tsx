"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", icon: "📊", label: "Dashboard" },
  { href: "/admin/products", icon: "📦", label: "Produkte" },
  { href: "/admin/orders", icon: "🧾", label: "Bestellungen" },
  { href: "/admin/returns", icon: "↩️", label: "Retouren" },
  { href: "/admin/customers", icon: "👥", label: "Kunden" },
  { href: "/admin/settings", icon: "⚙️", label: "Einstellungen" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-gray-900 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/admin" className="text-lg font-bold">
            hausku <span className="text-gray-400 text-xs font-normal">Admin</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
              title="Store ansehen"
            >
              🏪
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
              title="Abmelden"
            >
              🚪
            </button>
          </div>
        </div>
        <nav className="flex overflow-x-auto gap-1 px-2 pb-2 scrollbar-hide">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors shrink-0"
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white min-h-screen shrink-0">
          <div className="p-6 border-b border-gray-800">
            <Link href="/admin" className="text-xl font-bold">
              hausku <span className="text-gray-400 text-sm font-normal">Admin</span>
            </Link>
          </div>
          <nav className="p-4 space-y-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-800">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400"
            >
              <span>🏪</span> Store ansehen
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 w-full text-left"
            >
              <span>🚪</span> Abmelden
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
