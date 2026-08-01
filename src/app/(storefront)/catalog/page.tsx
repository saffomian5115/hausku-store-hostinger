import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import ProductCard from "@/components/storefront/ProductCard";
import SortSelect from "@/components/storefront/SortSelect";
import { getTranslations } from "@/lib/i18n";

type SearchParams = {
  category?: string;
  sort?: string;
  q?: string;
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { t } = await getTranslations();
  const params = await searchParams;
  const { category, sort, q } = params;

  const where: Record<string, unknown> = { active: true };
  if (category) {
    where.category = { slug: category };
  }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { basePrice: "asc" };
  if (sort === "price_desc") orderBy = { basePrice: "desc" };
  if (sort === "name") orderBy = { name: "asc" };
  if (sort === "name_desc") orderBy = { name: "desc" };

  const [products, categories, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: { where: { active: true } },
      },
      orderBy,
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { active: true } } } } },
    }),
    prisma.product.count({ where }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  // ── Helper to build URL with params preserved ──
  const buildUrl = (overrides: Record<string, string | null>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (overrides.category !== undefined) {
      if (overrides.category) p.set("category", overrides.category);
      else p.delete("category");
    } else if (category) {
      p.set("category", category);
    }
    if (overrides.sort !== undefined) {
      if (overrides.sort) p.set("sort", overrides.sort);
      else p.delete("sort");
    } else if (sort && sort !== "newest") {
      p.set("sort", sort);
    }
    const qs = p.toString();
    return `/catalog${qs ? `?${qs}` : ""}`;
  };



  let pageTitle = t("catalog.allProducts");
  if (q && activeCategory) {
    pageTitle = `${t("catalog.searchFor")}: "${q}" ${t("catalog.inCategory")} ${activeCategory.name}`;
  } else if (q) {
    pageTitle = `${t("catalog.searchFor")}: "${q}"`;
  } else if (activeCategory) {
    pageTitle = activeCategory.name;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Title ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-gray-500 mt-1">
          {totalCount} {totalCount === 1 ? t("home.product") : t("home.products")}
          {q && (
            <span>
              {" "}für &quot;<span className="font-medium text-gray-900">{q}</span>&quot;
            </span>
          )}
        </p>
      </div>

      {/* ── Top Filter Bar ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Category Pills (scrollable on mobile) */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Link
                href={buildUrl({ category: null, sort: null })}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !category
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {t("catalog.allCategories")}
              </Link>
              {categories.map((cat) => {
                const isActive = category === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={isActive ? buildUrl({ category: null, sort: null }) : buildUrl({ category: cat.slug, sort: null })}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-lime-500 text-white shadow-sm shadow-lime-500/30"
                        : "bg-gray-100 text-gray-600 hover:bg-lime-50 hover:text-lime-600"
                    }`}
                  >
                    {cat.name}
                    <span className={`text-xs ${isActive ? "text-lime-200" : "text-gray-400"}`}>
                      {cat._count.products}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="shrink-0">
            <SortSelect currentSort={sort} />
          </div>
        </div>

        {/* ── Active Filter Chips ── */}
        {(q || activeCategory) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Filter:
            </span>
            {q && (
              <Link
                href={buildUrl({ q: null, category: null })}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-50 text-lime-700 rounded-full text-xs font-medium hover:bg-lime-100 transition-colors group"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {q}
                <span className="ml-0.5 text-lime-400 group-hover:text-lime-600">✕</span>
              </Link>
            )}
            {activeCategory && (
              <Link
                href={buildUrl({ category: null, sort: null })}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-50 text-lime-700 rounded-full text-xs font-medium hover:bg-lime-100 transition-colors group"
              >
                {activeCategory.name}
                <span className="ml-0.5 text-lime-400 group-hover:text-lime-600">✕</span>
              </Link>
            )}
            {(q || activeCategory) && (
              <Link
                href="/catalog"
                className="text-xs text-gray-400 hover:text-gray-600 underline ml-1"
              >
                Alle löschen
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Product Grid ── */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-500">{t("catalog.noProducts")}</p>
          <p className="text-sm text-gray-400 mt-2">
            {q ? t("catalog.tryDifferent") : t("catalog.tryFilter")}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/catalog"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
            >
              {t("catalog.allProducts")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
