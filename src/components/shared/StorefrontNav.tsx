"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import MobileNav from "./MobileNav";
import SearchBar from "./SearchBar";
import { useCart } from "@/components/storefront/CartContext";
import { useWishlist } from "@/components/storefront/WishlistContext";
import { useAuth } from "@/components/storefront/AuthContext";
import { CATEGORIES, getCategoryName, getCategoryDesc, CategoryIconSvg } from "@/lib/categories";
import { useLocale } from "@/components/shared/LocaleContext";

export default function StorefrontNav() {
  const { itemCount, cart } = useCart();
  const { likedCount, wishlistProducts } = useWishlist();
  const { user } = useAuth();
  const { t, locale, switchLocale } = useLocale();
  const [catOpen, setCatOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const wishRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);




  // Close ALL dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const targets = [catRef, cartRef, wishRef, accountRef, langRef];
      for (const ref of targets) {
        if (ref.current && ref.current.contains(e.target as Node)) return;
      }
      setCatOpen(false);
      setCartOpen(false);
      setWishOpen(false);
      setAccountOpen(false);
      setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close all other dropdowns when one opens
  const closeOthers = (except: string) => {
    if (except !== "cat") setCatOpen(false);
    if (except !== "cart") setCartOpen(false);
    if (except !== "wish") setWishOpen(false);
    if (except !== "account") setAccountOpen(false);
    if (except !== "lang") setLangOpen(false);
  };

  const cartTotal = cart.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center h-16">
          {/* Left: Hamburger (mobile) + Logo */}
          <div className="flex items-center shrink-0 h-full">
            <MobileNav />
            <Link href="/" className="flex items-center h-full pl-2 pr-4 group">
              <div className="flex items-center h-full">
                <Image
                  src="/mylogo.jpeg"
                  alt="hausku"
                  width={140}
                  height={48}
                  className="h-14 w-auto object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-0.5 flex-1 justify-center">
            <Link href="/" className="relative text-gray-900 hover:text-lime-600 transition-all duration-200 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 group">
              <span>{t("nav.home")}</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-lime-500 rounded-full transition-all duration-300 group-hover:w-8" />
            </Link>

            {/* Produkte Dropdown */}
            <div className="relative" ref={catRef} onMouseEnter={() => { closeOthers("cat"); setCatOpen(true); }} onMouseLeave={() => setCatOpen(false)}>
              <button
                onClick={() => { closeOthers("cat"); setCatOpen(!catOpen); }}
                className="flex items-center gap-1 text-gray-900 hover:text-lime-600 transition-all duration-200 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 group"
              >
                <span>{t("nav.products")}</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${catOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-lime-500 rounded-full transition-all duration-300 group-hover:w-16" />
              </button>
              {catOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
                  <Link href="/catalog" onClick={() => setCatOpen(false)} className="flex items-center gap-3 px-5 py-3 mx-2 rounded-xl hover:bg-gray-50 transition-all group/item">
                    <span className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center group-hover/item:bg-lime-100">
                      <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                    </span>
                    <div><p className="font-semibold text-gray-900 text-sm">{t("nav.allProducts")}</p><p className="text-xs text-gray-400">{t("nav.allProductsDesc")}</p></div>
                    <svg className="w-4 h-4 text-gray-300 ml-auto group-hover/item:text-lime-500 group-hover/item:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                  <div className="my-2 border-t border-gray-100" />
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.slug} href={`/catalog?category=${cat.slug}`} onClick={() => setCatOpen(false)} className="flex items-center gap-3 px-5 py-3 mx-2 rounded-xl hover:bg-gray-50 transition-all group/item">
                      <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover/item:bg-lime-50 group-hover/item:scale-110 transition-all">
                        <CategoryIconSvg icon={cat.icon} className="w-5 h-5 text-gray-700" />
                      </span>
                      <div><p className="font-semibold text-gray-900 text-sm">{getCategoryName(cat, locale)}</p><p className="text-xs text-gray-400">{getCategoryDesc(cat, locale)}</p></div>
                      <svg className="w-4 h-4 text-gray-300 ml-auto group-hover/item:text-lime-500 group-hover/item:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/catalog?sort=newest" className="relative text-gray-900 hover:text-lime-600 transition-all duration-200 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-lime-50 group">
              <span className="flex items-center gap-1"><svg className="w-4 h-4 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>{t("nav.sales")}</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-lime-500 rounded-full transition-all duration-300 group-hover:w-12" />
            </Link>

            <Link href="/about" className="relative text-gray-900 hover:text-lime-600 transition-all duration-200 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 group">
              <span>{t("nav.about")}</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-lime-500 rounded-full transition-all duration-300 group-hover:w-10" />
            </Link>

            <Link href="/contact" className="relative text-gray-900 hover:text-lime-600 transition-all duration-200 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 group">
              <span>{t("nav.contact")}</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-lime-500 rounded-full transition-all duration-300 group-hover:w-10" />
            </Link>
          </div>

          {/* Right: Search + Language + Wishlist + Cart + Account */}
          <div className="flex items-center space-x-0.5 shrink-0 pr-2">
            <SearchBar compact />

            {/* Language Globe Icon + Dropdown */}
            <div className="relative" ref={langRef} onMouseEnter={() => { closeOthers("lang"); setLangOpen(true); }} onMouseLeave={() => setLangOpen(false)}>
              <button
                onClick={() => { closeOthers("lang"); setLangOpen(!langOpen); }}
                className="p-2.5 text-gray-900 hover:text-lime-600 rounded-xl transition-all duration-200 hover:bg-gray-50"
                aria-label="Sprache wechseln"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-0 pt-2 w-44 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                  <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sprache</p>
                  <button
                    onClick={() => { switchLocale("de"); setLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                      locale === "de" ? "bg-lime-50 text-lime-600" : "text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">🇩🇪</span>
                    <span>Deutsch</span>
                    {locale === "de" && <svg className="w-4 h-4 ml-auto text-lime-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </button>
                  <button
                    onClick={() => { switchLocale("en"); setLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                      locale === "en" ? "bg-lime-50 text-lime-600" : "text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">🇬🇧</span>
                    <span>English</span>
                    {locale === "en" && <svg className="w-4 h-4 ml-auto text-lime-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist with hover toolbox */}
            <div className="relative hidden sm:block" ref={wishRef} onMouseEnter={() => { closeOthers("wish"); setWishOpen(true); }} onMouseLeave={() => setWishOpen(false)}>
              <button
                onClick={() => { closeOthers("wish"); setWishOpen(!wishOpen); }}
                data-fly-target="wishlist-icon"
                className="relative p-2.5 text-gray-900 hover:text-lime-500 rounded-xl transition-all duration-200 hover:bg-lime-50"
                aria-label="Merkliste"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                {likedCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-lime-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{likedCount > 99 ? "99+" : likedCount}</span>}
              </button>
              {wishOpen && (
                <div className="absolute top-full right-0 mt-0 pt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <p className="font-bold text-gray-900 text-sm">{t("nav.wishlist")}</p>
                    <p className="text-xs text-gray-400">{likedCount} {likedCount === 1 ? t("product.description") : t("nav.items")} {t("nav.wishlistSaved")}</p>
                  </div>
                  {likedCount === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <svg className="w-10 h-10 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      <p className="text-sm text-gray-500">{t("nav.wishlistEmpty")}</p>
                      <p className="text-xs text-gray-400 mt-1">{t("nav.wishlistHint")}</p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {wishlistProducts.slice(0, 6).map((p) => (
                        <Link key={p.id} href={`/product/${p.slug}`} onClick={() => setWishOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📷</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.category.name}</p>
                            <p className="text-sm font-bold text-lime-500">€{p.basePrice.toFixed(2)}</p>
                          </div>
                        </Link>
                      ))}
                      {wishlistProducts.length > 6 && <p className="text-center text-xs text-gray-400 py-2">+{wishlistProducts.length - 6} weitere</p>}
                    </div>
                  )}
                  {likedCount > 0 && (
                    <div className="px-4 pt-3 border-t border-gray-100">
                      <Link href="/wishlist" onClick={() => setWishOpen(false)} className="block w-full text-center text-sm font-semibold text-lime-500 hover:text-lime-600 py-2 rounded-xl hover:bg-lime-50 transition-colors">
                        {t("nav.viewAllWishlist")}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart with hover toolbox */}
            <div className="relative hidden sm:block" ref={cartRef} onMouseEnter={() => { closeOthers("cart"); setCartOpen(true); }} onMouseLeave={() => setCartOpen(false)}>
              <button
                onClick={() => { closeOthers("cart"); setCartOpen(!cartOpen); }}
                data-fly-target="cart-icon"
                className="relative p-2.5 text-gray-900 hover:text-gray-900 rounded-xl transition-all duration-200 hover:bg-gray-50"
                aria-label="Warenkorb"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-lime-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{itemCount > 99 ? "99+" : itemCount}</span>}
              </button>
              {cartOpen && (
                <div className="absolute top-full right-0 mt-0 pt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <p className="font-bold text-gray-900 text-sm">{t("nav.cart")}</p>
                    <p className="text-xs text-gray-400">{itemCount} {t("nav.items")} · €{cartTotal.toFixed(2)}</p>
                  </div>
                  {itemCount === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <svg className="w-10 h-10 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                      <p className="text-sm text-gray-500">{t("nav.cartEmpty")}</p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {cart.items.slice(0, 5).map((item) => (
                        <Link key={item.variantId} href={`/product/${item.slug}`} onClick={() => setCartOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📷</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.color ? `${item.color} · ` : ""}{item.qty}x €{item.unitPrice.toFixed(2)}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 shrink-0">€{(item.unitPrice * item.qty).toFixed(2)}</span>
                        </Link>
                      ))}
                      {cart.items.length > 5 && <p className="text-center text-xs text-gray-400 py-2">+{cart.items.length - 5} weitere Artikel</p>}
                    </div>
                  )}
                  {itemCount > 0 && (
                    <div className="px-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-500">{t("nav.total")}</span>
                        <span className="text-base font-bold text-gray-900">€{cartTotal.toFixed(2)}</span>
                      </div>
                      <Link href="/cart" onClick={() => setCartOpen(false)} className="block w-full text-center text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 py-3 rounded-xl transition-colors shadow-sm shadow-lime-500/20">
                        {t("nav.checkout")}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account with hover toolbox */}
            <div className="relative hidden sm:block" ref={accountRef} onMouseEnter={() => { closeOthers("account"); setAccountOpen(true); }} onMouseLeave={() => setAccountOpen(false)}>
              <button
                onClick={() => { closeOthers("account"); setAccountOpen(!accountOpen); }}
                className="p-2.5 text-gray-900 hover:text-gray-900 rounded-xl transition-all duration-200 hover:bg-gray-50"
                aria-label="Konto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
              {accountOpen && (
                <div className="absolute top-full right-0 mt-0 pt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
                  {user ? (
                    <>
                      <div className="px-4 pb-3 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center text-lime-500 font-bold text-sm mb-2">{(user.name || user.email)[0].toUpperCase()}</div>
                        <p className="font-bold text-gray-900 text-sm">{user.name || "Konto"}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link href="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> {t("nav.myAccount")}
                      </Link>
                      <Link href="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> {t("nav.orders")}
                      </Link>
                      <Link href="/wishlist" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> {t("nav.wishlist")}
                      </Link>
                      <div className="my-1 border-t border-gray-100" />
                      <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.reload(); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-lime-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> {t("common.logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg> {t("nav.signIn")}
                      </Link>
                      <Link href="/register" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> {t("nav.signUp")}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile links */}
            <Link href="/wishlist" className="relative p-2.5 text-gray-900 sm:hidden rounded-xl hover:bg-lime-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {likedCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-lime-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{likedCount}</span>}
            </Link>
            <Link href="/cart" className="relative p-2.5 text-gray-900 sm:hidden rounded-xl hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-lime-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{itemCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
