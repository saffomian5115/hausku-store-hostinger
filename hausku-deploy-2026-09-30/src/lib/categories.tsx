export interface Category {
  slug: string;
  icon: string;
  name: { de: string; en: string };
  desc: { de: string; en: string };
}

export const CATEGORIES: Category[] = [
  {
    slug: "kueche",
    icon: "kitchen",
    name: { de: "Küche", en: "Kitchen" },
    desc: { de: "Brotdosen & mehr", en: "Lunch boxes & more" },
  },
  {
    slug: "haushalt",
    icon: "household",
    name: { de: "Haushalt", en: "Household" },
    desc: { de: "Couch Bar & Accessoires", en: "Couch bar & accessories" },
  },
];

/** Helper to get localized category name */
export function getCategoryName(cat: Category, locale: string): string {
  return cat.name[locale as "de" | "en"] || cat.name.de;
}

/** Helper to get localized category description */
export function getCategoryDesc(cat: Category, locale: string): string {
  return cat.desc[locale as "de" | "en"] || cat.desc.de;
}

/** Render a category icon as SVG element */
export function CategoryIconSvg({
  icon,
  className = "w-5 h-5",
}: {
  icon: string;
  className?: string;
}) {
  if (icon === "kitchen") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3v18M7 3l4 4-4 4M7 11l4 4-4 4M17 3v18M17 3l-4 4 4 4M17 11l-4 4 4 4" />
      </svg>
    );
  }
  if (icon === "household") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    );
  }
  return null;
}
