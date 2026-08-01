import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/format";
import { getTranslations } from "@/lib/i18n";
import AddToCartButton from "@/components/storefront/AddToCartButton";
import ProductGallery from "@/components/storefront/ProductGallery";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
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

  // Use first variant as default for add-to-cart (will be refined with variant selection later)
  const defaultVariant = product.variants[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    className="px-4 py-2 border rounded-lg hover:border-gray-900 transition-colors font-medium"
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
              <p className="text-sm text-lime-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-lime-500 rounded-full" />
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
        <div className="mt-8 border rounded-lg p-6 bg-gray-50">
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
    </div>
  );
}
