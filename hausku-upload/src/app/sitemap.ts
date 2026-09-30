import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

const STATIC_ROUTES = [
  "",
  "/catalog",
  "/about",
  "/contact",
  "/returns",
  "/terms",
  "/privacy",
  "/imprint",
  "/order-lookup",
];

function siteUrl(path: string = ""): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://hausku.com";
  return `${base}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: siteUrl(route),
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: siteUrl(`/product/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: siteUrl(`/catalog?category=${c.slug}`),
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries, ...categoryEntries];
}
