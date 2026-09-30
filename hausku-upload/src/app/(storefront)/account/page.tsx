"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/storefront/AuthContext";
import { useLocale } from "@/components/shared/LocaleContext";

export default function AccountPage() {
  const { user, loading, logout, refresh } = useAuth();
  const { t } = useLocale();

  // Profile editing
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwMessage, setPwMessage] = useState("");

  // Account deletion
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileMessage("");
    try {
      const res = await fetch(`/api/customers/${user?.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Fehler beim Speichern");
        setProfileSaving(false);
        return;
      }
      setProfileMessage(t("account.profileSaved"));
      setEditMode(false);
      refresh?.();
    } catch {
      setProfileError("Netzwerkfehler");
    }
    setProfileSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    setPwError("");
    setPwMessage("");
    try {
      const res = await fetch(`/api/customers/${user?.id}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Fehler beim Ändern des Passworts");
        setPwSaving(false);
        return;
      }
      setPwMessage(t("account.passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setPwError("Netzwerkfehler");
    }
    setPwSaving(false);
  };

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(t("account.deleteAccountConfirm"))) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${user?.id}/profile`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Fehler beim Löschen");
        setDeleting(false);
        return;
      }
      logout();
      window.location.href = "/";
    } catch {
      alert("Netzwerkfehler");
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  // Logged in — show dashboard
  if (user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("account.title")}</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <nav className="space-y-1">
              <Link
                href="/account"
                className="block px-4 py-3 bg-gray-900 text-white rounded-lg font-medium"
              >
                {t("account.overview")}
              </Link>
              <Link
                href="/account/orders"
                className="block px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t("account.orders")}
              </Link>
              <Link
                href="/account/addresses"
                className="block px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t("account.addresses")}
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t("common.logout")}
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">{t("account.welcome")}</h2>
              {editMode ? (
                <form onSubmit={saveName} className="space-y-3 max-w-md">
                  {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
                  {profileMessage && <p className="text-lime-600 text-sm">{profileMessage}</p>}
                  <div>
                    <label className="block text-sm font-medium mb-1">{t("account.name")}</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2.5"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {profileSaving ? t("account.saving") : t("common.save")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setProfileError("");
                      }}
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-900">{t("account.name")}</span>{" "}
                    {user.name || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">{t("account.email")}</span>{" "}
                    {user.email}
                  </p>
                  <button
                    onClick={() => {
                      setNameInput(user.name || "");
                      setEditMode(true);
                    }}
                    className="text-lime-600 hover:text-lime-700 text-sm font-medium"
                  >
                    ✏️ {t("common.edit")}
                  </button>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <Link
                  href="/account/orders"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  {t("account.viewOrders")}
                </Link>
                <Link
                  href="/account/addresses"
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {t("account.manageAddresses")}
                </Link>
              </div>
            </div>

            {/* Password change */}
            <div className="bg-white border rounded-lg p-6 mt-6">
              <h3 className="font-bold mb-3">{t("account.changePassword")}</h3>
              <form onSubmit={changePassword} className="space-y-3 max-w-md">
                {pwMessage && <p className="text-lime-600 text-sm">{pwMessage}</p>}
                {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
                <input
                  type="password"
                  placeholder={t("account.currentPassword")}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5"
                  required
                />
                <input
                  type="password"
                  placeholder={t("account.newPassword")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5"
                  minLength={8}
                  required
                />
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {pwSaving ? t("account.saving") : t("account.changePassword")}
                </button>
              </form>
            </div>

            {/* Danger zone — DSGVO account deletion */}
            <div className="border border-red-200 rounded-lg p-6 mt-6">
              <h3 className="font-bold mb-1 text-red-700">{t("account.deleteAccount")}</h3>
              <p className="text-sm text-gray-500 mb-3">{t("account.deleteAccountHint")}</p>
              {deleteConfirmOpen ? (
                <form onSubmit={deleteAccount} className="space-y-3 max-w-md">
                  <input
                    type="password"
                    placeholder={t("account.currentPassword")}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {deleting ? t("account.saving") : t("account.deleteAccountConfirm")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  {t("account.deleteAccountButton")}
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Logged out — redirect to login
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("account.title")}</h1>
      <p className="text-gray-500 mb-8">{t("account.loginRequired")}</p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/login"
          className="inline-flex items-center bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg"
        >
          {t("account.signIn")}
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-lime-500/25"
        >
          {t("account.createAccount")}
        </Link>
      </div>
    </div>
  );
}
