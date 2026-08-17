import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/format";
import { getTranslations } from "@/lib/i18n";
import AddToCartButton from "@/components/storefront/AddToCartButton";
import ProductGallery from "@/components/storefront/ProductGallery";
import ReviewForm from "@/components/storefront/ReviewForm";

type Params = { slug: string };

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hausku.com";

function absoluteImage(url: string | null | undefined): string {
  if (!url) return `${siteUrl}/images/og-default.jpg`;
  if (url.startsWith("http")) return url;
  return `${siteUrl}${url}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    select: {
      name: true,
      description: true,
      imageUrl: true,
      category: { select: { name: true } },
    },
  });

  if (!product) {
    return { title: "Produkt nicht gefunden" };
  }

  const title = product.name;
  const description =
    product.description?.slice(0, 155) ||
    `Qualitätsprodukt von hausku — ${product.category.name}.`;
  const image = absoluteImage(product.imageUrl);

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/product/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteUrl}/product/${slug}`,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { t } = await getTranslations();
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: {
      category: true,
      variants: { where: { active: true }, orderBy: { id: "asc" } },
    },
  });

  if (!product) {
    notFound();
  }

  // Get unique sizes and colors from variants
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];
  const colors = product.variants
    .filter((v) => v.colorHex)
    .reduce(
      (acc, v) => {
        if (!acc.find((c) => c.hex === v.colorHex)) {
          acc.push({ name: v.color ?? "", hex: v.colorHex! });
        }
        return acc;
      },
      [] as { name: string; hex: string }[]
    );

  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0);
  const isInStock = totalStock > 0;

  // ── Reviews (approved only) ──
  const [reviews, reviewAgg] = await Promise.all([
    prisma.review.findMany({
      where: { productId: product.id, approved: true, rejected: false },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.aggregate({
      where: { productId: product.id, approved: true, rejected: false },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  // Has the current customer already reviewed this product?
  let myReview: { id: number } | null = null;
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (sessionCookie) {
      const sessionData = JSON.parse(
        Buffer.from(sessionCookie, "base64").toString()
      );
      if (sessionData.expires > Date.now()) {
        myReview = await prisma.review.findFirst({
          where: { customerId: sessionData.id, productId: product.id },
          select: { id: true },
        });
      }
    }
  } catch {
    // ignore malformed session
  }

  const avgRating = reviewAgg._avg.rating
    ? Math.round(reviewAgg._avg.rating * 10) / 10
    : null;
  const reviewCount = reviewAgg._count;

  // Use first variant as default for add-to-cart (will be refined with variant selection later)
  const defaultVariant = product.variants[0];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: absoluteImage(product.imageUrl),
    brand: { "@type": "Brand", name: "hausku" },
    sku: defaultVariant?.sku || undefined,
    category: product.category.name,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: "EUR",
      price: (defaultVariant?.priceOverride ?? product.basePrice).toFixed(2),
      availability: isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(reviewCount > 0 && avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* JSON-LD structured data for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-900">
          {t("product.home")}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-gray-900">
          {t("product.productsLink")}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/catalog?category=${product.category.slug}`}
          className="hover:text-gray-900"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images with 3D Preview */}
        <ProductGallery
          mainImage={product.imageUrl || "/placeholder.jpg"}
          productName={product.name}
          slug={product.slug}
        />

        {/* Product Info */}
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
            {product.category.name}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900">
              {formatPrice(product.basePrice)}
            </p>
            <p className="text-sm text-gray-500 mt-1">{t("product.inclVat")}</p>
          </div>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-3">
                {t("product.selectColor")}
              </h3>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.hex}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                    style={{ backgroundColor: color.hex }}
                    aria-label={color.name}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">
                {t("product.selectSize")}
              </h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className="px-4 py-2 border rounded-2xl hover:border-gray-900 transition-colors font-medium"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-6">
            {isInStock ? (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {t("product.inStock")} ({t("product.stockCount").replace("{count}", totalStock.toString())})
              </p>
            ) : (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                {t("product.outOfStock")}
              </p>
            )}
          </div>

          {/* Add to Cart */}
          {defaultVariant && (
            <div className="mt-8">
              <AddToCartButton
                variantId={defaultVariant.id}
                productId={product.id}
                name={product.name}
                slug={product.slug}
                size={defaultVariant.size}
                color={defaultVariant.color}
                colorHex={defaultVariant.colorHex}
                imageUrl={product.imageUrl}
                unitPrice={defaultVariant.priceOverride ?? product.basePrice}
                stockQty={defaultVariant.stockQty}
                sku={defaultVariant.sku}
              />
            </div>
          )}

          {/* Shipping hint */}
          <p className="text-xs text-gray-500 mt-4">
            {t("product.shippingHint")}
          </p>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t("product.description")}</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* GPSR Info */}
      {(product.manufacturer || product.safetyWarnings) && (
        <div className="mt-8 border rounded-2xl p-6 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-900 mb-3">
            {t("product.gpsrTitle")}
          </h2>
          {product.manufacturer && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t("product.manufacturer")}</span>{" "}
              {product.manufacturer}
            </p>
          )}
          {product.safetyWarnings && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{t("product.safetyWarnings")}</span>{" "}
              {product.safetyWarnings}
            </p>
          )}
        </div>
      )}

      {/* Reviews */}
      <div className="mt-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Kundenbewertungen
            </h2>
            {reviewCount > 0 && avgRating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      filled={star <= Math.round(avgRating)}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({reviewCount} Bewertung{reviewCount !== 1 ? "en" : ""})
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review list */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 bg-gray-50 border border-gray-200 rounded-2xl p-6">
                Noch keine Bewertungen für dieses Produkt.
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= review.rating} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-bold text-gray-900 mb-1">
                      {review.title}
                    </h4>
                  )}
                  {review.body && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.body}
                    </p>
                  )}
                  <p className="text-xs font-medium text-gray-400 mt-3">
                    {review.customer?.name || "Verifizierter Kunde"}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Review form */}
          <div>
            {myReview ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-600">
                Du hast dieses Produkt bereits bewertet. Danke! 🌿
              </div>
            ) : (
              <ReviewForm productId={product.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${
        filled ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
      }`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
